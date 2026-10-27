import type {
  EarningsStatement,
  StatementPeriod,
  StatementRow,
  StatementUnit,
} from "@/lib/earnings/types";

export type ReportItemLike = {
  display_name?: string;
  data?: number;
  yoy?: number;
};

export type ReportLike = {
  fiscal_year?: number;
  financial_type?: number;
  period_text?: string;
  item_list?: ReportItemLike[];
};

function parseQuarter(periodText: string, financialType?: number): number {
  const m = (periodText || "").match(/Q\s*([1-4])/i);
  if (m) return Number(m[1]);
  if (financialType != null && financialType >= 1 && financialType <= 4) {
    return financialType;
  }
  // Annual-only → Q4 bucket for alignment
  if (/annual|年报|全年/i.test(periodText || "")) return 4;
  return 0;
}

function shortLabel(year: number, quarter: number): string {
  if (year > 0 && quarter > 0) return `${String(year).slice(2)}Q${quarter}`;
  if (year > 0) return String(year);
  return "?";
}

function slugKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
}

function guessUnit(name: string): StatementUnit {
  if (/eps|每股收益|每股盈[餘余]/i.test(name)) return "eps";
  if (/margin|ratio|rate|%|率|比重|占比/i.test(name)) return "percent";
  return "currency";
}

function yoyPct(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null || prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

/**
 * Build newest-first statement table from broker report lists
 * (Futu / similar: display_name + data + optional yoy).
 */
export function buildStatementFromReports(
  reports: ReportLike[],
  opts?: { maxPeriods?: number; maxRows?: number },
): EarningsStatement | null {
  const maxPeriods = opts?.maxPeriods ?? 8;
  const maxRows = opts?.maxRows ?? 24;
  if (!reports.length) return null;

  const periodMap = new Map<string, StatementPeriod>();
  const byRow = new Map<
    string,
    { label: string; unit: StatementUnit; cells: Map<string, { v: number; yoy: number | null }> }
  >();

  for (const r of reports) {
    const year = Number(r.fiscal_year ?? 0);
    const quarter = parseQuarter(r.period_text ?? "", r.financial_type);
    if (!year) continue;
    const pKey = `${year}-Q${quarter || 0}`;
    if (!periodMap.has(pKey)) {
      periodMap.set(pKey, {
        label: shortLabel(year, quarter || 0),
        year,
        quarter: quarter || 0,
      });
    }
    for (const item of r.item_list ?? []) {
      const name = (item.display_name ?? "").trim();
      if (!name) continue;
      const v = Number(item.data);
      if (!Number.isFinite(v)) continue;
      const key = slugKey(name);
      if (!key) continue;
      let row = byRow.get(key);
      if (!row) {
        row = { label: name, unit: guessUnit(name), cells: new Map() };
        byRow.set(key, row);
      }
      const rawYoy = Number(item.yoy);
      row.cells.set(pKey, {
        v,
        yoy: Number.isFinite(rawYoy) ? rawYoy : null,
      });
    }
  }

  const periods = [...periodMap.entries()]
    .sort((a, b) => {
      const pa = a[1];
      const pb = b[1];
      return pa.year !== pb.year
        ? pb.year - pa.year
        : pb.quarter - pa.quarter;
    })
    .slice(0, maxPeriods)
    .map(([, p]) => p);

  if (!periods.length || !byRow.size) return null;

  const periodKeys = periods.map(
    (p) => `${p.year}-Q${p.quarter || 0}`,
  );

  const rows: StatementRow[] = [];
  for (const [key, row] of byRow) {
    const values = periodKeys.map((pk) => row.cells.get(pk)?.v ?? null);
    if (!values.some((v) => v != null)) continue;
    const yoy = periodKeys.map((pk, i) => {
      const cell = row.cells.get(pk);
      if (cell?.yoy != null) return cell.yoy;
      const cur = values[i] ?? null;
      const p = periods[i];
      if (!p) return null;
      const priorKey = `${p.year - 1}-Q${p.quarter || 0}`;
      const prior = row.cells.get(priorKey)?.v ?? null;
      return yoyPct(cur, prior);
    });
    rows.push({
      key,
      label: row.label,
      unit: row.unit,
      values,
      yoy,
    });
  }

  if (!rows.length) return null;

  // Prefer denser / larger-magnitude rows first for chart default
  rows.sort((a, b) => {
    const fillA = a.values.filter((v) => v != null).length;
    const fillB = b.values.filter((v) => v != null).length;
    if (fillA !== fillB) return fillB - fillA;
    const magA = Math.max(...a.values.map((v) => Math.abs(v ?? 0)));
    const magB = Math.max(...b.values.map((v) => Math.abs(v ?? 0)));
    return magB - magA;
  });

  return { periods, rows: rows.slice(0, maxRows) };
}
