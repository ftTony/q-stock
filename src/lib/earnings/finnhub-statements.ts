import { cachedFetch } from "@/lib/cache";
import { finnhubFetch, FinnhubError } from "@/lib/market/providers/finnhub";
import type {
  EarningsStatement,
  StatementPeriod,
  StatementRow,
} from "@/lib/earnings/types";

type FhRow = Record<string, number | string | null | undefined>;

const BS_FIELDS: Array<{ key: string; label: string }> = [
  { key: "totalAssets", label: "Total Assets" },
  { key: "totalLiabilities", label: "Total Liabilities" },
  { key: "totalEquity", label: "Total Equity" },
  { key: "cash", label: "Cash" },
  { key: "cashShortTermInvestments", label: "Cash & ST Investments" },
  { key: "totalDebt", label: "Total Debt" },
  { key: "currentAssets", label: "Current Assets" },
  { key: "currentLiabilities", label: "Current Liabilities" },
  { key: "longTermDebt", label: "Long Term Debt" },
  { key: "retainedEarnings", label: "Retained Earnings" },
];

const CF_FIELDS: Array<{ key: string; label: string }> = [
  { key: "operatingCashFlow", label: "Operating Cash Flow" },
  { key: "cashFromOperations", label: "Cash From Operations" },
  { key: "investingCashFlow", label: "Investing Cash Flow" },
  { key: "cashFromInvesting", label: "Cash From Investing" },
  { key: "financingCashFlow", label: "Financing Cash Flow" },
  { key: "cashFromFinancing", label: "Cash From Financing" },
  { key: "capex", label: "CapEx" },
  { key: "capitalExpenditures", label: "Capital Expenditures" },
  { key: "freeCashFlow", label: "Free Cash Flow" },
  { key: "netIncome", label: "Net Income" },
];

function periodOf(row: FhRow): StatementPeriod | null {
  const period = String(row.period ?? row.year ?? "");
  const m = period.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const quarter = Math.ceil(month / 3) as 1 | 2 | 3 | 4;
    return {
      label: `${String(year).slice(2)}Q${quarter}`,
      year,
      quarter,
    };
  }
  const y = Number(row.year);
  if (Number.isFinite(y) && y > 1900) {
    return { label: `${String(y).slice(2)}FY`, year: y, quarter: 4 };
  }
  return null;
}

function buildFromRows(
  rows: FhRow[],
  fields: Array<{ key: string; label: string }>,
): EarningsStatement | null {
  const withPeriod = rows
    .map((r) => ({ r, p: periodOf(r) }))
    .filter((x): x is { r: FhRow; p: StatementPeriod } => Boolean(x.p))
    .sort((a, b) =>
      a.p.year !== b.p.year ? b.p.year - a.p.year : b.p.quarter - a.p.quarter,
    )
    .slice(0, 8);
  if (!withPeriod.length) return null;

  const periods = withPeriod.map((x) => x.p);
  const out: StatementRow[] = [];
  for (const f of fields) {
    const values = withPeriod.map((x) => {
      const v = Number(x.r[f.key]);
      return Number.isFinite(v) ? v : null;
    });
    if (!values.some((v) => v != null)) continue;
    const yoy = values.map((cur, i) => {
      if (cur == null) return null;
      const p = periods[i];
      if (!p) return null;
      const prior = withPeriod.find(
        (x) => x.p.year === p.year - 1 && x.p.quarter === p.quarter,
      );
      const pv = prior ? Number(prior.r[f.key]) : NaN;
      if (!Number.isFinite(pv) || pv === 0) return null;
      return ((cur - pv) / Math.abs(pv)) * 100;
    });
    out.push({
      key: f.key,
      label: f.label,
      unit: "currency",
      values,
      yoy,
    });
  }
  if (!out.length) return null;
  return { periods, rows: out };
}

async function fetchFhStatement(
  symbol: string,
  statement: "bs" | "cf",
): Promise<FhRow[]> {
  try {
    const data = await finnhubFetch<{ financials?: FhRow[] }>(
      "/stock/financials",
      { symbol, statement, freq: "quarterly" },
    );
    return Array.isArray(data?.financials) ? data.financials : [];
  } catch (err) {
    if (err instanceof FinnhubError && (err.status === 403 || err.status === 404)) {
      return [];
    }
    return [];
  }
}

/** Free-tier Finnhub quarterly BS / CF when broker statements unavailable. */
export async function loadFinnhubStatements(symbol: string): Promise<{
  balance: EarningsStatement | null;
  cashflow: EarningsStatement | null;
}> {
  return cachedFetch(`fh:stmt:v1:${symbol}`, 600_000, async () => {
    const [bs, cf] = await Promise.all([
      fetchFhStatement(symbol, "bs"),
      fetchFhStatement(symbol, "cf"),
    ]);
    return {
      balance: buildFromRows(bs, BS_FIELDS),
      cashflow: buildFromRows(cf, CF_FIELDS),
    };
  });
}
