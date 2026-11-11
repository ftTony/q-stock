import { indicesForMarket } from "@/lib/market/indices";
import {
  POPULAR_CN,
  POPULAR_CRYPTO,
  POPULAR_HK,
  POPULAR_STOCKS,
  type AssetType,
} from "@/lib/types";
import type { SitemapMarket } from "@/lib/seo/sitemap-symbols";

/**
 * Static crawl peer pool — no API / DB on the request path.
 * Larger than popular-only seed so related links escape the top-10 bubble.
 */
const EXTRA_STOCK = [
  "SPY",
  "QQQ",
  "IWM",
  "AMD",
  "NFLX",
  "AVGO",
  "COST",
  "V",
  "MA",
  "XOM",
  "CVX",
  "WMT",
  "JNJ",
  "UNH",
  "BAC",
  "GS",
  "INTC",
  "CRM",
  "ORCL",
  "ADBE",
] as const;

const EXTRA_HK = [
  "00005",
  "00011",
  "00016",
  "00027",
  "00669",
  "01024",
  "01211",
  "02015",
  "02269",
  "02331",
  "02628",
  "03690",
  "06618",
  "09618",
  "09888",
] as const;

function normalize(market: SitemapMarket, symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (!s) return "";
  if (market === "hk") return s.replace(/\.HK$/i, "").padStart(5, "0");
  return s;
}

function poolFor(market: SitemapMarket): string[] {
  const set = new Set<string>();
  const add = (symbols: readonly string[]) => {
    for (const s of symbols) {
      const n = normalize(market, s);
      if (n) set.add(n);
    }
  };
  if (market === "stock") {
    add(POPULAR_STOCKS);
    add(EXTRA_STOCK);
  } else if (market === "hk") {
    add(POPULAR_HK);
    add(EXTRA_HK);
  } else if (market === "cn") {
    add(POPULAR_CN);
  } else {
    add(POPULAR_CRYPTO);
  }
  for (const idx of indicesForMarket(market)) {
    add([idx.symbol]);
  }
  return [...set].sort();
}

const POOL_CACHE: Partial<Record<SitemapMarket, string[]>> = {};

function pool(market: SitemapMarket): string[] {
  if (!POOL_CACHE[market]) POOL_CACHE[market] = poolFor(market);
  return POOL_CACHE[market]!;
}

/**
 * Neighbor tickers around `symbol` in the static pool (wraps at edges).
 * Falls back to the head of the pool when the symbol is unknown.
 */
export function peerSymbolsAround(
  assetType: AssetType,
  symbol: string,
  limit = 8,
): string[] {
  const market = assetType as SitemapMarket;
  if (!["stock", "hk", "cn", "crypto"].includes(market)) return [];
  const list = pool(market);
  if (!list.length) return [];
  const self = normalize(market, symbol);
  const idx = list.indexOf(self);
  const start = idx >= 0 ? idx : 0;
  const out: string[] = [];
  for (let step = 1; out.length < limit && step < list.length; step++) {
    const left = list[(start - step + list.length) % list.length]!;
    const right = list[(start + step) % list.length]!;
    for (const cand of [right, left]) {
      if (cand === self) continue;
      if (out.includes(cand)) continue;
      out.push(cand);
      if (out.length >= limit) break;
    }
  }
  return out;
}
