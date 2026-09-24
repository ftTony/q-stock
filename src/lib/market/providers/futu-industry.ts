import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type {
  IndustryHeatCell,
  IndustryStock,
} from "@/lib/market/providers/longbridge-industry";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

/**
 * Futu industry heatmap via plate-list + snapshot (+ plate-stock for tooltip).
 * https://open.futunn.com/zh-cn/api/quote/plate/plate-list
 */

type PlateRow = {
  code?: string;
  plate_id?: string;
  plate_name?: string;
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
  turnover?: number;
  total_market_val?: number;
};

type StockRow = {
  code?: string;
  stock_name?: string;
  sc_name?: string;
  tc_name?: string;
};

function marketOf(assetType: AssetType): "US" | "HK" | null {
  if (assetType === "stock") return "US";
  if (assetType === "hk") return "HK";
  return null;
}

function pctChange(last: number, prev: number): number {
  if (!(prev > 0) || !Number.isFinite(last)) return 0;
  return ((last - prev) / prev) * 100;
}

function plateName(p: PlateRow, snap?: SnapRow): string {
  return (
    snap?.sc_name ||
    p.sc_name ||
    snap?.name ||
    p.plate_name ||
    p.tc_name ||
    p.code ||
    ""
  ).trim();
}

async function snapshotCodes(codes: string[]): Promise<Map<string, SnapRow>> {
  const byCode = new Map<string, SnapRow>();
  const unique = [...new Set(codes.filter(Boolean))];
  const chunk = 400;
  for (let i = 0; i < unique.length; i += chunk) {
    const part = unique.slice(i, i + chunk);
    try {
      const { data } = await futuRequest<{ snapshot_list?: SnapRow[] }>(
        "POST",
        "/api/v1.0/quote/snapshot",
        { body: { code_list: part } },
      );
      for (const s of data.snapshot_list ?? []) {
        if (s.code) byCode.set(s.code, s);
      }
    } catch (err) {
      console.warn(
        "[futu-industry] snapshot failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }
  return byCode;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

export async function getFutuIndustryHeatmap(
  assetType: AssetType,
  limit = 40,
): Promise<IndustryHeatCell[]> {
  if (!isFutuConfigured()) return [];
  const market = marketOf(assetType);
  if (!market) return [];

  const key = `futu:industry:v2:${market}:${limit}`;
  return cachedFetch(key, 120_000, async () => {
    const { data } = await futuRequest<{ plate_list?: PlateRow[] }>(
      "GET",
      "/api/v1.0/quote/plate-list",
      { query: { market, plate_class: "INDUSTRY" } },
    );
    const plates = (data.plate_list ?? []).filter((p) => p.code);
    if (!plates.length) return [];

    const plateSnaps = await snapshotCodes(plates.map((p) => p.code!));

    const ranked = plates
      .map((p, index) => {
        const snap = plateSnaps.get(p.code!);
        const last = Number(snap?.last_price ?? 0);
        const prev = Number(snap?.prev_close_price ?? 0);
        const turnover = Number(snap?.turnover ?? 0);
        const cap = Number(snap?.total_market_val ?? 0);
        const name = plateName(p, snap);
        if (!name) return null;
        const weight =
          cap > 0 ? cap : turnover > 0 ? turnover : Math.max(1, 1000 - index);
        return {
          plate: p,
          cellBase: {
            id: p.code!,
            name,
            percentChange: pctChange(last, prev),
            weight,
            volume: turnover > 0 ? turnover : undefined,
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => b.cellBase.weight - a.cellBase.weight)
      .slice(0, limit);

    const memberLists = await mapPool(ranked, 6, async (row) => {
      try {
        const { data: stockData } = await futuRequest<{
          stock_list?: StockRow[];
        }>("GET", "/api/v1.0/quote/plate-stock", {
          query: { plate_code: row.plate.code!, limit: 8 },
        });
        return {
          plateCode: row.plate.code!,
          stocks: (stockData.stock_list ?? []).slice(0, 8),
        };
      } catch {
        return { plateCode: row.plate.code!, stocks: [] as StockRow[] };
      }
    });

    const allStockCodes = memberLists.flatMap((m) =>
      m.stocks.map((s) => s.code).filter((c): c is string => Boolean(c)),
    );
    const stockSnaps = await snapshotCodes(allStockCodes);
    const membersByPlate = new Map(
      memberLists.map((m) => [m.plateCode, m.stocks]),
    );

    return ranked.map((row) => {
      const stocks: IndustryStock[] = (membersByPlate.get(row.plate.code!) ?? [])
        .map((r) => {
          const code = r.code;
          if (!code) return null;
          const bare = code.replace(/^(US|HK)\./i, "");
          const snap = stockSnaps.get(code);
          const last = Number(snap?.last_price ?? 0);
          const prev = Number(snap?.prev_close_price ?? 0);
          return {
            symbol: normalizeSymbol(bare, assetType),
            name: (
              r.sc_name ||
              snap?.sc_name ||
              r.stock_name ||
              snap?.name ||
              bare
            ).trim(),
            price: last,
            percentChange: pctChange(last, prev),
          } satisfies IndustryStock;
        })
        .filter((x): x is IndustryStock => x != null);

      return { ...row.cellBase, stocks };
    });
  });
}
