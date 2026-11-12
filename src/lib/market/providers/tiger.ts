import { cachedFetch } from "@/lib/cache";
import {
  chunkTigerSymbols,
  isTigerConfigured,
  tigerExecute,
} from "@/lib/market/providers/tiger-http";
import {
  mapTigerBrief,
  mapTigerKlineItems,
  tigerBriefSymbol,
  type TigerBriefRaw,
  type TigerKlineBlock,
} from "@/lib/market/providers/tiger-quote-map";
import {
  normalizeSymbol,
  tigerMarketBiz,
  toTigerSymbol,
} from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

/** Bounded kline pagination (small-server). */
const KLINE_PAGE_SIZE = 300;
const KLINE_MAX_PAGES = 8;
const KLINE_TOTAL_CAP = 1200;

function assertEquity(assetType: AssetType): void {
  if (assetType !== "stock" && assetType !== "hk" && assetType !== "cn") {
    throw new MarketDataError("Tiger supports equities only", "tiger");
  }
}

async function fetchBriefs(
  symbols: string[],
  assetType: AssetType,
): Promise<TigerBriefRaw[]> {
  const market = tigerMarketBiz(assetType);
  const out: TigerBriefRaw[] = [];
  for (const chunk of chunkTigerSymbols(symbols)) {
    const data = await tigerExecute<TigerBriefRaw[] | TigerBriefRaw>(
      "quote_real_time",
      {
        symbols: chunk,
        include_hour_trading: true,
        ...market,
      },
    );
    if (Array.isArray(data)) out.push(...data);
    else if (data && typeof data === "object") out.push(data);
  }
  return out;
}

async function fetchKlines(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  period: "day" | "month",
): Promise<OhlcvBar[]> {
  assertEquity(assetType);
  const normalized = normalizeSymbol(symbol, assetType);
  const wire = toTigerSymbol(normalized, assetType);
  const key = `tiger:candle:v1:${period}:${normalized}:${from}:${to}`;
  const ttl = period === "day" ? 60_000 : 120_000;

  return cachedFetch(key, ttl, async () => {
    const beginTime = from * 1000;
    const endTime = to * 1000;
    const market = tigerMarketBiz(assetType);
    const byTime = new Map<number, OhlcvBar>();
    let pageToken: string | undefined;

    for (let page = 0; page < KLINE_MAX_PAGES; page++) {
      const biz: Record<string, unknown> = {
        symbols: [wire],
        period,
        begin_time: beginTime,
        end_time: endTime,
        limit: KLINE_PAGE_SIZE,
        right: "br",
        ...market,
      };
      if (pageToken) biz.page_token = pageToken;

      const data = await tigerExecute<TigerKlineBlock[] | TigerKlineBlock>(
        "kline",
        biz,
      );
      const blocks = Array.isArray(data) ? data : data ? [data] : [];
      let next: string | undefined;
      for (const block of blocks) {
        const items = block.items ?? [];
        for (const bar of mapTigerKlineItems(items)) {
          if (bar.time < from || bar.time > to) continue;
          byTime.set(bar.time, bar);
        }
        next =
          (block.nextPageToken || block.next_page_token || "").trim() ||
          undefined;
      }

      if (!next || byTime.size >= KLINE_TOTAL_CAP) break;
      pageToken = next;
    }

    return [...byTime.values()].sort((a, b) => a.time - b.time);
  });
}

export const tigerProvider: MarketDataProvider = {
  id: "tiger",

  isConfigured() {
    return isTigerConfigured();
  },

  supports(assetType) {
    return assetType === "stock" || assetType === "hk" || assetType === "cn";
  },

  async getQuote(symbol, assetType) {
    assertEquity(assetType);
    const normalized = normalizeSymbol(symbol, assetType);
    const wire = toTigerSymbol(normalized, assetType);
    const key = `tiger:quote:v1:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const rows = await fetchBriefs([wire], assetType);
        const raw =
          rows.find((r) => tigerBriefSymbol(r) === wire.toUpperCase()) ??
          rows[0];
        const mapped = raw ? mapTigerBrief(raw, normalized, assetType) : null;
        if (!mapped) {
          throw new MarketDataError(`No Tiger quote for ${wire}`, "tiger");
        }
        return mapped;
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Tiger quote failed",
        "tiger",
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
      const byAsset = new Map<AssetType, typeof equityItems>();
      for (const item of equityItems) {
        const list = byAsset.get(item.assetType) ?? [];
        list.push(item);
        byAsset.set(item.assetType, list);
      }

      const byWire = new Map<string, TigerBriefRaw>();
      for (const [assetType, group] of byAsset) {
        const wires = group.map((i) =>
          toTigerSymbol(normalizeSymbol(i.symbol, i.assetType), i.assetType),
        );
        const rows = await fetchBriefs(wires, assetType);
        for (const row of rows) {
          const sym = tigerBriefSymbol(row);
          if (sym) byWire.set(sym, row);
        }
      }

      const out: QuoteWithSource[] = [];
      for (const item of equityItems) {
        const normalized = normalizeSymbol(item.symbol, item.assetType);
        const wire = toTigerSymbol(normalized, item.assetType).toUpperCase();
        const raw = byWire.get(wire);
        if (!raw) continue;
        const mapped = mapTigerBrief(raw, normalized, item.assetType);
        if (mapped) out.push(mapped);
      }
      return out;
    } catch {
      const results = await Promise.allSettled(
        equityItems.map((i) => tigerProvider.getQuote(i.symbol, i.assetType)),
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
    const bars = await fetchKlines(symbol, assetType, from, to, "day");
    if (!bars.length) {
      throw new MarketDataError("Tiger returned no daily klines", "tiger");
    }
    return bars;
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    const bars = await fetchKlines(symbol, assetType, from, to, "month");
    if (!bars.length) {
      throw new MarketDataError("Tiger returned no monthly klines", "tiger");
    }
    return bars;
  },

  async searchSymbols(_q, _assetType): Promise<SearchResult[]> {
    return [];
  },
};
