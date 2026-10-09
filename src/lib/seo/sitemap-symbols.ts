import { PrismaClient } from "@prisma/client";
import { cachedFetch } from "@/lib/cache";
import { indicesForMarket } from "@/lib/market/indices";
import { getQuotes } from "@/lib/market";
import {
  getLongbridgeRankBoards,
  isLongbridgeRankConfigured,
} from "@/lib/market/providers/longbridge-rank";
import { getFutuScreenSymbols } from "@/lib/market/providers/futu-rank";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import {
  POPULAR_CN,
  POPULAR_CRYPTO,
  POPULAR_HK,
  POPULAR_STOCKS,
  type AssetType,
} from "@/lib/types";

export type SitemapMarket = "stock" | "hk" | "cn" | "crypto";

const POPULAR: Record<SitemapMarket, readonly string[]> = {
  stock: POPULAR_STOCKS,
  hk: POPULAR_HK,
  cn: POPULAR_CN,
  crypto: POPULAR_CRYPTO,
};

/** How many symbols to pull per equity market from APIs. */
function rankLimit(): number {
  const n = Number(process.env.SITEMAP_RANK_LIMIT || 200);
  if (!Number.isFinite(n)) return 200;
  return Math.min(2000, Math.max(30, Math.floor(n)));
}

function normalizeSymbol(assetType: AssetType, symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (!s) return "";
  if (assetType === "hk") return s.replace(/\.HK$/i, "").padStart(5, "0");
  return s;
}

/** Seed list: popular tickers + market indices (offline fallback). */
export function seedSymbolsForMarket(market: SitemapMarket): string[] {
  const set = new Set<string>();
  for (const s of POPULAR[market]) {
    const n = normalizeSymbol(market, s);
    if (n) set.add(n);
  }
  for (const idx of indicesForMarket(market)) {
    const n = normalizeSymbol(market, idx.symbol);
    if (n) set.add(n);
  }
  return [...set].sort();
}

function addNormalized(
  out: Set<string>,
  market: SitemapMarket,
  symbols: Iterable<string>,
) {
  for (const s of symbols) {
    const n = normalizeSymbol(market, s);
    if (n) out.add(n);
  }
}

/** Longbridge hot/gainers/losers union (one heat fetch under the hood). */
async function symbolsFromLongbridge(market: SitemapMarket): Promise<string[]> {
  if (!isLongbridgeRankConfigured()) return [];
  const limit = rankLimit();
  try {
    const boards = await getLongbridgeRankBoards(market, limit);
    const out = new Set<string>();
    for (const board of [boards.hot, boards.gainers, boards.losers]) {
      for (const q of board) {
        const n = normalizeSymbol(market, q.symbol);
        if (n) out.add(n);
      }
    }
    console.info(`[seo] longbridge symbols ${market}=${out.size}`);
    return [...out];
  } catch (err) {
    console.warn(
      `[seo] longbridge rank failed (${market}):`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/**
 * Futu stock-screen codes only (no full-market snapshots).
 * Used when Longbridge is absent or thin.
 */
async function symbolsFromFutuScreen(market: SitemapMarket): Promise<string[]> {
  if (market === "cn" || market === "crypto") return [];
  if (!isFutuConfigured()) return [];
  try {
    const codes = await getFutuScreenSymbols(market, rankLimit());
    const out = new Set<string>();
    addNormalized(out, market, codes);
    console.info(`[seo] futu screen symbols ${market}=${out.size}`);
    return [...out];
  } catch (err) {
    console.warn(
      `[seo] futu screen failed (${market}):`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/** Popular seed quotes — verifies provider path and pads thin API days. */
async function symbolsFromPopularQuotes(
  market: SitemapMarket,
): Promise<string[]> {
  try {
    const quotes = await getQuotes(
      POPULAR[market].map((s) => ({ symbol: s, assetType: market })),
    );
    const out = new Set<string>();
    for (const q of quotes) {
      const n = normalizeSymbol(market, q.symbol);
      if (n) out.add(n);
    }
    return [...out];
  } catch (err) {
    console.warn(
      `[seo] popular quotes failed (${market}):`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

async function symbolsFromEquityRanks(market: SitemapMarket): Promise<string[]> {
  const out = new Set<string>();

  addNormalized(out, market, await symbolsFromLongbridge(market));

  // Prefer screen list to grow coverage; skip heavy full-market rank snapshots.
  if (out.size < rankLimit()) {
    addNormalized(out, market, await symbolsFromFutuScreen(market));
  }

  if (out.size < 20) {
    addNormalized(out, market, await symbolsFromPopularQuotes(market));
  }

  return [...out];
}

async function symbolsFromCryptoApi(): Promise<string[]> {
  const out = new Set<string>();
  addNormalized(out, "crypto", await symbolsFromPopularQuotes("crypto"));

  // Top USDT pairs by quote volume (Binance public 24hr ticker).
  try {
    const rows = await cachedFetch(
      "seo:binance:ticker24h:usdt:v2",
      6 * 60 * 60_000,
      async () => {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
        return (await res.json()) as Array<{
          symbol?: string;
          quoteVolume?: string;
        }>;
      },
    );
    const usdt = rows
      .filter((r) => typeof r.symbol === "string" && r.symbol.endsWith("USDT"))
      .map((r) => ({
        base: r.symbol!.slice(0, -4),
        vol: Number(r.quoteVolume || 0),
      }))
      .filter((r) => r.base && Number.isFinite(r.vol))
      .sort((a, b) => b.vol - a.vol)
      .slice(0, rankLimit());
    for (const r of usdt) {
      const n = normalizeSymbol("crypto", r.base);
      if (n) out.add(n);
    }
  } catch (err) {
    console.warn(
      "[seo] binance ticker failed:",
      err instanceof Error ? err.message : err,
    );
  }

  return [...out];
}

/** Pull symbols from market rank / exchange APIs (cached ~6h). */
export async function fetchSymbolsFromMarketApi(
  market: SitemapMarket,
): Promise<string[]> {
  const cacheKey = `seo:symbols:api:v2:${market}:${rankLimit()}`;
  return cachedFetch(cacheKey, 6 * 60 * 60_000, async () => {
    if (market === "crypto") return symbolsFromCryptoApi();
    return symbolsFromEquityRanks(market);
  });
}

async function symbolsFromDb(
  market: SitemapMarket,
  prisma: PrismaClient,
): Promise<string[]> {
  const set = new Set<string>();
  try {
    const [watch, alerts, positions, orders] = await Promise.all([
      prisma.watchlistItem.findMany({
        where: { assetType: market },
        distinct: ["symbol"],
        select: { symbol: true },
        take: 2000,
      }),
      prisma.priceAlert.findMany({
        where: { assetType: market },
        distinct: ["symbol"],
        select: { symbol: true },
        take: 2000,
      }),
      prisma.paperPosition.findMany({
        where: { assetType: market },
        distinct: ["symbol"],
        select: { symbol: true },
        take: 2000,
      }),
      prisma.paperOrder.findMany({
        where: { assetType: market, status: "filled" },
        distinct: ["symbol"],
        select: { symbol: true },
        take: 2000,
      }),
    ]);

    for (const row of [...watch, ...alerts, ...positions, ...orders]) {
      const n = normalizeSymbol(market, row.symbol);
      if (n) set.add(n);
    }
  } catch (err) {
    console.warn(`[seo] DB symbol merge failed (${market})`, err);
  }
  return [...set];
}

/**
 * Resolve sitemap tickers: market API ranks → DB activity → popular seed.
 */
export async function resolveSymbolsForMarket(
  market: SitemapMarket,
  prisma?: PrismaClient,
): Promise<string[]> {
  const set = new Set<string>();
  let apiCount = 0;

  try {
    const fromApi = await fetchSymbolsFromMarketApi(market);
    apiCount = fromApi.length;
    for (const s of fromApi) set.add(s);
  } catch (err) {
    console.warn(
      `[seo] market API symbols failed (${market}):`,
      err instanceof Error ? err.message : err,
    );
  }

  let dbCount = 0;
  if (prisma) {
    const fromDb = await symbolsFromDb(market, prisma);
    dbCount = fromDb.length;
    for (const s of fromDb) set.add(s);
  }

  // Always keep a minimal seed so empty API days still have URLs.
  for (const s of seedSymbolsForMarket(market)) set.add(s);

  const list = [...set].sort();
  console.info(
    `[seo] symbols ${market}=${list.length} (api=${apiCount} db=${dbCount} +seed)`,
  );
  return list;
}
