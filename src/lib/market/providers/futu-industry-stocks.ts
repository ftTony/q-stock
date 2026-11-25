import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type { IndustryStock } from "@/lib/market/providers/longbridge-industry";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

const PAGE_SIZE = 24;
/** Soft ceiling so one industry cannot wedge a 1GB host. */
const MAX_TAKE = 200;

type PlateStockRow = {
  code?: string;
  stock_name?: string;
  sc_name?: string;
  tc_name?: string;
  stock_type?: string;
};

type SnapRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  last_price?: number;
  prev_close_price?: number;
  total_market_val?: number;
};

export type IndustryStocksPage = {
  stocks: IndustryStock[];
  nextKey: string | null;
  hasMore: boolean;
  total: number;
  source: "futu" | "seed";
};

export function looksLikeFutuPlateCode(id: string): boolean {
  return /^(US|HK|SH|SZ|BJ)\./i.test(id.trim());
}

function pctChange(last: number, prev: number): number {
  if (!(prev > 0) || !Number.isFinite(last)) return 0;
  return ((last - prev) / prev) * 100;
}

async function snapshotCodes(codes: string[]): Promise<Map<string, SnapRow>> {
  const byCode = new Map<string, SnapRow>();
  if (!codes.length) return byCode;
  try {
    const { data } = await futuRequest<{ snapshot_list?: SnapRow[] }>(
      "POST",
      "/api/v1.0/quote/snapshot",
      { body: { code_list: codes.slice(0, PAGE_SIZE) } },
    );
    for (const s of data.snapshot_list ?? []) {
      if (s.code) byCode.set(s.code, s);
    }
  } catch (err) {
    console.warn(
      "[futu-industry-stocks] snapshot failed:",
      err instanceof Error ? err.message : err,
    );
  }
  return byCode;
}

function mapRows(
  rows: PlateStockRow[],
  snaps: Map<string, SnapRow>,
  assetType: AssetType,
): IndustryStock[] {
  const out: IndustryStock[] = [];
  for (const r of rows) {
    const code = r.code?.trim();
    if (!code) continue;
    const t = (r.stock_type || "STOCK").toUpperCase();
    if (t && t !== "STOCK" && t !== "EQTY") continue;
    const bare = code.replace(/^(US|HK|SH|SZ|BJ)\./i, "");
    const snap = snaps.get(code);
    const last = Number(snap?.last_price ?? 0);
    const prev = Number(snap?.prev_close_price ?? 0);
    const cap = Number(snap?.total_market_val ?? 0);
    const symbol =
      assetType === "cn"
        ? normalizeSymbol(code, "cn")
        : normalizeSymbol(bare, assetType);
    const row: IndustryStock = {
      symbol,
      name: (
        r.sc_name ||
        snap?.sc_name ||
        r.stock_name ||
        snap?.name ||
        bare
      ).trim(),
      price: Number.isFinite(last) ? last : 0,
      percentChange: pctChange(last, prev),
    };
    if (Number.isFinite(cap) && cap > 0) row.marketCap = cap;
    out.push(row);
  }
  return out;
}

/**
 * Paginated industry members via Futu plate-stock.
 * `loaded` is how many rows the client already has (caps MAX_TAKE).
 */
export async function getFutuIndustryStocksPage(
  plateCode: string,
  assetType: AssetType,
  nextKey: string,
  loaded = 0,
): Promise<IndustryStocksPage> {
  if (!isFutuConfigured() || !looksLikeFutuPlateCode(plateCode)) {
    return { stocks: [], nextKey: null, hasMore: false, total: 0, source: "futu" };
  }
  if (loaded >= MAX_TAKE) {
    return {
      stocks: [],
      nextKey: null,
      hasMore: false,
      total: loaded,
      source: "futu",
    };
  }

  const take = Math.min(PAGE_SIZE, MAX_TAKE - loaded);
  const cacheKey = `futu:industry-stocks:v1:${plateCode}:${assetType}:${nextKey || "0"}:${take}`;

  return cachedFetch(cacheKey, 30_000, async () => {
    const result = await futuRequest<{ stock_list?: PlateStockRow[] }>(
      "GET",
      "/api/v1.0/quote/plate-stock",
      {
        query: {
          plate_code: plateCode,
          limit: take,
          ...(nextKey ? { next_key: nextKey } : {}),
        },
      },
    );
    const raw = result.data?.stock_list ?? [];
    const codes = raw.map((r) => r.code).filter((c): c is string => Boolean(c));
    const snaps = await snapshotCodes(codes);
    const stocks = mapRows(raw, snaps, assetType);
    const cursor =
      result.hasMore && result.nextKey && result.nextKey !== "-1"
        ? result.nextKey
        : null;
    const total = result.total ?? loaded + stocks.length;
    const hasMore =
      Boolean(cursor) && loaded + stocks.length < MAX_TAKE && stocks.length > 0;
    return {
      stocks,
      nextKey: hasMore ? cursor : null,
      hasMore,
      total: Math.min(total, MAX_TAKE),
      source: "futu" as const,
    };
  });
}
