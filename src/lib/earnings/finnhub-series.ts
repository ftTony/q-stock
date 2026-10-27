import type { SeriesLike } from "@/lib/earnings/build-statement";

type SeriesPoint = { period?: string; v?: number };

type SeriesBucket = {
  annual?: Record<string, SeriesPoint[]>;
  quarterly?: Record<string, SeriesPoint[]>;
};

/** Finnhub quarterly series keys we surface in the statement chart/table. */
const SERIES_SPEC: Array<{
  fhKey: string;
  outKey: string;
  unit: SeriesLike["unit"];
  /** If values look like 0–1.5 ratios, convert to percent. */
  asPercentRatio?: boolean;
}> = [
  { fhKey: "grossMargin", outKey: "grossMargin", unit: "percent", asPercentRatio: true },
  {
    fhKey: "operatingMargin",
    outKey: "operatingMargin",
    unit: "percent",
    asPercentRatio: true,
  },
  {
    fhKey: "netProfitMargin",
    outKey: "netMargin",
    unit: "percent",
    asPercentRatio: true,
  },
  { fhKey: "roe", outKey: "roe", unit: "percent", asPercentRatio: true },
];

function parseYearQuarter(period: string): { year: number; quarter: number } | null {
  // Finnhub periods look like "2024-03-31" (quarter end) or "2024-Q1"
  const q = period.match(/(\d{4})-Q([1-4])/i);
  if (q) return { year: Number(q[1]), quarter: Number(q[2]) };
  const d = period.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!d) return null;
  const year = Number(d[1]);
  const month = Number(d[2]);
  const quarter = Math.ceil(month / 3);
  if (!year || quarter < 1 || quarter > 4) return null;
  return { year, quarter };
}

function normalizePercent(v: number, asRatio?: boolean): number {
  if (!asRatio) return v;
  return Math.abs(v) <= 1.5 ? v * 100 : v;
}

/** Extract bounded quarterly series from Finnhub `/stock/metric` payload. */
export function extractFinnhubQuarterlySeries(series: unknown): SeriesLike[] {
  const quarterly = (series as SeriesBucket | undefined)?.quarterly;
  if (!quarterly) return [];

  const out: SeriesLike[] = [];
  for (const spec of SERIES_SPEC) {
    const arr = quarterly[spec.fhKey];
    if (!Array.isArray(arr) || !arr.length) continue;
    const points: SeriesLike["points"] = [];
    for (const pt of arr) {
      if (typeof pt.v !== "number" || !Number.isFinite(pt.v) || !pt.period) continue;
      const yq = parseYearQuarter(pt.period);
      if (!yq) continue;
      points.push({
        year: yq.year,
        quarter: yq.quarter,
        value: normalizePercent(pt.v, spec.asPercentRatio),
      });
    }
    if (points.length) {
      out.push({ key: spec.outKey, unit: spec.unit, points });
    }
  }
  return out;
}
