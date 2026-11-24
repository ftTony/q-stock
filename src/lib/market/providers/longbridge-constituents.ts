import { cachedFetch } from "@/lib/cache";
import { fingerprintLongbridge } from "@/lib/market/creds-types";
import { INDEX_LONGBRIDGE, isMarketIndexSymbol } from "@/lib/market/indices";
import {
  hasLongbridgeCreds,
  loadLb,
  makeLongbridgeConfig,
} from "@/lib/market/providers/longbridge-client";
import { resolveLongbridgeCreds } from "@/lib/market/resolve-market-creds";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

/** Row shape consumed by the index constituents tab. */
export type IndexConstituent = {
  symbol: string;
  name: string;
  price: number;
  /** Percent, e.g. 144.97 for +144.97%. */
  percentChange: number;
  /** Shares traded (Longbridge `amount`). */
  volume: number;
  /** Notional traded (Longbridge `balance`). */
  turnover: number;
  /** Extra columns from Futu quote snapshots; absent when unavailable. */
  change?: number;
  peTtm?: number;
  pb?: number;
  dividendYieldTtm?: number;
  dividendTtm?: number;
  payoutRatio?: number;
  open?: number;
  prevClose?: number;
  high?: number;
  low?: number;
  bid?: number;
  ask?: number;
  bidVol?: number;
  askVol?: number;
  amplitude?: number;
  turnoverRate?: number;
  volumeRatio?: number;
  marketCap?: number;
  circulatingMarketCap?: number;
  /** Short-horizon price speed, percent over ~5 minutes. */
  changeSpeed?: number;
};

/** One page of the constituents table (Futu cursor pagination). */
export type IndexConstituentsPage = {
  constituents: IndexConstituent[];
  nextKey: string | null;
  hasMore: boolean;
  total: number;
  source: "futu" | "longbridge";
  /** True when serving stale cache or enrich failed soft-empty. */
  degraded?: boolean;
};

type LbModule = typeof import("longbridge");
type MarketCtx = InstanceType<LbModule["MarketContext"]>;

const contextCache = new Map<string, MarketCtx>();

async function getMarketCtx(): Promise<MarketCtx> {
  const creds = resolveLongbridgeCreds();
  if (!creds) throw new Error("Longbridge credentials not configured");
  const key = fingerprintLongbridge(creds);
  const hit = contextCache.get(key);
  if (hit) return hit;
  const lb = await loadLb();
  const config = await makeLongbridgeConfig(lb, creds);
  const ctx = lb.MarketContext.new(config);
  contextCache.set(key, ctx);
  if (contextCache.size > 4) {
    const first = contextCache.keys().next().value;
    if (first !== undefined) contextCache.delete(first);
  }
  return ctx;
}

function num(v: string | number | null | undefined): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapConstituent(
  row: {
    symbol?: string;
    name?: string;
    lastDone?: string;
    chg?: string;
    amount?: string;
    balance?: string;
  },
  assetType: AssetType,
): IndexConstituent | null {
  const rawSymbol = String(row.symbol || "").trim();
  const price = num(row.lastDone);
  if (!rawSymbol || !(price > 0)) return null;
  return {
    symbol: normalizeSymbol(rawSymbol, assetType),
    name: String(row.name || "").trim() || rawSymbol,
    price,
    // API `chg` is a ratio: 1.4497 => +144.97%.
    percentChange: num(row.chg) * 100,
    volume: num(row.amount),
    turnover: num(row.balance),
  };
}

/**
 * Index constituents via Longbridge `MarketContext.constituent`.
 * `INDEX_LONGBRIDGE` wire codes matter: US indices need the leading dot
 * (`.IXIC.US`); the bare `IXIC.US` returns an empty list.
 *
 * @see https://open.longbridge.com/zh-CN/docs/fundamental/market/index-components
 */
export async function getIndexConstituents(
  symbol: string,
  assetType: AssetType,
): Promise<IndexConstituent[]> {
  const upper = symbol.toUpperCase().trim();
  if (!isMarketIndexSymbol(upper)) return [];
  if (!hasLongbridgeCreds()) {
    throw new Error("Longbridge credentials not configured");
  }
  const wireSymbol = INDEX_LONGBRIDGE[upper];
  if (!wireSymbol) return [];

  return cachedFetch(`lb:constituents:v1:${wireSymbol}`, 60_000, async () => {
    const ctx = await getMarketCtx();
    const resp = await ctx.constituent(wireSymbol);
    const rows = (resp?.stocks ?? [])
      .map((row) => mapConstituent(row, assetType))
      .filter((row): row is IndexConstituent => row != null);
    rows.sort(
      (a, b) => b.percentChange - a.percentChange || b.turnover - a.turnover,
    );
    // Some indices (e.g. A-share benchmarks) are not covered by this endpoint.
    // Return an empty list so the tab shows its empty state, not an error.
    return rows;
  });
}
