import { cachedFetch } from "@/lib/cache";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, SearchResult } from "@/lib/types";
import {
  dec,
  fetchLbHistoryBars,
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import { resolveLongbridgeNames } from "@/lib/market/providers/longbridge-static-names";

export {
  getLongbridgeFilings,
  getLongbridgeNews,
  getLongbridgeCompany,
  getLongbridgeExecutive,
  getLongbridgeEarnings,
  type LongbridgePressItem,
  type LongbridgeNewsItem,
  type LongbridgeCompanyProfile,
  type LongbridgeOfficer,
  type LongbridgeEarningsBundle,
} from "@/lib/market/providers/longbridge-content";

export const longbridgeProvider: MarketDataProvider = {
  id: "longbridge",

  isConfigured() {
    return hasLongbridgeCreds();
  },

  supports(assetType) {
    // Crypto quotes/candles go through Binance / Finnhub
    return assetType === "stock" || assetType === "hk" || assetType === "cn";
  },

  async getQuote(symbol, assetType) {
    if (assetType === "crypto") {
      throw new MarketDataError("Longbridge crypto not preferred", "longbridge");
    }
    const normalized = normalizeSymbol(symbol, assetType);
    const lbSym = toLongbridgeSymbol(normalized, assetType);
    const key = `lb:quote:v3:${assetType}:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const ctx = await getQuoteCtx();
        const [rows, names] = await Promise.all([
          ctx.quote([lbSym]),
          resolveLongbridgeNames([{ symbol: normalized, assetType }]),
        ]);
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
        const name = names.get(normalized);
        let bid: number | undefined;
        let ask: number | undefined;
        let bidSize: number | undefined;
        let askSize: number | undefined;
        try {
          const depth = await ctx.depth(lbSym);
          const b0 = depth?.bids?.[0];
          const a0 = depth?.asks?.[0];
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
        } catch {
          /* depth optional — LV1 may lack order book */
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
          ...(name ? { name } : {}),
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
      (i) =>
        i.assetType === "stock" ||
        i.assetType === "hk" ||
        i.assetType === "cn",
    );
    if (!equityItems.length) return [];

    try {
      const ctx = await getQuoteCtx();
      const map = new Map(
        equityItems.map((i) => {
          const n = normalizeSymbol(i.symbol, i.assetType);
          return [toLongbridgeSymbol(n, i.assetType), { ...i, normalized: n }] as const;
        }),
      );
      const lbKeys = [...map.keys()];
      const [rows, names] = await Promise.all([
        ctx.quote(lbKeys),
        resolveLongbridgeNames(
          equityItems.map((i) => ({
            symbol: normalizeSymbol(i.symbol, i.assetType),
            assetType: i.assetType,
          })),
        ),
      ]);
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
        const name = names.get(meta.normalized);
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
          ...(name ? { name } : {}),
          source: "longbridge",
        });
      }
      return out;
    } catch {
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

  async getIntradayCandles(symbol, assetType, from, to, interval) {
    // Period: Min_1=1, Min_5=4 (longbridge Node SDK enum)
    const period = interval === "5" ? 4 : 1;
    const normalized = normalizeSymbol(symbol, assetType);
    const key = `lb:candle:${interval}m:${normalized}:${from}:${to}`;
    return cachedFetch(key, 30_000, async () => {
      const bars = await fetchLbHistoryBars(
        symbol,
        assetType,
        from,
        to,
        period,
      );
      if (!bars.length) {
        throw new MarketDataError(
          `Longbridge returned no ${interval}m candles`,
          "longbridge",
        );
      }
      return bars;
    });
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType === "crypto") return [];
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const type: AssetType =
      assetType === "hk" ? "hk" : assetType === "cn" ? "cn" : "stock";
    const cleaned = query
      .replace(/\.US$/i, "")
      .replace(/\.HK$/i, "")
      .replace(/^HK\./, "")
      .replace(/^SH\./, "")
      .replace(/^SZ\./, "")
      .replace(/^BJ\./, "");
    const sym = normalizeSymbol(cleaned, type);
    const display =
      type === "hk"
        ? `${sym}.HK`
        : type === "cn"
          ? sym
          : `${sym}.US`;
    return [
      {
        symbol: sym,
        displaySymbol: display,
        description: `${sym} (Longbridge)`,
        assetType: type,
        type: type === "cn" ? "A-Share" : "Common Stock",
      },
    ];
  },
};
