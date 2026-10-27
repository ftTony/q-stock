import { resolveLongbridgeCreds } from "@/lib/market/resolve-market-creds";
import {
  fingerprintLongbridge,
  type LongbridgeCreds,
} from "@/lib/market/creds-types";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar } from "@/lib/types";

export type LbModule = typeof import("longbridge");

/** Longbridge Language enum: 0=zh-CN, 1=zh-HK, 2=en. */
export type LbLanguageId = 0 | 1 | 2 | "default";

type QuoteCtx = InstanceType<LbModule["QuoteContext"]>;
type ContentCtx = InstanceType<LbModule["ContentContext"]>;
type FundamentalCtx = InstanceType<LbModule["FundamentalContext"]>;

/**
 * Persist context maps on globalThis so Next.js HMR does not orphan
 * WebSocket connections (account limit is typically 10).
 */
type LbGlobal = {
  lbPromise: Promise<LbModule> | null;
  quote: Map<string, QuoteCtx>;
  content: Map<string, ContentCtx>;
  fundamental: Map<string, FundamentalCtx>;
  /** In-flight create locks — avoid concurrent .new() for the same key. */
  locks: Map<string, Promise<unknown>>;
};

const G = (() => {
  const g = globalThis as typeof globalThis & { __qstockLb?: LbGlobal };
  if (!g.__qstockLb) {
    g.__qstockLb = {
      lbPromise: null,
      quote: new Map(),
      content: new Map(),
      fundamental: new Map(),
      locks: new Map(),
    };
  }
  return g.__qstockLb;
})();

/** Keep ≤2 fingerprints (platform + one BYOK). Hard account cap ≈ 10. */
const MAX_FP = 2;

function requireLongbridgeCreds(): LongbridgeCreds {
  const c = resolveLongbridgeCreds();
  if (!c) {
    throw new MarketDataError(
      "Longbridge credentials not configured for this user",
      "longbridge",
    );
  }
  return c;
}

/** True when platform env or request ALS has Longbridge credentials. */
export function hasLongbridgeCreds(): boolean {
  return Boolean(resolveLongbridgeCreds());
}

export async function loadLb(): Promise<LbModule> {
  if (!G.lbPromise) {
    G.lbPromise = import("longbridge");
  }
  return G.lbPromise;
}

/** Overnight / extended US quotes — off only when env is explicitly false. */
function longbridgeEnableOvernight(): boolean {
  const v = process.env.LONGBRIDGE_ENABLE_OVERNIGHT?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

function makeConfig(
  lb: LbModule,
  creds: LongbridgeCreds,
  language?: LbLanguageId,
) {
  const extra: {
    language?: number;
    enableOvernight?: boolean;
  } = {
    enableOvernight: longbridgeEnableOvernight(),
  };
  if (language !== undefined && language !== "default") {
    extra.language = language;
  }
  return lb.Config.fromApikey(
    creds.appKey,
    creds.appSecret,
    creds.accessToken,
    extra,
  );
}

function trimFpMap<V>(map: Map<string, V>, max: number) {
  while (map.size > max) {
    const first = map.keys().next().value;
    if (first === undefined) break;
    // Node SDK has no close(); orphaned sockets expire server-side in ~1–5min.
    map.delete(first);
  }
}

function mapConnError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (/connections limitation/i.test(msg)) {
    throw new MarketDataError(
      "Longbridge quote connections exhausted (limit 10). Reuse one QuoteContext; wait 1–5 min after restarts, then retry.",
      "longbridge",
    );
  }
  throw err instanceof Error ? err : new Error(msg);
}

async function withCreateLock<T>(key: string, create: () => Promise<T>): Promise<T> {
  const existing = G.locks.get(key);
  if (existing) return existing as Promise<T>;
  const p = create().finally(() => {
    if (G.locks.get(key) === p) G.locks.delete(key);
  });
  G.locks.set(key, p);
  return p;
}

export async function getQuoteCtx(): Promise<QuoteCtx> {
  const creds = requireLongbridgeCreds();
  const key = fingerprintLongbridge(creds);
  const hit = G.quote.get(key);
  if (hit) return hit;

  return withCreateLock(`q:${key}`, async () => {
    const again = G.quote.get(key);
    if (again) return again;
    try {
      const lb = await loadLb();
      const ctx = lb.QuoteContext.new(makeConfig(lb, creds));
      G.quote.set(key, ctx);
      trimFpMap(G.quote, MAX_FP);
      return ctx;
    } catch (err) {
      mapConnError(err);
    }
  });
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

/**
 * One ContentContext per credential fingerprint (not per language).
 * Language is fixed at first create to avoid blowing the connection quota.
 */
export async function getContentCtx(_language: LbLanguageId = "default") {
  const creds = requireLongbridgeCreds();
  const key = fingerprintLongbridge(creds);
  const hit = G.content.get(key);
  if (hit) return hit;

  return withCreateLock(`c:${key}`, async () => {
    const again = G.content.get(key);
    if (again) return again;
    try {
      const lb = await loadLb();
      // Prefer zh-CN for this product; quota cannot afford per-locale sockets.
      const ctx = lb.ContentContext.new(makeConfig(lb, creds, 0));
      G.content.set(key, ctx);
      trimFpMap(G.content, MAX_FP);
      return ctx;
    } catch (err) {
      mapConnError(err);
    }
  });
}

export async function getFundamentalCtx(_language: LbLanguageId = "default") {
  const creds = requireLongbridgeCreds();
  const key = fingerprintLongbridge(creds);
  const hit = G.fundamental.get(key);
  if (hit) return hit;

  return withCreateLock(`f:${key}`, async () => {
    const again = G.fundamental.get(key);
    if (again) return again;
    try {
      const lb = await loadLb();
      const ctx = lb.FundamentalContext.new(makeConfig(lb, creds, 0));
      G.fundamental.set(key, ctx);
      trimFpMap(G.fundamental, MAX_FP);
      return ctx;
    } catch (err) {
      mapConnError(err);
    }
  });
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
  // Period enum: Min_1=1, Min_5=4, Day=14 — minute periods need denser counts
  const barsPerDay =
    period === 1 ? 420 : period === 4 ? 84 : period < 14 ? 50 : 1;
  const count = Math.min(1000, daySpan * barsPerDay + 20);
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
