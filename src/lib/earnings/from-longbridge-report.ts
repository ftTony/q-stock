import type {
  EarningsStatement,
  StatementPeriod,
  StatementRow,
  StatementUnit,
} from "@/lib/earnings/types";

type LbValue = {
  period?: string;
  year?: number;
  value?: string | number;
  yoy?: string | number;
};

type LbAccount = {
  field?: string;
  name?: string;
  percent?: boolean;
  values?: LbValue[];
};

type LbIndicator = {
  entry?: string;
  short_title?: string;
  accounts?: LbAccount[];
};

/** Longbridge `financialReport` nested list keyed by IS / BS / CF. */
export type LbFinancialReportsList = Record<
  string,
  { indicators?: LbIndicator[] } | undefined
>;

function parsePeriodLabel(
  period: string,
  yearHint?: number,
): { year: number; quarter: number } | null {
  const fy = period.match(/FY\s*(\d{4})/i);
  if (fy) return { year: Number(fy[1]), quarter: 4 };

  const q1 = period.match(/Q\s*([1-4])\s*[/\- ]?\s*(\d{4})/i);
  if (q1) return { year: Number(q1[2]), quarter: Number(q1[1]) };

  const q2 = period.match(/(\d{4})\s*[/\- ]?\s*Q\s*([1-4])/i);
  if (q2) return { year: Number(q2[1]), quarter: Number(q2[2]) };

  if (yearHint && yearHint > 1900) {
    const qOnly = period.match(/Q\s*([1-4])/i);
    return { year: yearHint, quarter: qOnly ? Number(qOnly[1]) : 4 };
  }
  return null;
}

function shortLabel(year: number, quarter: number): string {
  if (year > 0 && quarter > 0 && quarter < 4) {
    return `${String(year).slice(2)}Q${quarter}`;
  }
  if (year > 0 && quarter === 4) return `${String(year).slice(2)}FY`;
  if (year > 0) return String(year);
  return "?";
}

function num(v: string | number | undefined | null): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** LB often returns yoy as ratio (0.227); normalize to percent. */
function yoyPct(raw: string | number | undefined | null): number | null {
  const n = num(raw);
  if (n == null) return null;
  return Math.abs(n) <= 2.5 ? n * 100 : n;
}

function unitOf(account: LbAccount): StatementUnit {
  if (account.percent) return "percent";
  const name = `${account.name ?? ""} ${account.field ?? ""}`;
  if (/eps|每股收益/i.test(name)) return "eps";
  if (/margin|ratio|rate|%|率/i.test(name)) return "percent";
  return "currency";
}

/**
 * Convert Longbridge `financialReport` payload for one kind (BS / CF / IS)
 * into our newest-first statement table.
 */
export function buildStatementFromLbReport(
  list: unknown,
  kind: "BS" | "CF" | "IS",
  opts?: { maxPeriods?: number; maxRows?: number },
): EarningsStatement | null {
  const maxPeriods = opts?.maxPeriods ?? 8;
  const maxRows = opts?.maxRows ?? 24;
  const root = list as LbFinancialReportsList | null | undefined;
  if (!root || typeof root !== "object") return null;

  const block =
    root[kind] ??
    root[kind.toLowerCase()] ??
    Object.values(root).find(
      (v) =>
        v &&
        typeof v === "object" &&
        Array.isArray((v as { indicators?: unknown }).indicators),
    );

  const indicators = block?.indicators ?? [];
  const accounts: LbAccount[] = [];
  for (const ind of indicators) {
    for (const a of ind.accounts ?? []) accounts.push(a);
  }
  if (!accounts.length) return null;

  const periodMap = new Map<string, StatementPeriod>();
  const byRow = new Map<
    string,
    { label: string; unit: StatementUnit; cells: Map<string, { v: number; yoy: number | null }> }
  >();

  for (const account of accounts) {
    const label = (account.name || account.field || "").trim();
    const key = (account.field || label).trim();
    if (!key || !label) continue;
    let row = byRow.get(key);
    if (!row) {
      row = { label, unit: unitOf(account), cells: new Map() };
      byRow.set(key, row);
    }
    for (const cell of account.values ?? []) {
      const parsed = parsePeriodLabel(String(cell.period ?? ""), cell.year);
      if (!parsed) continue;
      const v = num(cell.value);
      if (v == null) continue;
      const pKey = `${parsed.year}-Q${parsed.quarter}`;
      if (!periodMap.has(pKey)) {
        periodMap.set(pKey, {
          label: shortLabel(parsed.year, parsed.quarter),
          year: parsed.year,
          quarter: parsed.quarter,
        });
      }
      row.cells.set(pKey, { v, yoy: yoyPct(cell.yoy) });
    }
  }

  const periods = [...periodMap.values()]
    .sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.quarter - a.quarter,
    )
    .slice(0, maxPeriods);
  if (!periods.length) return null;

  const periodKeys = periods.map((p) => `${p.year}-Q${p.quarter}`);
  const rows: StatementRow[] = [];
  for (const [key, row] of byRow) {
    const values = periodKeys.map((pk) => row.cells.get(pk)?.v ?? null);
    if (!values.some((v) => v != null)) continue;
    const yoy = periodKeys.map((pk) => row.cells.get(pk)?.yoy ?? null);
    rows.push({ key, label: row.label, unit: row.unit, values, yoy });
  }
  if (!rows.length) return null;

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
