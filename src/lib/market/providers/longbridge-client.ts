import { getMarketCreds } from "@/lib/market/creds-context";
import {
  fingerprintLongbridge,
  type LongbridgeCreds,
} from "@/lib/market/creds-types";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar } from "@/lib/types";

export type LbModule = typeof import("longbridge");

let lbPromise: Promise<LbModule> | null = null;

const quoteCtxCache = new Map<
  string,
  InstanceType<LbModule["QuoteContext"]>
>();
const contentCtxCache = new Map<
  string,
  InstanceType<LbModule["ContentContext"]>
>();
const fundamentalCtxCache = new Map<
  string,
  InstanceType<LbModule["FundamentalContext"]>
>();

const MAX_CTX = 32;

function trimMap<K, V>(map: Map<K, V>, max: number) {
  while (map.size > max) {
    const first = map.keys().next().value;
    if (first === undefined) break;
    map.delete(first);
  }
}

/** Longbridge Language enum: 0=zh-CN, 1=zh-HK, 2=en. */
export type LbLanguageId = 0 | 1 | 2 | "default";

function requireLongbridgeCreds(): LongbridgeCreds {
  const c = getMarketCreds().longbridge;
  if (!c) {
    throw new MarketDataError(
      "Longbridge credentials not configured for this user",
      "longbridge",
    );
  }
  return c;
}

/** True when the current request ALS has Longbridge BYOK credentials. */
export function hasLongbridgeCreds(): boolean {
  return Boolean(getMarketCreds().longbridge);
}

export async function loadLb(): Promise<LbModule> {
  if (!lbPromise) {
    lbPromise = import("longbridge");
  }
  return lbPromise;
}

function makeConfig(
  lb: LbModule,
  creds: LongbridgeCreds,
  language?: LbLanguageId,
) {
  return lb.Config.fromApikey(
    creds.appKey,
    creds.appSecret,
    creds.accessToken,
    language === undefined || language === "default"
      ? undefined
      : { language },
  );
}

export async function getQuoteCtx(): Promise<
  InstanceType<LbModule["QuoteContext"]>
> {
  const creds = requireLongbridgeCreds();
  const key = fingerprintLongbridge(creds);
  const hit = quoteCtxCache.get(key);
  if (hit) return hit;
  const lb = await loadLb();
  const ctx = lb.QuoteContext.new(makeConfig(lb, creds));
  quoteCtxCache.set(key, ctx);
  trimMap(quoteCtxCache, MAX_CTX);
  return ctx;
}

/** @deprecated Prefer getQuoteCtx */
export const getCtx = getQuoteCtx;

export function dec(v: { toNumber(): number } | null | undefined): number {
  if (v == null) return 0;
  try {
    return v.toNumber();
  } catch {
    return Number(String(v)) || 0;
  }
}

/** Map UI locale to Longbridge language id (default keeps SDK default). */
export function lbLanguage(locale?: string): LbLanguageId {
  const l = (locale || "").toLowerCase();
  if (l.startsWith("zh-cn")) return 0;
  if (l.startsWith("zh")) return 1;
  if (l === "en") return 2;
  return "default";
}

export async function getContentCtx(language: LbLanguageId = "default") {
  const creds = requireLongbridgeCreds();
  const key = `${fingerprintLongbridge(creds)}:c:${language}`;
  const cached = contentCtxCache.get(key);
  if (cached) return cached;
  const lb = await loadLb();
  const ctx = lb.ContentContext.new(makeConfig(lb, creds, language));
  contentCtxCache.set(key, ctx);
  trimMap(contentCtxCache, MAX_CTX);
  return ctx;
}

export async function getFundamentalCtx(language: LbLanguageId = "default") {
  const creds = requireLongbridgeCreds();
  const key = `${fingerprintLongbridge(creds)}:f:${language}`;
  const cached = fundamentalCtxCache.get(key);
  if (cached) return cached;
  const lb = await loadLb();
  const ctx = lb.FundamentalContext.new(makeConfig(lb, creds, language));
  fundamentalCtxCache.set(key, ctx);
  trimMap(fundamentalCtxCache, MAX_CTX);
  return ctx;
}

export function strOrUndef(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v);
}

function unixToNaiveDate(
  lb: LbModule,
  unixSec: number,
): InstanceType<LbModule["NaiveDate"]> {
  const d = new Date(unixSec * 1000);
  return new lb.NaiveDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

function mapLbCandles(
  sticks: {
    timestamp: { getTime(): number };
    open: { toNumber(): number } | null;
    high: { toNumber(): number } | null;
    low: { toNumber(): number } | null;
    close: { toNumber(): number } | null;
    volume?: number | null;
  }[],
  from: number,
  to: number,
): OhlcvBar[] {
  return sticks
    .map((c) => ({
      time: Math.floor(c.timestamp.getTime() / 1000),
      open: dec(c.open),
      high: dec(c.high),
      low: dec(c.low),
      close: dec(c.close),
      volume: c.volume ?? 0,
    }))
    .filter((b) => b.time >= from && b.time <= to)
    .sort((a, b) => a.time - b.time);
}

export async function fetchLbHistoryBars(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  period: number,
): Promise<OhlcvBar[]> {
  if (assetType === "crypto") {
    throw new MarketDataError("Longbridge crypto candles unsupported", "longbridge");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const lb = await loadLb();
  const ctx = await getQuoteCtx();
  const start = unixToNaiveDate(lb, from);
  const end = unixToNaiveDate(lb, to);

  try {
    const sticks = await ctx.historyCandlesticksByDate(
      lbSym,
      period,
      0, // AdjustType.NoAdjust
      start,
      end,
      0, // TradeSessions.Intraday
    );
    const bars = mapLbCandles(sticks, from, to);
    if (bars.length) return bars;
  } catch (err) {
    console.warn(
      "[longbridge] historyCandlesticksByDate failed, fallback to candlesticks:",
      err instanceof Error ? err.message : err,
    );
  }

  // Fallback: latest-N window (works near "now", not deep history)
  const daySpan = Math.max(1, Math.ceil((to - from) / 86400));
  const count = Math.min(1000, daySpan + 5);
  const sticks = await ctx.candlesticks(lbSym, period, count, 0, 0);
  const bars = mapLbCandles(sticks, from, to);
  if (!bars.length) {
    throw new MarketDataError(
      `Longbridge has no candles for ${lbSym} in ${from}-${to}`,
      "longbridge",
    );
  }
  return bars;
}
