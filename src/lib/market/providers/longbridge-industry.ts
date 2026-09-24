import { cachedFetch } from "@/lib/cache";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

const CHART_HOST =
  process.env.LONGBRIDGE_CHART_HOST?.trim() ||
  "https://mr.lbkrs.com/api/forward";

export type IndustryStock = {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
};

export type IndustryHeatCell = {
  id: string;
  name: string;
  /** Daily change in percent (e.g. 2.31 for +2.31%). */
  percentChange: number;
  /** Relative weight for treemap area (market cap). */
  weight: number;
  /** Industry turnover / volume figure for tooltip. */
  volume?: number;
  stocks: IndustryStock[];
};

type RawStock = {
  counter_id?: string;
  name?: string;
  last_done?: string;
  chg?: string;
  market_cap?: string;
};

type RawIndustry = {
  counter_id?: string;
  name?: string;
  chg?: string;
  market_cap?: string;
  amount?: string;
  balance?: string;
  stocks?: RawStock[];
};

type ChartResponse = {
  code?: number;
  message?: string;
  data?: { items?: RawIndustry[] };
};

function toPercent(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.abs(n) <= 1.5 ? n * 100 : n;
}

function counterToSymbol(counterId: string, assetType: AssetType): string {
  const parts = counterId.split("/");
  const code = parts[2] || counterId;
  return normalizeSymbol(code, assetType);
}

function mapStock(raw: RawStock, assetType: AssetType): IndustryStock | null {
  const name = String(raw.name || "").trim();
  const cid = String(raw.counter_id || "").trim();
  if (!name || !cid) return null;
  const price = Number(raw.last_done);
  return {
    symbol: counterToSymbol(cid, assetType),
    name,
    price: Number.isFinite(price) ? price : 0,
    percentChange: toPercent(raw.chg),
  };
}

function mapCell(
  raw: RawIndustry,
  assetType: AssetType,
  index: number,
): IndustryHeatCell | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;
  const id = String(raw.counter_id || name);
  const cap = Number(raw.market_cap);
  const amount = Number(raw.amount);
  const balance = Number(raw.balance);
  const volume =
    Number.isFinite(amount) && amount > 0
      ? amount
      : Number.isFinite(balance) && balance > 0
        ? balance
        : undefined;
  const stocks = (raw.stocks ?? [])
    .map((s) => mapStock(s, assetType))
    .filter((s): s is IndustryStock => s != null)
    .slice(0, 12);
  return {
    id,
    name,
    percentChange: toPercent(raw.chg),
    weight: Number.isFinite(cap) && cap > 0 ? cap : Math.max(1, 100 - index),
    volume,
    stocks,
  };
}

function marketOf(assetType: AssetType): "US" | "HK" | null {
  if (assetType === "stock") return "US";
  if (assetType === "hk") return "HK";
  return null;
}

/** Longbridge industry chart is a public HTTP endpoint (no API key). */
export async function getLongbridgeIndustryHeatmap(
  assetType: AssetType,
  limit = 40,
): Promise<IndustryHeatCell[]> {
  const market = marketOf(assetType);
  if (!market) return [];

  const key = `lb:industry:chart:v1:${market}:${limit}`;
  return cachedFetch(key, 120_000, async () => {
    const url = `${CHART_HOST}/v2/newmarket/global/industry_chart?market=${market}&index_key=&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`industry_chart HTTP ${res.status}`);
    }
    const body = (await res.json()) as ChartResponse;
    if (body.code != null && body.code !== 0) {
      throw new Error(body.message || `industry_chart code ${body.code}`);
    }
    return (body.data?.items ?? [])
      .map((it, i) => mapCell(it, assetType, i))
      .filter((x): x is IndustryHeatCell => x != null)
      .slice(0, limit);
  });
}

/** @deprecated use getLongbridgeIndustryHeatmap */
export const getIndustryHeatmap = getLongbridgeIndustryHeatmap;

export function isIndustryRankConfigured(): boolean {
  return true;
}
