import { formatNumber } from "@/lib/format-number";
import { basketKey, type AnalysisBasketItem } from "@/components/analysis/types";

export type FundMetrics = {
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  revenue: number | null;
  profit: number | null;
  netMargin: number | null;
  roe: number | null;
  roa: number | null;
  grossMargin: number | null;
  debtToAsset: number | null;
  totalAssets: number | null;
};

export const EMPTY_FUND_METRICS: FundMetrics = {
  marketCap: null,
  pe: null,
  pb: null,
  revenue: null,
  profit: null,
  netMargin: null,
  roe: null,
  roa: null,
  grossMargin: null,
  debtToAsset: null,
  totalAssets: null,
};

export function currencyPrefix(assetType: AnalysisBasketItem["assetType"]) {
  if (assetType === "hk") return "HK$";
  if (assetType === "cn") return "¥";
  return "$";
}

export function formatMoney(
  value: number | undefined,
  assetType: AnalysisBasketItem["assetType"],
) {
  if (value == null) return "—";
  return `${currencyPrefix(assetType)}${value.toFixed(2)}`;
}

/** Compact large numbers: 1.23T / 45.6B / 120M */
export function formatCompact(
  value: number | null | undefined,
  prefix = "",
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${prefix}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${prefix}${(abs / 1e6).toFixed(2)}M`;
  return `${sign}${prefix}${formatNumber(abs, { maximumFractionDigits: 2 })}`;
}

export function formatPct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

function metricOf(
  metrics: Array<{ key: string; value: number | null }> | undefined,
  key: string,
): number | null {
  const row = metrics?.find((m) => m.key === key);
  return row?.value ?? null;
}

function metricOfAny(
  metrics: Array<{ key: string; value: number | null }> | undefined,
  keys: string[],
): number | null {
  for (const key of keys) {
    const v = metricOf(metrics, key);
    if (v != null) return v;
  }
  return null;
}

export async function loadFundamentals(
  item: AnalysisBasketItem,
): Promise<FundMetrics> {
  try {
    const res = await fetch(
      `/api/earnings?symbol=${encodeURIComponent(item.symbol)}&assetType=${item.assetType}`,
    );
    if (!res.ok) return EMPTY_FUND_METRICS;
    const data = await res.json();
    const metrics = data.metrics as
      | Array<{ key: string; value: number | null }>
      | undefined;
    // Finnhub marketCapitalization is in millions
    const mktMillions = metricOf(metrics, "marketCapitalization");
    const pe =
      metricOf(metrics, "peTTM") ?? metricOf(metrics, "peNormalizedAnnual");
    const pb = metricOf(metrics, "pbAnnual");
    const netMargin = metricOf(metrics, "netProfitMarginTTM");
    const roe = metricOf(metrics, "roeTTM");
    const roa = metricOf(metrics, "roaTTM");
    const grossMargin = metricOf(metrics, "grossMarginTTM");
    const totalAssets = metricOf(metrics, "totalAssets");
    let debtToAsset = metricOf(metrics, "debtToAssetRatio");
    if (debtToAsset == null) {
      // Fallback: D/E is not debt/asset, but better than empty when series missing
      const de = metricOfAny(metrics, [
        "totalDebt/totalEquityAnnual",
        "totalDebt/totalEquityQuarterly",
        "longTermDebt/equityAnnual",
      ]);
      if (de != null) {
        // D/E → approx D/(D+E) = de/(1+de) when de is a ratio (e.g. 0.5 or 50)
        const ratio = de > 5 ? de / 100 : de;
        if (ratio >= 0) debtToAsset = (ratio / (1 + ratio)) * 100;
      }
    }

    const cal = data.calendar as
      | {
          recent?: Array<{
            revenueActual: number | null;
            revenueEstimate: number | null;
          }>;
          upcoming?: Array<{
            revenueActual: number | null;
            revenueEstimate: number | null;
          }>;
        }
      | undefined;
    const calendar = [...(cal?.recent ?? []), ...(cal?.upcoming ?? [])];
    const withRev = calendar.find(
      (c) => c.revenueActual != null || c.revenueEstimate != null,
    );
    // Prefer derived salesPerShare×shares (revenueLatest); calendar as backup
    const revenue =
      metricOf(metrics, "revenueLatest") ??
      withRev?.revenueActual ??
      withRev?.revenueEstimate ??
      null;

    let profit: number | null = null;
    if (revenue != null && netMargin != null) {
      // netProfitMarginTTM is typically already in percent (e.g. 18.5)
      const margin =
        Math.abs(netMargin) <= 1 ? netMargin * 100 : netMargin;
      profit = revenue * (margin / 100);
    }

    return {
      marketCap: mktMillions != null ? mktMillions * 1e6 : null,
      pe,
      pb,
      revenue,
      profit,
      netMargin,
      roe,
      roa,
      grossMargin,
      debtToAsset,
      totalAssets,
    };
  } catch {
    return EMPTY_FUND_METRICS;
  }
}

export async function loadBasketFundamentals(
  basket: AnalysisBasketItem[],
): Promise<Record<string, FundMetrics>> {
  const entries = await Promise.all(
    basket.map(async (item) => {
      const metrics = await loadFundamentals(item);
      return [basketKey(item), metrics] as const;
    }),
  );
  return Object.fromEntries(entries);
}
