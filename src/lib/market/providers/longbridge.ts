import { cachedFetch } from "@/lib/cache";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

type LbModule = typeof import("longbridge");

let lbPromise: Promise<LbModule> | null = null;
let quoteCtx: InstanceType<LbModule["QuoteContext"]> | null = null;

function hasLongbridgeCreds(): boolean {
  return Boolean(
    process.env.LONGBRIDGE_APP_KEY &&
      process.env.LONGBRIDGE_APP_SECRET &&
      process.env.LONGBRIDGE_ACCESS_TOKEN,
  );
}

async function loadLb(): Promise<LbModule> {
  if (!lbPromise) {
    lbPromise = import("longbridge");
  }
  return lbPromise;
}

async function getCtx(): Promise<InstanceType<LbModule["QuoteContext"]>> {
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

function dec(v: { toNumber(): number } | null | undefined): number {
  if (v == null) return 0;
  try {
    return v.toNumber();
  } catch {
    return Number(String(v)) || 0;
  }
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

async function fetchLbHistoryBars(
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
  const ctx = await getCtx();
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

export const longbridgeProvider: MarketDataProvider = {
  id: "longbridge",

  isConfigured() {
    return hasLongbridgeCreds();
  },

  supports(assetType) {
    // Crypto quotes/candles go through Binance / Finnhub
    return assetType === "stock" || assetType === "hk";
  },

  async getQuote(symbol, assetType) {
    if (assetType === "crypto") {
      throw new MarketDataError("Longbridge crypto not preferred", "longbridge");
    }
    const normalized = normalizeSymbol(symbol, assetType);
    const lbSym = toLongbridgeSymbol(normalized, assetType);
    const key = `lb:quote:${assetType}:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const ctx = await getCtx();
        const rows = await ctx.quote([lbSym]);
        const q = rows[0];
        if (!q) {
          throw new MarketDataError(`No quote for ${lbSym}`, "longbridge");
        }
        const price = dec(q.lastDone);
        const prev = dec(q.prevClose);
        const change = price - prev;
        const percentChange = prev ? (change / prev) * 100 : 0;
        const volume = Number(q.volume ?? 0);
        const turnover = dec(
          (q as { turnover?: { toNumber(): number } | null }).turnover,
        );
        let bid: number | undefined;
        let ask: number | undefined;
        let bidSize: number | undefined;
        let askSize: number | undefined;
        try {
          const depthFn = (
            ctx as {
              depth?: (symbol: string) => Promise<{
                bid?: { price?: { toNumber(): number }; volume?: number }[];
                ask?: { price?: { toNumber(): number }; volume?: number }[];
              }>;
            }
          ).depth;
          if (typeof depthFn === "function") {
            const depth = await depthFn.call(ctx, lbSym);
            const b0 = depth?.bid?.[0];
            const a0 = depth?.ask?.[0];
            const bp = b0?.price != null ? dec(b0.price) : 0;
            const ap = a0?.price != null ? dec(a0.price) : 0;
            if (bp > 0) bid = bp;
            if (ap > 0) ask = ap;
            if (b0?.volume != null && Number(b0.volume) > 0) {
              bidSize = Number(b0.volume);
            }
            if (a0?.volume != null && Number(a0.volume) > 0) {
              askSize = Number(a0.volume);
            }
          }
        } catch {
          /* depth optional */
        }
        return {
          symbol: normalized,
          assetType,
          price,
          change,
          percentChange,
          high: dec(q.high),
          low: dec(q.low),
          open: dec(q.open),
          previousClose: prev,
          timestamp: Math.floor((q.timestamp?.getTime?.() ?? Date.now()) / 1000),
          ...(volume > 0 ? { volume } : {}),
          ...(turnover > 0 ? { turnover } : {}),
          ...(bid != null ? { bid } : {}),
          ...(ask != null ? { ask } : {}),
          ...(bidSize != null ? { bidSize } : {}),
          ...(askSize != null ? { askSize } : {}),
          source: "longbridge" as const,
        } satisfies QuoteWithSource;
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Longbridge quote failed",
        "longbridge",
      );
    }
  },

  async getQuotes(items) {
    const equityItems = items.filter(
      (i) => i.assetType === "stock" || i.assetType === "hk",
    );
    if (!equityItems.length) return [];

    try {
      const ctx = await getCtx();
      const map = new Map(
        equityItems.map((i) => {
          const n = normalizeSymbol(i.symbol, i.assetType);
          return [toLongbridgeSymbol(n, i.assetType), { ...i, normalized: n }] as const;
        }),
      );
      const rows = await ctx.quote([...map.keys()]);
      const out: QuoteWithSource[] = [];
      for (const q of rows) {
        const meta = map.get(q.symbol);
        if (!meta) continue;
        const price = dec(q.lastDone);
        const prev = dec(q.prevClose);
        const change = price - prev;
        const volume = Number(q.volume ?? 0);
        const turnover = dec(
          (q as { turnover?: { toNumber(): number } | null }).turnover,
        );
        out.push({
          symbol: meta.normalized,
          assetType: meta.assetType,
          price,
          change,
          percentChange: prev ? (change / prev) * 100 : 0,
          high: dec(q.high),
          low: dec(q.low),
          open: dec(q.open),
          previousClose: prev,
          timestamp: Math.floor((q.timestamp?.getTime?.() ?? Date.now()) / 1000),
          ...(volume > 0 ? { volume } : {}),
          ...(turnover > 0 ? { turnover } : {}),
          source: "longbridge",
        });
      }
      return out;
    } catch (err) {
      // fall back to sequential
      const results = await Promise.allSettled(
        equityItems.map((i) => longbridgeProvider.getQuote(i.symbol, i.assetType)),
      );
      return results
        .filter((r): r is PromiseFulfilledResult<QuoteWithSource> => r.status === "fulfilled")
        .map((r) => r.value);
    }
  },

  async getDailyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const key = `lb:candle:D:${normalized}:${from}:${to}`;
    return cachedFetch(key, 60_000, () =>
      fetchLbHistoryBars(symbol, assetType, from, to, 14),
    );
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const key = `lb:candle:M:${normalized}:${from}:${to}`;
    return cachedFetch(key, 120_000, () =>
      fetchLbHistoryBars(symbol, assetType, from, to, 16),
    );
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType === "crypto") return [];
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const type: AssetType = assetType === "hk" ? "hk" : "stock";
    const sym = normalizeSymbol(
      query.replace(/\.US$/i, "").replace(/\.HK$/i, "").replace(/^HK\./, ""),
      type,
    );
    return [
      {
        symbol: sym,
        displaySymbol: type === "hk" ? `${sym}.HK` : `${sym}.US`,
        description: `${sym} (Longbridge)`,
        assetType: type,
        type: "Common Stock",
      },
    ];
  },
};
