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
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

/**
 * Index constituents via Futu, enriched with quote snapshots.
 *
 * - HK: stock-screen INDEX_ID filter (true constituents).
 * - CN: plate-stock on the index plate code (SH.000001 / SZ.399001 / …).
 *   Market-wide stock-screen is wrong for A-share indices and often yields
 *   empty rows when CN snapshot rights are missing on the OpenAPI key.
 * - US: stock-screen market filter (best-effort; Futu has no INDEX_ID).
 *
 * Longbridge `constituent` (≤20 rows) is the no-Futu fallback. When Futu
 * snapshots come back empty for a page, Longbridge quotes fill prices.
 */

const PAGE_SIZE = 50;
const SNAPSHOT_CHUNK = 400;
const LB_QUOTE_CHUNK = 100;

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
  last_price?: number | string;
  prev_close_price?: number | string;
  open_price?: number | string;
  high_price?: number | string;
  low_price?: number | string;
  volume?: number | string;
  turnover?: number | string;
  turnover_rate?: number | string;
  amplitude?: number | string;
  volume_ratio?: number | string;
  pe_ttm_ratio?: number | string;
  pb_ratio?: number | string;
  dividend_ttm?: number | string;
  dividend_ratio_ttm?: number | string;
  earning_per_share?: number | string;
  total_market_val?: number | string;
  circular_market_val?: number | string;
  bid_price?: number | string;
  ask_price?: number | string;
  bid_vol?: number | string;
  ask_vol?: number | string;
  close_price_5min?: number | string;
};

type PlateStockRow = {
  code?: string;
  name?: string;
  stock_name?: string;
  sc_name?: string;
  tc_name?: string;
  stock_type?: string;
};

function finite(v: number | string | null | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Ignore Futu's zero placeholders for optional fundamental fields. */
function positive(v: number | string | null | undefined): number | undefined {
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
  // US (and non-plate CN fallback): full market sorted by day change.
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

function cnPlateCode(symbol: string): string | null {
  const futuIndex = INDEX_FUTU[symbol.toUpperCase().trim()];
  if (!futuIndex) return null;
  if (futuIndex.startsWith("SH.") || futuIndex.startsWith("SZ.")) return futuIndex;
  return null;
}

async function fetchPlatePage(
  plateCode: string,
  cursor: string,
): Promise<{
  items: ScreenItem[];
  nextKey: string | null;
  hasMore: boolean;
  total: number;
}> {
  const result = await futuRequest<{ stock_list?: PlateStockRow[] }>(
    "GET",
    "/api/v1.0/quote/plate-stock",
    {
      query: {
        plate_code: plateCode,
        limit: PAGE_SIZE,
        ...(cursor ? { next_key: cursor } : {}),
      },
    },
  );
  const items: ScreenItem[] = (result.data?.stock_list ?? [])
    .filter((row) => {
      if (!row.code) return false;
      const t = (row.stock_type || "STOCK").toUpperCase();
      return t === "STOCK" || t === "EQTY" || t === "";
    })
    .map((row) => ({
      code: row.code,
      name: row.sc_name || row.stock_name || row.name,
      sc_name: row.sc_name,
      tc_name: row.tc_name,
    }));
  const nextKey =
    result.hasMore && result.nextKey && result.nextKey !== "-1"
      ? result.nextKey
      : null;
  return {
    items,
    nextKey,
    hasMore: Boolean(nextKey),
    total: result.total ?? items.length,
  };
}

async function fetchScreenPage(
  symbol: string,
  assetType: AssetType,
  cursor: string,
): Promise<{
  items: ScreenItem[];
  nextKey: string | null;
  hasMore: boolean;
  total: number;
}> {
  const query = screenQuery(symbol, assetType);
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
  const nextKey =
    result.hasMore && result.nextKey && result.nextKey !== "-1"
      ? result.nextKey
      : null;
  return {
    items,
    nextKey,
    hasMore: Boolean(nextKey),
    total: result.total ?? items.length,
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

/**
 * Fill missing last_price via Longbridge when Futu CN/US snapshot rights
 * are absent (prod symptom: screen/plate total > 0, mapped rows all null).
 */
async function fillMissingQuotesFromLongbridge(
  codes: string[],
  snaps: Map<string, SnapRow>,
  assetType: AssetType,
): Promise<void> {
  const missing = codes.filter((code) => {
    if (!code) return false;
    return !(positive(snaps.get(code)?.last_price) ?? 0);
  });
  if (!missing.length) return;

  try {
    const { dec, getQuoteCtx, hasLongbridgeCreds } = await import(
      "@/lib/market/providers/longbridge-client"
    );
    if (!hasLongbridgeCreds()) return;
    const ctx = await getQuoteCtx();
    const bareByLb = new Map<string, string>();
    for (const code of missing) {
      const bare = normalizeSymbol(code, assetType);
      const lbSym = toLongbridgeSymbol(bare, assetType);
      bareByLb.set(lbSym, code);
    }
    const lbKeys = [...bareByLb.keys()];
    for (let i = 0; i < lbKeys.length; i += LB_QUOTE_CHUNK) {
      const chunk = lbKeys.slice(i, i + LB_QUOTE_CHUNK);
      const rows = await ctx.quote(chunk);
      for (const q of rows ?? []) {
        const futuCode = bareByLb.get(String(q.symbol || ""));
        if (!futuCode) continue;
        const last = dec(q.lastDone);
        if (!(last > 0)) continue;
        const prev = dec(q.prevClose);
        const volume = Number(q.volume ?? 0);
        const turnover = dec(
          (q as { turnover?: { toNumber(): number } | number | string | null })
            .turnover,
        );
        const existing = snaps.get(futuCode) ?? { code: futuCode };
        snaps.set(futuCode, {
          ...existing,
          last_price: last,
          prev_close_price: prev > 0 ? prev : existing.prev_close_price,
          volume: Number.isFinite(volume) ? volume : existing.volume,
          turnover: turnover > 0 ? turnover : existing.turnover,
          name: existing.name || String(q.name || ""),
        });
      }
    }
  } catch (err) {
    console.warn(
      "[futu-constituents] longbridge quote fill failed:",
      err instanceof Error ? err.message : err,
    );
  }
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
  const plate = assetType === "cn" ? cnPlateCode(upper) : null;

  const load = async (): Promise<IndexConstituentsPage> => {
    const page = plate
      ? await fetchPlatePage(plate, cursor)
      : await fetchScreenPage(upper, assetType, cursor);

    const codes = page.items.map((item) => String(item.code || ""));
    const snaps = await fetchSnapshots(codes);
    // Prod often has plate/screen codes but no CN snapshot rights on the key.
    await fillMissingQuotesFromLongbridge(codes, snaps, assetType);

    const constituents = page.items
      .map((item) => mapRow(item, snaps.get(String(item.code || "")), assetType))
      .filter((row): row is IndexConstituent => row != null);

    // Avoid advancing an empty cursor when the upstream page had members
    // but every row failed enrichment (would look like endless blank pages).
    const nextKeyOut =
      constituents.length === 0 && page.items.length > 0 ? null : page.nextKey;

    return {
      constituents,
      nextKey: nextKeyOut,
      hasMore: Boolean(nextKeyOut),
      total: page.total,
      source: "futu",
    };
  };

  if (cursor) return load();
  return cachedFetch(`futu:constituents:v2:${upper}:${assetType}`, 30_000, load);
}
