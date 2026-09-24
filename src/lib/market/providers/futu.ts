import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

/** History K-line: default/max num is 370 per docs. */
const KLINE_PAGE_SIZE = 370;
const KLINE_MAX_PAGES = 20;

type SnapshotRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  last_price?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  prev_close_price?: number;
  update_time?: number;
  volume?: number;
  turnover?: number;
  bid_price?: number;
  ask_price?: number;
  bid_vol?: number;
  ask_vol?: number;
};

type KlineRow = {
  time_key?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

function msToSec(ms?: number): number {
  if (!ms) return Math.floor(Date.now() / 1000);
  return ms > 1e12 ? Math.floor(ms / 1000) : Math.floor(ms);
}

function toDateYmd(unixSec: number): string {
  return new Date(unixSec * 1000).toISOString().slice(0, 10);
}

function displayName(snap: SnapshotRow): string | undefined {
  const n = (snap.sc_name || snap.name || snap.tc_name || "").trim();
  return n || undefined;
}

function mapFutuSnapshot(
  snap: SnapshotRow,
  normalized: string,
  assetType: AssetType,
): QuoteWithSource {
  const price = Number(snap.last_price);
  const prev = Number(snap.prev_close_price ?? 0);
  const change = price - prev;
  const volume = Number(snap.volume ?? 0);
  const turnover = Number(snap.turnover ?? 0);
  const bid = Number(snap.bid_price ?? 0);
  const ask = Number(snap.ask_price ?? 0);
  const bidSize = Number(snap.bid_vol ?? 0);
  const askSize = Number(snap.ask_vol ?? 0);
  const name = displayName(snap);
  return {
    symbol: normalized,
    assetType,
    price,
    change,
    percentChange: prev ? (change / prev) * 100 : 0,
    high: Number(snap.high_price ?? 0),
    low: Number(snap.low_price ?? 0),
    open: Number(snap.open_price ?? 0),
    previousClose: prev,
    timestamp: msToSec(snap.update_time),
    ...(volume > 0 ? { volume } : {}),
    ...(turnover > 0 ? { turnover } : {}),
    ...(bid > 0 ? { bid } : {}),
    ...(ask > 0 ? { ask } : {}),
    ...(bidSize > 0 ? { bidSize } : {}),
    ...(askSize > 0 ? { askSize } : {}),
    ...(name ? { name } : {}),
    source: "futu" as const,
  };
}

function assertEquity(assetType: AssetType): void {
  if (assetType !== "stock" && assetType !== "hk") {
    throw new MarketDataError("Futu supports equities only", "futu");
  }
}

export const futuProvider: MarketDataProvider = {
  id: "futu",

  isConfigured() {
    return isFutuConfigured();
  },

  supports(assetType) {
    return assetType === "stock" || assetType === "hk";
  },

  async getQuote(symbol, assetType) {
    assertEquity(assetType);
    const normalized = normalizeSymbol(symbol, assetType);
    const code = toFutuSymbol(normalized, assetType);
    const key = `futu:quote:v2:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const { data } = await futuRequest<{ snapshot_list?: SnapshotRow[] }>(
          "POST",
          "/api/v1.0/quote/snapshot",
          { body: { code_list: [code] } },
        );
        const snap = data.snapshot_list?.[0];
        if (!snap || !(Number(snap.last_price) > 0)) {
          throw new MarketDataError(`No Futu snapshot for ${code}`, "futu");
        }
        return mapFutuSnapshot(snap, normalized, assetType);
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Futu quote failed",
        "futu",
      );
    }
  },

  async getQuotes(items) {
    const equityItems = items.filter(
      (i) => i.assetType === "stock" || i.assetType === "hk",
    );
    if (!equityItems.length) return [];

    try {
      const codes = equityItems.map((i) =>
        toFutuSymbol(normalizeSymbol(i.symbol, i.assetType), i.assetType),
      );
      // API max 400 symbols per request
      const chunkSize = 400;
      const byCode = new Map<string, SnapshotRow>();
      for (let i = 0; i < codes.length; i += chunkSize) {
        const chunk = codes.slice(i, i + chunkSize);
        const { data } = await futuRequest<{ snapshot_list?: SnapshotRow[] }>(
          "POST",
          "/api/v1.0/quote/snapshot",
          { body: { code_list: chunk } },
        );
        for (const s of data.snapshot_list ?? []) {
          if (s.code) byCode.set(s.code, s);
        }
      }
      const out: QuoteWithSource[] = [];
      for (const item of equityItems) {
        const normalized = normalizeSymbol(item.symbol, item.assetType);
        const code = toFutuSymbol(normalized, item.assetType);
        const snap = byCode.get(code);
        if (!snap || !(Number(snap.last_price) > 0)) continue;
        out.push(mapFutuSnapshot(snap, normalized, item.assetType));
      }
      return out;
    } catch {
      const results = await Promise.allSettled(
        equityItems.map((i) => futuProvider.getQuote(i.symbol, i.assetType)),
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
    return fetchKlines(symbol, assetType, from, to, 2);
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    return fetchKlines(symbol, assetType, from, to, 4);
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType === "crypto") return [];
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const type: AssetType = assetType === "hk" ? "hk" : "stock";
    const bare = query
      .replace(/^(US|HK|SH|SZ|BJ)\./, "")
      .replace(/\.(US|HK)$/, "");
    const sym = normalizeSymbol(bare, type);
    const code = toFutuSymbol(sym, type);

    let description = `${sym} (Futu)`;
    try {
      const { data } = await futuRequest<{
        basic_list?: Array<{
          code?: string;
          name?: string;
          sc_name?: string;
          tc_name?: string;
        }>;
      }>("POST", "/api/v1.0/quote/stock-basicinfo", {
        body: { code_list: [code] },
      });
      const row = data.basic_list?.[0];
      const name = (row?.sc_name || row?.name || row?.tc_name || "").trim();
      if (name) description = name;
    } catch {
      /* search still returns the synthesized code */
    }

    return [
      {
        symbol: sym,
        displaySymbol: code,
        description,
        assetType: type,
        type: "Common Stock",
      },
    ];
  },
};

async function fetchKlines(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  ktype: number,
): Promise<OhlcvBar[]> {
  assertEquity(assetType);
  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:candle:v2:${ktype}:${normalized}:${from}:${to}`;

  return cachedFetch(key, ktype === 2 ? 60_000 : 120_000, async () => {
    const path = `/api/v1.0/quote/${encodeURIComponent(code)}/history-kline`;
    const byTime = new Map<number, OhlcvBar>();
    let endYmd = toDateYmd(to);
    const startYmd = toDateYmd(from);

    for (let page = 0; page < KLINE_MAX_PAGES; page++) {
      const { data, nextTime, hasMore } = await futuRequest<{
        kline_list?: KlineRow[];
        next_time?: number;
      }>("GET", path, {
        query: {
          start: startYmd,
          end: endYmd,
          ktype,
          autype: 1,
          num: KLINE_PAGE_SIZE,
        },
      });

      const rows = data.kline_list ?? [];
      for (const k of rows) {
        const time = msToSec(k.time_key);
        if (time < from || time > to) continue;
        byTime.set(time, {
          time,
          open: Number(k.open ?? 0),
          high: Number(k.high ?? 0),
          low: Number(k.low ?? 0),
          close: Number(k.close ?? 0),
          volume: Number(k.volume ?? 0),
        });
      }

      const cursor = nextTime ?? Number(data.next_time ?? 0);
      const more =
        hasMore === true ||
        (cursor > 0 && rows.length >= KLINE_PAGE_SIZE);
      if (!more || !cursor) break;

      // Paginate backward: next_time → next page's end
      const nextEnd = toDateYmd(msToSec(cursor));
      if (nextEnd >= endYmd || nextEnd < startYmd) break;
      endYmd = nextEnd;
    }

    return [...byTime.values()].sort((a, b) => a.time - b.time);
  });
}
