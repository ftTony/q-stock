import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import { futuSearchSymbols } from "@/lib/market/providers/futu-search";
import { applyActiveExtendedPrice } from "@/lib/market/providers/longbridge-quote-map";
import { getUsMarketPhase } from "@/lib/market/session";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type {
  AssetType,
  ExtendedSessionQuote,
  OhlcvBar,
  QuoteSession,
} from "@/lib/types";

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
  /** US pre / after / overnight — 0 when session inactive. */
  pre_price?: number;
  pre_high_price?: number;
  pre_low_price?: number;
  pre_volume?: number;
  pre_change_val?: number;
  pre_change_rate?: number;
  after_price?: number;
  after_high_price?: number;
  after_low_price?: number;
  after_volume?: number;
  after_change_val?: number;
  after_change_rate?: number;
  overnight_price?: number;
  overnight_high_price?: number;
  overnight_low_price?: number;
  overnight_volume?: number;
  overnight_change_val?: number;
  overnight_change_rate?: number;
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

function futuNameFields(snap: SnapshotRow): {
  name?: string;
  nameZh?: string;
  nameEn?: string;
} {
  const sc = (snap.sc_name || "").trim();
  const en = (snap.name || "").trim();
  const tc = (snap.tc_name || "").trim();
  const nameZh = sc || tc || undefined;
  const nameEn = en || undefined;
  const name = en || sc || tc || undefined;
  return {
    ...(name ? { name } : {}),
    ...(nameZh ? { nameZh } : {}),
    ...(nameEn ? { nameEn } : {}),
  };
}

function mapFutuSessionQuote(
  price: number | undefined,
  changeVal: number | undefined,
  changeRate: number | undefined,
  high?: number,
  low?: number,
  volume?: number,
): ExtendedSessionQuote | undefined {
  const p = Number(price ?? 0);
  if (!(p > 0)) return undefined;
  return {
    price: p,
    change: Number(changeVal ?? 0),
    percentChange: Number(changeRate ?? 0),
    ...(Number(high) > 0 ? { high: Number(high) } : {}),
    ...(Number(low) > 0 ? { low: Number(low) } : {}),
    ...(Number(volume) > 0 ? { volume: Number(volume) } : {}),
  };
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
  const nameFields = futuNameFields(snap);

  const preMarket =
    assetType === "stock"
      ? mapFutuSessionQuote(
          snap.pre_price,
          snap.pre_change_val,
          snap.pre_change_rate,
          snap.pre_high_price,
          snap.pre_low_price,
          snap.pre_volume,
        )
      : undefined;
  const postMarket =
    assetType === "stock"
      ? mapFutuSessionQuote(
          snap.after_price,
          snap.after_change_val,
          snap.after_change_rate,
          snap.after_high_price,
          snap.after_low_price,
          snap.after_volume,
        )
      : undefined;
  const overnight =
    assetType === "stock"
      ? mapFutuSessionQuote(
          snap.overnight_price,
          snap.overnight_change_val,
          snap.overnight_change_rate,
          snap.overnight_high_price,
          snap.overnight_low_price,
          snap.overnight_volume,
        )
      : undefined;

  let activeSession: QuoteSession = "regular";
  if (assetType === "stock") {
    const phase = getUsMarketPhase();
    if (phase === "pre" && preMarket) activeSession = "pre";
    else if (phase === "post" && postMarket) activeSession = "post";
    else if (phase === "overnight" && overnight) activeSession = "overnight";
    else if (phase === "overnight" && postMarket) activeSession = "post";
    else if (phase === "closed" && postMarket) activeSession = "post";
    else if (phase === "closed" && overnight) activeSession = "overnight";
  }

  const base = {
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
    ...nameFields,
    ...(preMarket ? { preMarket } : {}),
    ...(postMarket ? { postMarket } : {}),
    ...(overnight ? { overnight } : {}),
    activeSession,
    source: "futu" as const,
  } satisfies QuoteWithSource;

  return assetType === "stock" ? applyActiveExtendedPrice(base) : base;
}

function assertEquity(assetType: AssetType): void {
  if (assetType !== "stock" && assetType !== "hk" && assetType !== "cn") {
    throw new MarketDataError("Futu supports equities only", "futu");
  }
}

export const futuProvider: MarketDataProvider = {
  id: "futu",

  isConfigured() {
    return isFutuConfigured();
  },

  supports(assetType) {
    return assetType === "stock" || assetType === "hk" || assetType === "cn";
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
    // Include CN — A-share indices (上证/深成/创业板) go through this path.
    const equityItems = items.filter(
      (i) =>
        i.assetType === "stock" ||
        i.assetType === "hk" ||
        i.assetType === "cn",
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

  async getIntradayCandles(symbol, assetType, from, to, interval) {
    // ktype: 1=1min, 6=5min
    const bars = await fetchKlines(
      symbol,
      assetType,
      from,
      to,
      interval === "5" ? 6 : 1,
    );
    if (!bars.length) {
      throw new MarketDataError(
        `Futu returned no ${interval}m klines`,
        "futu",
      );
    }
    return bars;
  },

  searchSymbols: futuSearchSymbols,
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

  const ttl =
    ktype === 1 || ktype === 6 ? 30_000 : ktype === 2 ? 60_000 : 120_000;
  return cachedFetch(key, ttl, async () => {
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
