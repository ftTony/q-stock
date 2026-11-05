"use client";

import { useEffect, useMemo, useState } from "react";
import {
  chronologicRow,
  EARNINGS_YOY_COLOR,
  filterByPeriodSelection,
  type CompareMode,
} from "@/components/market/earnings-compare";
import { EarningsComboChart } from "@/components/market/earnings-combo-chart";
import {
  EarningsPeriodPicker,
  type PeriodPickerLabels,
  type PeriodSelection,
} from "@/components/market/earnings-period-picker";
import { EarningsStatementTable } from "@/components/market/earnings-statement-table";
import { QtSelect } from "@/components/ui/qt-select";
import type { EarningsStatement, StatementRow } from "@/lib/earnings/types";

export type EarningsStatementLabels = PeriodPickerLabels & {
  statementTitle: string;
  showYoy: string;
  showQoq: string;
  compareOff: string;
  collapseChart: string;
  expandChart: string;
  currency: string;
  periodAsOf: string;
  yoy: string;
  qoq: string;
  groupProfitability: string;
  groupSolvency: string;
  groupOperating: string;
  rowRevenue: string;
  rowEps: string;
  rowGrossMargin: string;
  rowOpMargin: string;
  rowNetMargin: string;
  rowRoe: string;
  rowRoa: string;
  rowCurrentRatio: string;
  rowQuickRatio: string;
  rowDebtToEquity: string;
  rowDebtToAsset: string;
  rowAssetTurnover: string;
  rowInventoryTurnover: string;
  rowReceivablesTurnover: string;
};

const ROW_LABEL_KEY: Record<string, keyof EarningsStatementLabels> = {
  revenue: "rowRevenue",
  eps: "rowEps",
  grossMargin: "rowGrossMargin",
  operatingMargin: "rowOpMargin",
  netMargin: "rowNetMargin",
  roe: "rowRoe",
  roa: "rowRoa",
  currentRatio: "rowCurrentRatio",
  quickRatio: "rowQuickRatio",
  debtToEquity: "rowDebtToEquity",
  debtToAsset: "rowDebtToAsset",
  assetTurnover: "rowAssetTurnover",
  inventoryTurnover: "rowInventoryTurnover",
  receivablesTurnover: "rowReceivablesTurnover",
};

const PROFIT_KEYS = [
  "grossMargin",
  "operatingMargin",
  "netMargin",
  "roe",
  "roa",
] as const;
const SOLVENCY_KEYS = [
  "currentRatio",
  "quickRatio",
  "debtToEquity",
  "debtToAsset",
] as const;
const OPERATING_KEYS = [
  "assetTurnover",
  "inventoryTurnover",
  "receivablesTurnover",
] as const;

const METRIC_KEYS = new Set<string>([
  ...PROFIT_KEYS,
  ...SOLVENCY_KEYS,
  ...OPERATING_KEYS,
]);

const DEFAULT_PERIOD: PeriodSelection = { freq: "quarter", scope: "all" };

type GroupId = "profit" | "solvency" | "operating" | "other";

function rowLabel(
  key: string,
  labels: EarningsStatementLabels,
  custom?: string,
): string {
  if (custom) return custom;
  const k = ROW_LABEL_KEY[key];
  return k ? String(labels[k]) : key;
}

function pickRows(rows: StatementRow[], keys: readonly string[]): StatementRow[] {
  const map = new Map(rows.map((r) => [r.key, r]));
  return keys.map((k) => map.get(k)).filter((r): r is StatementRow => Boolean(r));
}

/** Prefer ratio series for 关键指标. */
export function filterMetricsStatement(
  statement: EarningsStatement,
): EarningsStatement | null {
  const rows = statement.rows.filter((r) => METRIC_KEYS.has(r.key));
  if (!rows.length) return null;
  return { periods: statement.periods, rows };
}

const INCOME_KEYS = new Set<string>([
  "revenue",
  "eps",
  "grossMargin",
  "operatingMargin",
  "netMargin",
  "grossProfit",
  "operatingIncome",
  "netIncome",
  "ebit",
  "ebitda",
]);

/** 利润表：收入/利润/EPS + 利润率，排除偿债与营运周转. */
export function filterIncomeStatement(
  statement: EarningsStatement,
): EarningsStatement | null {
  const rows = statement.rows.filter(
    (r) => INCOME_KEYS.has(r.key) || (!METRIC_KEYS.has(r.key) && r.unit !== "ratio"),
  );
  // Prefer explicit income keys when present; otherwise keep non-metric rows.
  const preferred = rows.filter((r) => INCOME_KEYS.has(r.key));
  const use = preferred.length ? preferred : rows;
  if (!use.length) return null;
  return { periods: statement.periods, rows: use };
}

export function EarningsStatementSection({
  statement,
  labels,
  showTitle = true,
  variant = "statement",
}: {
  statement: EarningsStatement;
  labels: EarningsStatementLabels;
  showTitle?: boolean;
  /** metrics = 关键指标 groups; statement = 利润表等完整行 */
  variant?: "metrics" | "statement";
}) {
  const defaultKey = useMemo(() => {
    const prefer =
      variant === "metrics"
        ? ["grossMargin", "operatingMargin", "netMargin", "roe"]
        : ["revenue", "eps", "grossMargin", "operatingMargin"];
    for (const k of prefer) {
      if (statement.rows.some((r) => r.key === k)) return k;
    }
    return statement.rows[0]?.key ?? "eps";
  }, [statement.rows, variant]);

  const [selected, setSelected] = useState(defaultKey);
  const [compareMode, setCompareMode] = useState<CompareMode>("yoy");
  const [chartOpen, setChartOpen] = useState(true);
  const [periodSel, setPeriodSel] = useState<PeriodSelection>(DEFAULT_PERIOD);
  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>({
    profit: true,
    solvency: true,
    operating: true,
    other: true,
  });

  useEffect(() => {
    setSelected(defaultKey);
  }, [defaultKey]);

  const view = useMemo(
    () => filterByPeriodSelection(statement, periodSel),
    [statement, periodSel],
  );

  const activeKey = view.rows.some((r) => r.key === selected)
    ? selected
    : defaultKey;
  const activeRow = view.rows.find((r) => r.key === activeKey);

  const tablePeriods = useMemo(
    () => [...view.periods].reverse(),
    [view.periods],
  );
  const tableRows = useMemo(
    () => view.rows.map(chronologicRow),
    [view.rows],
  );
  const tablePanKey = `${periodSel.freq}:${periodSel.scope}:${tablePeriods.length}`;

  const profitRows = pickRows(tableRows, PROFIT_KEYS);
  const solvencyRows = pickRows(tableRows, SOLVENCY_KEYS);
  const operatingRows = pickRows(tableRows, OPERATING_KEYS);
  const otherRows = tableRows.filter((r) => !METRIC_KEYS.has(r.key));
  const hasData = view.periods.length > 0 && view.rows.length > 0;

  if (!statement.periods.length || !statement.rows.length) return null;

  const periodPickerLabels: PeriodPickerLabels = {
    freqAnnual: labels.freqAnnual,
    freqQuarter: labels.freqQuarter,
    freqCumulative: labels.freqCumulative,
    scopeAll: labels.scopeAll,
    scopeQ1: labels.scopeQ1,
    scopeQ2: labels.scopeQ2,
    scopeQ3: labels.scopeQ3,
    scopeQ4: labels.scopeQ4,
  };
  const compareOptions = [
    { value: "yoy", label: labels.showYoy },
    { value: "qoq", label: labels.showQoq },
    { value: "off", label: labels.compareOff },
  ];
  const compareLabel = compareMode === "qoq" ? labels.qoq : labels.yoy;
  const cornerLabel =
    variant === "metrics" ? labels.periodAsOf : labels.currency;

  return (
    <section className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {showTitle ? (
            <h3 className="mr-1 text-[13px] font-semibold tracking-[-0.15px] text-[var(--foreground)]">
              {labels.statementTitle}
            </h3>
          ) : null}
          <EarningsPeriodPicker
            value={periodSel}
            onChange={setPeriodSel}
            labels={periodPickerLabels}
          />
          <QtSelect
            value={compareMode}
            onChange={(v) => setCompareMode(v as CompareMode)}
            options={compareOptions}
            aria-label={labels.showYoy}
            triggerClassName="h-7 min-w-[6.5rem] rounded-none px-2 text-[12px]"
          />
        </div>
        <button
          type="button"
          className="inline-flex h-7 items-center rounded-none px-2 text-[11px] font-medium text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]"
          onClick={() => setChartOpen((v) => !v)}
        >
          {chartOpen ? labels.collapseChart : labels.expandChart}
        </button>
      </div>

      {!hasData ? <p className="aw-caption py-6 text-center">—</p> : null}

      {hasData && chartOpen && activeRow ? (
        <div className="space-y-2">
          <EarningsComboChart
            statement={view}
            rowKey={activeKey}
            compareMode={compareMode}
            valueLabel={rowLabel(activeKey, labels, activeRow.label)}
            compareLabel={compareLabel}
          />
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-none bg-[var(--brand)]" />
              {rowLabel(activeKey, labels, activeRow.label)}
            </span>
            {compareMode !== "off" ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-3"
                  style={{ background: EARNINGS_YOY_COLOR }}
                />
                {compareLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasData ? (
        <EarningsStatementTable
          periods={tablePeriods}
          profitRows={profitRows}
          solvencyRows={solvencyRows}
          operatingRows={operatingRows}
          otherRows={otherRows}
          variant={variant}
          compareMode={compareMode}
          activeKey={activeKey}
          cornerLabel={cornerLabel}
          groupProfitability={labels.groupProfitability}
          groupSolvency={labels.groupSolvency}
          groupOperating={labels.groupOperating}
          otherTitle={labels.statementTitle}
          openGroups={openGroups}
          onToggleGroup={(id) =>
            setOpenGroups((g) => ({ ...g, [id]: !g[id] }))
          }
          onSelectRow={(key) => {
            setSelected(key);
            setChartOpen(true);
          }}
          rowLabel={(key, custom) => rowLabel(key, labels, custom)}
          panKey={tablePanKey}
        />
      ) : null}
    </section>
  );
}
