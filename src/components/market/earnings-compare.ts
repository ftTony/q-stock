import type { PeriodSelection } from "@/components/market/earnings-period-picker";
import type {
  EarningsStatement,
  StatementRow,
  StatementUnit,
} from "@/lib/earnings/types";
import { formatNumber } from "@/lib/format-number";

export type CompareMode = "yoy" | "qoq" | "off";

export const EARNINGS_YOY_COLOR = "#e8873a";

export function fmtAxis(v: number, unit: StatementUnit): string {
  if (unit === "percent") return `${v.toFixed(1)}%`;
  if (unit === "ratio" || unit === "eps") return v.toFixed(2);
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return v.toFixed(1);
}

export function fmtTip(v: number, unit: StatementUnit): string {
  if (unit === "percent") return `${v.toFixed(2)}%`;
  if (unit === "ratio" || unit === "eps") return v.toFixed(2);
  return fmtAxis(v, unit);
}

export function fmtDeltaPct(v: number | null): string {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function fmtYoyTip(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function fmtValue(v: number | null, unit: StatementUnit): string {
  if (v == null || Number.isNaN(v)) return "—";
  if (unit === "percent") return `${v.toFixed(2)}%`;
  if (unit === "ratio" || unit === "eps") {
    return formatNumber(v, {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    });
  }
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return formatNumber(v, { maximumFractionDigits: 2 });
}

/** QoQ % on chronologic (oldest→newest) values. */
export function qoqSeries(values: (number | null)[]): (number | null)[] {
  return values.map((v, i) => {
    if (v == null || i === 0) return null;
    const prev = values[i - 1];
    if (prev == null || prev === 0) return null;
    return ((v - prev) / Math.abs(prev)) * 100;
  });
}

export function qoqFromValues(values: number[]): (number | null)[] {
  return values.map((v, i) => {
    if (i === 0) return null;
    const prev = values[i - 1];
    if (prev === 0) return null;
    return ((v - prev) / Math.abs(prev)) * 100;
  });
}

export function filterByPeriodSelection(
  statement: EarningsStatement,
  sel: PeriodSelection,
): EarningsStatement {
  const keep = statement.periods.map((p) => {
    if (sel.freq === "annual") {
      return p.quarter === 4 || p.quarter === 0;
    }
    if (sel.scope === "all") return p.quarter >= 1 && p.quarter <= 4;
    const q = Number(sel.scope.slice(1));
    return p.quarter === q;
  });
  const base = {
    periods: statement.periods.filter((_, i) => keep[i]),
    rows: statement.rows.map((r) => ({
      ...r,
      values: r.values.filter((_, i) => keep[i]),
      yoy: r.yoy.filter((_, i) => keep[i]),
    })),
  };
  const nonempty = base.periods.map((_, i) =>
    base.rows.some((r) => r.values[i] != null),
  );
  if (nonempty.every(Boolean)) return base;
  return {
    periods: base.periods.filter((_, i) => nonempty[i]),
    rows: base.rows.map((r) => ({
      ...r,
      values: r.values.filter((_, i) => nonempty[i]),
      yoy: r.yoy.filter((_, i) => nonempty[i]),
    })),
  };
}

export function chronologicRow(row: StatementRow): StatementRow {
  return {
    ...row,
    values: [...row.values].reverse(),
    yoy: [...row.yoy].reverse(),
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
