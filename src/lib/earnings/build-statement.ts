import type {
  EarningsStatement,
  StatementPeriod,
  StatementRow,
  StatementUnit,
} from "@/lib/earnings/types";

export type SurpriseLike = {
  actual: number | null;
  year: number;
  quarter: number;
  period?: string;
};

export type CalendarLike = {
  revenueActual: number | null;
  year: number;
  quarter: number;
};

export type SeriesLike = {
  key: string;
  unit: StatementUnit;
  points: Array<{ year: number; quarter: number; value: number }>;
};

function periodKey(year: number, quarter: number): string {
  return `${year}-Q${quarter}`;
}

function shortLabel(year: number, quarter: number): string {
  if (year > 0 && quarter > 0) return `${String(year).slice(2)}Q${quarter}`;
  if (year > 0) return String(year);
  return "?";
}

function parsePeriod(period?: string): { year: number; quarter: number } | null {
  if (!period) return null;
  const m = period.match(/(\d{4})\D*([1-4])/);
  if (!m) return null;
  return { year: Number(m[1]), quarter: Number(m[2]) };
}

function yoyPct(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null || prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

function collectPeriods(
  surprises: SurpriseLike[],
  recent: CalendarLike[],
  series: SeriesLike[],
): StatementPeriod[] {
  const map = new Map<string, StatementPeriod>();
  for (const s of surprises) {
    let year = s.year;
    let quarter = s.quarter;
    if ((!year || !quarter) && s.period) {
      const p = parsePeriod(s.period);
      if (p) {
        year = p.year;
        quarter = p.quarter;
      }
    }
    if (!year || !quarter) continue;
    map.set(periodKey(year, quarter), {
      label: shortLabel(year, quarter),
      year,
      quarter,
    });
  }
  for (const r of recent) {
    if (!r.year || !r.quarter) continue;
    map.set(periodKey(r.year, r.quarter), {
      label: shortLabel(r.year, r.quarter),
      year: r.year,
      quarter: r.quarter,
    });
  }
  for (const row of series) {
    for (const p of row.points) {
      if (!p.year || !p.quarter) continue;
      map.set(periodKey(p.year, p.quarter), {
        label: shortLabel(p.year, p.quarter),
        year: p.year,
        quarter: p.quarter,
      });
    }
  }
  return [...map.values()].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.quarter - a.quarter,
  );
}

function alignValues(
  periods: StatementPeriod[],
  lookup: Map<string, number>,
): { values: (number | null)[]; yoy: (number | null)[] } {
  const values = periods.map((p) => lookup.get(periodKey(p.year, p.quarter)) ?? null);
  const yoy = periods.map((p) => {
    const cur = lookup.get(periodKey(p.year, p.quarter)) ?? null;
    const prior = lookup.get(periodKey(p.year - 1, p.quarter)) ?? null;
    return yoyPct(cur, prior);
  });
  return { values, yoy };
}

function pushRow(
  rows: StatementRow[],
  key: string,
  unit: StatementUnit,
  periods: StatementPeriod[],
  lookup: Map<string, number>,
) {
  if (![...lookup.values()].some((v) => Number.isFinite(v))) return;
  const { values, yoy } = alignValues(periods, lookup);
  if (!values.some((v) => v != null)) return;
  rows.push({ key, unit, values, yoy });
}

/**
 * Build newest-first statement rows from EPS surprises, calendar revenue,
 * and optional Finnhub/Futu quarterly series (margins etc.).
 */
export function buildEarningsStatement(input: {
  surprises: SurpriseLike[];
  recent: CalendarLike[];
  series?: SeriesLike[];
  maxPeriods?: number;
}): EarningsStatement | null {
  const maxPeriods = input.maxPeriods ?? 8;
  const series = input.series ?? [];
  const periodsAll = collectPeriods(input.surprises, input.recent, series);
  if (!periodsAll.length) return null;
  const periods = periodsAll.slice(0, maxPeriods);

  const rows: StatementRow[] = [];

  const revLookup = new Map<string, number>();
  for (const r of input.recent) {
    if (r.revenueActual == null || !r.year || !r.quarter) continue;
    revLookup.set(periodKey(r.year, r.quarter), r.revenueActual);
  }
  pushRow(rows, "revenue", "currency", periods, revLookup);

  const epsLookup = new Map<string, number>();
  for (const s of input.surprises) {
    let year = s.year;
    let quarter = s.quarter;
    if ((!year || !quarter) && s.period) {
      const p = parsePeriod(s.period);
      if (p) {
        year = p.year;
        quarter = p.quarter;
      }
    }
    if (s.actual == null || !year || !quarter) continue;
    epsLookup.set(periodKey(year, quarter), s.actual);
  }
  pushRow(rows, "eps", "eps", periods, epsLookup);

  for (const s of series) {
    const lookup = new Map<string, number>();
    for (const p of s.points) {
      if (!p.year || !p.quarter || !Number.isFinite(p.value)) continue;
      lookup.set(periodKey(p.year, p.quarter), p.value);
    }
    pushRow(rows, s.key, s.unit, periods, lookup);
  }

  if (!rows.length) return null;
  return { periods, rows };
}
