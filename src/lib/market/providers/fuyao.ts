import { cachedFetch } from "@/lib/cache";
import { isCnIndexThscode } from "@/lib/market/indices";
import {
  fuyaoHistoricalDaily,
  fuyaoIndexSnapshot,
  fuyaoSearchTickers,
  fuyaoSnapshot,
} from "@/lib/market/providers/fuyao-client";
import { normalizeSymbol, toThscode } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

function snapshotToQuote(
  row: Awaited<ReturnType<typeof fuyaoSnapshot>>[number],
  symbol: string,
): QuoteWithSource {
  const price = Number(row.last_price ?? 0);
  const prev = Number(row.prev_price ?? 0);
  const change =
    row.price_change != null ? Number(row.price_change) : price - prev;
  const percentChange =
    row.price_change_ratio_pct != null
      ? Number(row.price_change_ratio_pct)
      : prev
        ? (change / prev) * 100
        : 0;
  const volume = Number(row.volume ?? 0);
  const turnover = Number(row.turnover ?? 0);
  return {
    symbol,
    assetType: "cn",
    price,
    change,
    percentChange,
    high: Number(row.high_price ?? price),
    low: Number(row.low_price ?? price),
    open: Number(row.open_price ?? price),
    previousClose: prev || price,
    timestamp: Math.floor(Date.now() / 1000),
    ...(volume > 0 ? { volume } : {}),
    ...(turnover > 0 ? { turnover } : {}),
    source: "fuyao",
  };
}

export const fuyaoProvider: MarketDataProvider = {
  id: "fuyao",

  isConfigured() {
    // Temporarily disabled — A-shares use Longbridge / Futu.
    // Re-enable: import hasFuyaoCreds and `return hasFuyaoCreds();`
    return false;
  },

  supports(assetType) {
    return assetType === "cn";
  },

  async getQuote(symbol, assetType) {
    if (assetType !== "cn") {
      throw new MarketDataError("Fuyao only supports A-shares", "fuyao");
    }
    const normalized = normalizeSymbol(symbol, "cn");
    const thscode = toThscode(normalized);
    const isIndex = isCnIndexThscode(thscode);
    const key = `fuyao:quote:${isIndex ? "idx:" : ""}${thscode}`;
    try {
      return await cachedFetch(key, 15_000, async () => {
        const rows = isIndex
          ? await fuyaoIndexSnapshot([thscode])
          : await fuyaoSnapshot([thscode]);
        const row = rows[0];
        if (!row || !(Number(row.last_price) > 0)) {
          throw new MarketDataError(`No Fuyao quote for ${thscode}`, "fuyao");
        }
        return snapshotToQuote(row, normalized);
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Fuyao quote failed",
        "fuyao",
      );
    }
  },

  async getQuotes(items) {
    const cnItems = items.filter((i) => i.assetType === "cn");
    if (!cnItems.length) return [];
    const mapped = cnItems.map((i) => {
      const normalized = normalizeSymbol(i.symbol, "cn");
      const thscode = toThscode(normalized);
      return {
        normalized,
        thscode,
        isIndex: isCnIndexThscode(thscode),
      };
    });
    try {
      const stockCodes = mapped.filter((m) => !m.isIndex).map((m) => m.thscode);
      const indexCodes = mapped.filter((m) => m.isIndex).map((m) => m.thscode);
      const [stockRows, indexRows] = await Promise.all([
        stockCodes.length ? fuyaoSnapshot(stockCodes) : Promise.resolve([]),
        indexCodes.length ? fuyaoIndexSnapshot(indexCodes) : Promise.resolve([]),
      ]);
      const byCode = new Map(
        [...stockRows, ...indexRows].map((r) => [r.thscode.toUpperCase(), r]),
      );
      const out: QuoteWithSource[] = [];
      for (const m of mapped) {
        const row = byCode.get(m.thscode.toUpperCase());
        if (!row || !(Number(row.last_price) > 0)) continue;
        out.push(snapshotToQuote(row, m.normalized));
      }
      return out;
    } catch (err) {
      console.warn(
        "[fuyao] batch quotes failed:",
        err instanceof Error ? err.message : err,
      );
      const results = await Promise.allSettled(
        cnItems.map((i) => fuyaoProvider.getQuote(i.symbol, i.assetType)),
      );
      return results
        .filter(
          (r): r is PromiseFulfilledResult<QuoteWithSource> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);
    }
  },

  async getDailyCandles(symbol, assetType, from, to) {
    if (assetType !== "cn") {
      throw new MarketDataError("Fuyao only supports A-shares", "fuyao");
    }
    const normalized = normalizeSymbol(symbol, "cn");
    const thscode = toThscode(normalized);
    const key = `fuyao:candle:D:${thscode}:${from}:${to}`;
    return cachedFetch(key, 60_000, async () => {
      const bars = await fuyaoHistoricalDaily(thscode, from, to);
      const out: OhlcvBar[] = [];
      for (const b of bars) {
        const ms = Number(b.date_ms ?? b.timestamp ?? 0);
        if (!ms) continue;
        out.push({
          time: Math.floor(ms / 1000),
          open: Number(b.open_price ?? 0),
          high: Number(b.high_price ?? 0),
          low: Number(b.low_price ?? 0),
          close: Number(b.close_price ?? 0),
          volume: Number(b.volume ?? 0),
        });
      }
      return out.sort((a, b) => a.time - b.time);
    });
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    // Aggregate from daily — same as other providers that lack native month bars.
    const daily = await this.getDailyCandles(symbol, assetType, from, to);
    const byMonth = new Map<string, OhlcvBar>();
    for (const bar of daily) {
      const d = new Date(bar.time * 1000);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      const prev = byMonth.get(key);
      if (!prev) {
        byMonth.set(key, { ...bar });
        continue;
      }
      prev.high = Math.max(prev.high, bar.high);
      prev.low = Math.min(prev.low, bar.low);
      prev.close = bar.close;
      prev.volume += bar.volume;
      prev.time = bar.time;
    }
    return [...byMonth.values()].sort((a, b) => a.time - b.time);
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType !== "cn") return [];
    const query = q.trim();
    if (!query) return [];
    try {
      const hits = await fuyaoSearchTickers(query, 20);
      return hits
        .flatMap((h) => {
          const thscode = (h.thscode || "").toUpperCase();
          if (!thscode.includes(".")) return [];
          const sym = normalizeSymbol(thscode, "cn");
          const row: SearchResult = {
            symbol: sym,
            displaySymbol: sym,
            description: h.name?.trim() || sym,
            assetType: "cn",
            type: "A-Share",
          };
          return [row];
        });
    } catch (err) {
      console.warn(
        "[fuyao] search failed:",
        err instanceof Error ? err.message : err,
      );
      // Fallback: treat query as a code
      try {
        const sym = normalizeSymbol(query, "cn");
        return [
          {
            symbol: sym,
            displaySymbol: sym,
            description: sym,
            assetType: "cn",
            type: "A-Share",
          },
        ];
      } catch {
        return [];
      }
    }
  },
};
