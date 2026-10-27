import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getCompanyProfile2,
} from "@/lib/finnhub/client";
import {
  buildEarningsStatement,
  type CalendarLike,
  type SeriesLike,
  type SurpriseLike,
} from "@/lib/earnings/build-statement";
import { extractFinnhubQuarterlySeries } from "@/lib/earnings/finnhub-series";
import type { EarningsStatement } from "@/lib/earnings/types";

type MetricRow = { key: string; value: number | null };
type SeriesPoint = { period?: string; v?: number };

function latestSeriesValue(
  series: unknown,
  key: string,
  bucket: "annual" | "quarterly" = "annual",
): number | null {
  const arr = (
    series as
      | { annual?: Record<string, SeriesPoint[]>; quarterly?: Record<string, SeriesPoint[]> }
      | undefined
  )?.[bucket]?.[key];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) =>
    String(b.period ?? "").localeCompare(String(a.period ?? "")),
  );
  const v = sorted[0]?.v;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export type FinnhubFinBundle = {
  metrics: MetricRow[];
  series: SeriesLike[];
};

/**
 * Free-tier Finnhub `/stock/metric` — ratios + derived revenue/assets,
 * plus quarterly series for statement charts.
 */
export async function loadFinnhubFinBundle(sym: string): Promise<FinnhubFinBundle> {
  try {
    const [basic, profile] = await Promise.all([
      getBasicFinancials(sym),
      getCompanyProfile2(sym),
    ]);
    const metric = basic?.metric ?? {};
    const rows: MetricRow[] = BASIC_METRIC_KEYS.map((key) => ({
      key,
      value: typeof metric[key] === "number" ? metric[key]! : null,
    })).filter((m) => m.value != null);

    const seriesRaw = basic?.series;
    const sharesMil = profile?.shareOutstanding;
    const series = extractFinnhubQuarterlySeries(seriesRaw);

    if (sharesMil != null && sharesMil > 0) {
      rows.push({ key: "shareOutstanding", value: sharesMil });
    }

    const salesQ = latestSeriesValue(seriesRaw, "salesPerShare", "quarterly");
    const salesA = latestSeriesValue(seriesRaw, "salesPerShare", "annual");
    const turnover =
      latestSeriesValue(seriesRaw, "assetTurnoverTTM", "quarterly") ??
      latestSeriesValue(seriesRaw, "assetTurnoverTTM", "annual");
    const debtToAsset =
      latestSeriesValue(seriesRaw, "totalDebtToTotalAsset", "annual") ??
      latestSeriesValue(seriesRaw, "totalDebtToTotalAsset", "quarterly") ??
      latestSeriesValue(seriesRaw, "longtermDebtTotalAsset", "annual");

    if (salesQ != null && sharesMil != null && sharesMil > 0) {
      rows.push({
        key: "revenueLatest",
        value: salesQ * sharesMil * 1e6,
      });
    }

    if (
      salesA != null &&
      sharesMil != null &&
      sharesMil > 0 &&
      turnover != null &&
      turnover > 0
    ) {
      const revTtm = salesA * sharesMil * 1e6;
      rows.push({ key: "totalAssets", value: revTtm / turnover });
    }

    if (debtToAsset != null) {
      rows.push({
        key: "debtToAssetRatio",
        value: debtToAsset <= 1.5 ? debtToAsset * 100 : debtToAsset,
      });
    }

    return { metrics: rows, series };
  } catch {
    return { metrics: [], series: [] };
  }
}

export function buildStatementPayload(
  surprises: SurpriseLike[],
  recent: CalendarLike[],
  series: SeriesLike[] = [],
): EarningsStatement | null {
  return buildEarningsStatement({ surprises, recent, series });
}
