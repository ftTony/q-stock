import { cachedFetch } from "@/lib/cache";
import { isFutuConfigured, futuRequest } from "@/lib/market/providers/futu-http";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { QuoteWithSource } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

export type FutuRankBoard = "hot" | "gainers" | "losers";

const SCREEN_PAGE_SIZE = 300;
const SNAPSHOT_BATCH_SIZE = 400;
const MAX_SCREEN_PAGES = 100;
const RANK_CACHE_TTL_MS = 120_000;

type ScreenItem = {
  code?: string;
};

type SnapshotRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  last_price?: number;
  prev_close_price?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  update_time?: number;
  volume?: number;
  turnover?: number;
  equity_valid?: boolean;
  suspension?: boolean;
};

function screenMarket(assetType: AssetType): number {
  if (assetType === "hk") return 1;
  if (assetType === "stock") return 2;
  throw new Error("Futu rank lists support US and HK equities only");
}

async function getMarketCodes(assetType: AssetType): Promise<string[]> {
  const codes = new Set<string>();
  let nextKey: string | undefined;

  for (let page = 0; page < MAX_SCREEN_PAGES; page++) {
    const { data, hasMore, nextKey: responseNextKey } = await futuRequest<{
      items?: ScreenItem[];
    }>("POST", "/api/v1.0/quote/stock-screen", {
      body: {
        screen_queries: [
          {
            simple_field_query: {
              simple_field: 1,
              screen_value_list: [screenMarket(assetType)],
            },
          },
        ],
        limit: SCREEN_PAGE_SIZE,
        ...(nextKey ? { next_key: nextKey } : {}),
      },
    });

    for (const item of data.items ?? []) {
      if (item.code) codes.add(item.code);
    }

    if (!hasMore) return [...codes];
    if (!responseNextKey || responseNextKey === "-1") {
      throw new Error("Futu stock screen returned an invalid pagination cursor");
    }
    nextKey = responseNextKey;
  }

  throw new Error(`Futu stock screen exceeded ${MAX_SCREEN_PAGES} pages`);
}

function mapSnapshot(row: SnapshotRow, assetType: AssetType): QuoteWithSource | null {
  const price = Number(row.last_price ?? 0);
  const previousClose = Number(row.prev_close_price ?? 0);
  if (!row.code || !row.equity_valid || row.suspension || !(price > 0)) {
    return null;
  }

  const change = price - previousClose;
  return {
    symbol: normalizeSymbol(row.code, assetType),
    assetType,
    price,
    change,
    percentChange: previousClose > 0 ? (change / previousClose) * 100 : 0,
    high: Number(row.high_price ?? 0),
    low: Number(row.low_price ?? 0),
    open: Number(row.open_price ?? 0),
    previousClose,
    timestamp: row.update_time
      ? Math.floor(row.update_time / 1000)
      : Math.floor(Date.now() / 1000),
    ...(Number(row.volume) > 0 ? { volume: Number(row.volume) } : {}),
    ...(Number(row.turnover) > 0 ? { turnover: Number(row.turnover) } : {}),
    ...(row.sc_name || row.name || row.tc_name
      ? { name: row.sc_name || row.name || row.tc_name }
      : {}),
    source: "futu",
  };
}

async function fetchMarketQuotes(assetType: AssetType): Promise<QuoteWithSource[]> {
  const codes = await getMarketCodes(assetType);
  const quotes: QuoteWithSource[] = [];

  for (let i = 0; i < codes.length; i += SNAPSHOT_BATCH_SIZE) {
    const { data } = await futuRequest<{ snapshot_list?: SnapshotRow[] }>(
      "POST",
      "/api/v1.0/quote/snapshot",
      { body: { code_list: codes.slice(i, i + SNAPSHOT_BATCH_SIZE) } },
    );
    for (const row of data.snapshot_list ?? []) {
      const quote = mapSnapshot(row, assetType);
      if (quote) quotes.push(quote);
    }
  }

  if (!quotes.length) {
    throw new Error(`Futu returned no tradable quotes for ${assetType}`);
  }
  return quotes;
}

async function getCachedMarketQuotes(assetType: AssetType): Promise<QuoteWithSource[]> {
  return cachedFetch(
    `futu:rank:market:v1:${assetType}`,
    RANK_CACHE_TTL_MS,
    () => fetchMarketQuotes(assetType),
  );
}

function sortBoard(
  quotes: QuoteWithSource[],
  board: FutuRankBoard,
  limit: number,
): QuoteWithSource[] {
  const sorted = [...quotes].sort((a, b) => {
    if (board === "hot") return (b.turnover ?? 0) - (a.turnover ?? 0);
    return board === "gainers"
      ? b.percentChange - a.percentChange
      : a.percentChange - b.percentChange;
  });
  return sorted.slice(0, limit);
}

export async function getFutuRankList(
  assetType: AssetType,
  board: FutuRankBoard,
  limit: number,
): Promise<QuoteWithSource[]> {
  if (!isFutuConfigured()) throw new Error("Futu not configured");
  return sortBoard(await getCachedMarketQuotes(assetType), board, limit);
}

export async function getFutuRankBoards(
  assetType: AssetType,
  limit: number,
): Promise<Record<FutuRankBoard, QuoteWithSource[]>> {
  if (!isFutuConfigured()) throw new Error("Futu not configured");
  const quotes = await getCachedMarketQuotes(assetType);
  return {
    hot: sortBoard(quotes, "hot", limit),
    gainers: sortBoard(quotes, "gainers", limit),
    losers: sortBoard(quotes, "losers", limit),
  };
}