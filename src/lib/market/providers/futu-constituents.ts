import { cachedFetch } from "@/lib/cache";
import { INDEX_FUTU, isMarketIndexSymbol } from "@/lib/market/indices";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type {
  IndexConstituent,
  IndexConstituentsPage,
} from "@/lib/market/providers/longbridge-constituents";
import { getIndexConstituents } from "@/lib/market/providers/longbridge-constituents";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

/**
 * Full constituents list via Futu stock-screen (cursor pagination) enriched
 * with Futu quote snapshots (PE/PB/dividend/OHLC/bid-ask...).
 *
 * Longbridge `constituent` only returns 20 rows, so it is kept as a fallback
 * for when Futu BYOK credentials are unavailable.
 */

const PAGE_SIZE = 50;
const SNAPSHOT_CHUNK = 400;

type ScreenItem = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
};

type SnapRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  last_price?: number;
  prev_close_price?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  volume?: number;
  turnover?: number;
  turnover_rate?: number;
  amplitude?: number;
  volume_ratio?: number;
  pe_ttm_ratio?: number;
  pb_ratio?: number;
  dividend_ttm?: number;
  dividend_ratio_ttm?: number;
  earning_per_share?: number;
  total_market_val?: number;
  circular_market_val?: number;
  bid_price?: number;
  ask_price?: number;
  bid_vol?: number;
  ask_vol?: number;
  close_price_5min?: number;
};

function finite(v: number | null | undefined): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Ignore Futu's zero placeholders for optional fundamental fields. */
function positive(v: number | null | undefined): number | undefined {
  const n = finite(v);
  return n != null && n > 0 ? n : undefined;
}

function screenQuery(symbol: string, assetType: AssetType) {
  const upper = symbol.toUpperCase().trim();
  const futuIndex = INDEX_FUTU[upper];
  // HK indices have a numeric INDEX_ID understood by stock-screen.
  if (assetType === "hk" && futuIndex?.startsWith("HK.")) {
    const indexId = Number(futuIndex.slice(3));
    if (Number.isInteger(indexId) && indexId > 0) {
      return {
        screen_queries: [
          {
            simple_field_query: {
              simple_field: 3,
              screen_value_list: [indexId],
            },
          },
        ],
      };
    }
  }
  // US/CN index constituents are not exposed by Futu's INDEX_ID filter;
  // the page then covers the full underlying market, sorted by day change.
  const market = assetType === "hk" ? 1 : assetType === "cn" ? 3 : 2;
  return {
    screen_queries: [
      {
        simple_field_query: {
          simple_field: 1,
          screen_value_list: [market],
        },
      },
      // Skip sub-$1 OTC micro-caps that dominate a raw gainers ranking.
      {
        simple_property_query: {
          property: { name: 2201 },
          lower: { value: 1000, includes: true },
        },
      },
    ],
  };
}

async function fetchSnapshots(codes: string[]): Promise<Map<string, SnapRow>> {
  const byCode = new Map<string, SnapRow>();
  const unique = [...new Set(codes.filter(Boolean))];
  for (let i = 0; i < unique.length; i += SNAPSHOT_CHUNK) {
    const chunk = unique.slice(i, i + SNAPSHOT_CHUNK);
    try {
      const { data } = await futuRequest<{ snapshot_list?: SnapRow[] }>(
        "POST",
        "/api/v1.0/quote/snapshot",
        { body: { code_list: chunk } },
      );
      for (const row of data.snapshot_list ?? []) {
        if (row.code) byCode.set(row.code, row);
      }
    } catch (err) {
      console.warn(
        "[futu-constituents] snapshot failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }
  return byCode;
}

function mapRow(
  item: ScreenItem,
  snap: SnapRow | undefined,
  assetType: AssetType,
): IndexConstituent | null {
  const rawCode = String(item.code || "").trim();
  if (!rawCode) return null;
  const price = positive(snap?.last_price) ?? 0;
  if (!(price > 0)) return null;

  const prevClose = positive(snap?.prev_close_price);
  const percentChange =
    prevClose && prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
  const fiveMin = positive(snap?.close_price_5min);
  const eps = finite(snap?.earning_per_share) ?? 0;
  const dividend = positive(snap?.dividend_ttm);

  return {
    symbol: normalizeSymbol(rawCode, assetType),
    name:
      String(item.sc_name || snap?.sc_name || item.name || snap?.name || "")
        .trim() || rawCode,
    price,
    percentChange,
    change: prevClose ? price - prevClose : undefined,
    volume: Math.max(0, finite(snap?.volume) ?? 0),
    turnover: Math.max(0, finite(snap?.turnover) ?? 0),
    peTtm: finite(snap?.pe_ttm_ratio),
    pb: finite(snap?.pb_ratio),
    dividendYieldTtm: finite(snap?.dividend_ratio_ttm),
    dividendTtm: dividend,
    payoutRatio: dividend != null && eps > 0 ? (dividend / eps) * 100 : undefined,
    open: positive(snap?.open_price),
    prevClose,
    high: positive(snap?.high_price),
    low: positive(snap?.low_price),
    bid: positive(snap?.bid_price),
    ask: positive(snap?.ask_price),
    bidVol: finite(snap?.bid_vol),
    askVol: finite(snap?.ask_vol),
    amplitude: finite(snap?.amplitude),
    turnoverRate: finite(snap?.turnover_rate),
    volumeRatio: finite(snap?.volume_ratio),
    marketCap: positive(snap?.total_market_val),
    circulatingMarketCap: positive(snap?.circular_market_val),
    changeSpeed:
      fiveMin && fiveMin > 0 ? ((price - fiveMin) / fiveMin) * 100 : undefined,
  };
}

/** Cache only the first page; deep cursor pages are requested on scroll. */
export async function getFutuConstituentsPage(
  symbol: string,
  assetType: AssetType,
  nextKey?: string | null,
): Promise<IndexConstituentsPage> {
  const upper = symbol.toUpperCase().trim();
  if (!isMarketIndexSymbol(upper)) {
    return { constituents: [], nextKey: null, hasMore: false, total: 0, source: "futu" };
  }
  if (!isFutuConfigured()) {
    const rows = await getIndexConstituents(symbol, assetType);
    return {
      constituents: rows,
      nextKey: null,
      hasMore: false,
      total: rows.length,
      source: "longbridge",
    };
  }

  const cursor = nextKey?.trim() || "";
  const load = async (): Promise<IndexConstituentsPage> => {
    const query = screenQuery(upper, assetType);
    const result = await futuRequest<{ items?: ScreenItem[] }>(
      "POST",
      "/api/v1.0/quote/stock-screen",
      {
        body: {
          limit: PAGE_SIZE,
          ...query,
          ...(cursor ? { next_key: cursor } : {}),
          sort: {
            direction: 2,
            cumulative_property: { name: 3102, days: 1 },
          },
        },
      },
    );
    const items = result.data?.items ?? [];
    const snaps = await fetchSnapshots(
      items.map((item) => String(item.code || "")),
    );
    const constituents = items
      .map((item) => mapRow(item, snaps.get(String(item.code || "")), assetType))
      .filter((row): row is IndexConstituent => row != null);
    return {
      constituents,
      nextKey: result.hasMore ? (result.nextKey ?? null) : null,
      hasMore: Boolean(result.hasMore && result.nextKey),
      total: result.total ?? constituents.length,
      source: "futu",
    };
  };

  if (cursor) return load();
  return cachedFetch(`futu:constituents:v1:${upper}:${assetType}`, 30_000, load);
}
