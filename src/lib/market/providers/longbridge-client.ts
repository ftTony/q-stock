import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar } from "@/lib/types";

export type LbModule = typeof import("longbridge");

let lbPromise: Promise<LbModule> | null = null;
let quoteCtx: InstanceType<LbModule["QuoteContext"]> | null = null;

const contentCtxCache = new Map<
  LbLanguageId,
  InstanceType<LbModule["ContentContext"]>
>();

const fundamentalCtxCache = new Map<
  LbLanguageId,
  InstanceType<LbModule["FundamentalContext"]>
>();

/** Longbridge Language enum: 0=zh-CN, 1=zh-HK, 2=en. */
export type LbLanguageId = 0 | 1 | 2 | "default";

export function hasLongbridgeCreds(): boolean {
  return Boolean(
    process.env.LONGBRIDGE_APP_KEY &&
      process.env.LONGBRIDGE_APP_SECRET &&
      process.env.LONGBRIDGE_ACCESS_TOKEN,
  );
}

export async function loadLb(): Promise<LbModule> {
  if (!lbPromise) {
    lbPromise = import("longbridge");
  }
  return lbPromise;
}

export async function getQuoteCtx(): Promise<
  InstanceType<LbModule["QuoteContext"]>
> {
  if (quoteCtx) return quoteCtx;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
  );
  quoteCtx = lb.QuoteContext.new(config);
  return quoteCtx;
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

/** Map UI locale to Longbridge language id (default keeps env `LONGBRIDGE_LANGUAGE`). */
export function lbLanguage(locale?: string): LbLanguageId {
  const l = (locale || "").toLowerCase();
  if (l.startsWith("zh-cn")) return 0;
  if (l.startsWith("zh")) return 1;
  if (l === "en") return 2;
  return "default";
}

export async function getContentCtx(language: LbLanguageId = "default") {
  const cached = contentCtxCache.get(language);
  if (cached) return cached;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
    language === "default" ? undefined : { language },
  );
  const ctx = lb.ContentContext.new(config);
  contentCtxCache.set(language, ctx);
  return ctx;
}

export async function getFundamentalCtx(language: LbLanguageId = "default") {
  const cached = fundamentalCtxCache.get(language);
  if (cached) return cached;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
    language === "default" ? undefined : { language },
  );
  const ctx = lb.FundamentalContext.new(config);
  fundamentalCtxCache.set(language, ctx);
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
