"use client";

import { useMemo, useState } from "react";
import { EarningsComboChart } from "@/components/market/earnings-combo-chart";
import { formatNumber } from "@/lib/format-number";
import type { EarningsStatement } from "@/lib/earnings/types";

type Labels = {
  statementTitle: string;
  showYoy: string;
  hideYoy: string;
  collapseChart: string;
  expandChart: string;
  currency: string;
  yoy: string;
  rowRevenue: string;
  rowEps: string;
  rowGrossMargin: string;
  rowOpMargin: string;
  rowNetMargin: string;
  rowRoe: string;
};

const ROW_LABEL_KEY: Record<string, keyof Labels> = {
  revenue: "rowRevenue",
  eps: "rowEps",
  grossMargin: "rowGrossMargin",
  operatingMargin: "rowOpMargin",
  netMargin: "rowNetMargin",
  roe: "rowRoe",
};

function rowLabel(
  key: string,
  labels: Labels,
  custom?: string,
): string {
  if (custom) return custom;
  const k = ROW_LABEL_KEY[key];
  return k ? labels[k] : key;
}

function fmtValue(
  v: number | null,
  unit: "currency" | "eps" | "percent",
): string {
  if (v == null || Number.isNaN(v)) return "—";
  if (unit === "percent") return `${v.toFixed(2)}%`;
  if (unit === "eps") {
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

function fmtYoy(v: number | null): string {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function EarningsStatementSection({
  statement,
  labels,
}: {
  statement: EarningsStatement;
  labels: Labels;
}) {
  const defaultKey = useMemo(() => {
    const prefer = ["revenue", "eps", "grossMargin"];
    for (const k of prefer) {
      if (statement.rows.some((r) => r.key === k)) return k;
    }
    return statement.rows[0]?.key ?? "eps";
  }, [statement.rows]);

  const [selected, setSelected] = useState(defaultKey);
  const [showYoy, setShowYoy] = useState(true);
  const [chartOpen, setChartOpen] = useState(true);

  const activeKey = statement.rows.some((r) => r.key === selected)
    ? selected
    : defaultKey;
  const activeRow = statement.rows.find((r) => r.key === activeKey);

  if (!statement.periods.length || !statement.rows.length) return null;

  const btn =
    "inline-flex h-7 items-center rounded-md px-2 text-[11px] font-medium text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-[-0.15px] text-[var(--foreground)]">
          {labels.statementTitle}
        </h3>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={btn}
            onClick={() => setShowYoy((v) => !v)}
          >
            {showYoy ? labels.hideYoy : labels.showYoy}
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => setChartOpen((v) => !v)}
          >
            {chartOpen ? labels.collapseChart : labels.expandChart}
          </button>
        </div>
      </div>

      {chartOpen && activeRow ? (
        <div className="space-y-2">
          <EarningsComboChart
            statement={statement}
            rowKey={activeKey}
            showYoy={showYoy}
            valueLabel={rowLabel(activeKey, labels, activeRow.label)}
            yoyLabel={labels.yoy}
          />
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[var(--brand)]" />
              {rowLabel(activeKey, labels, activeRow.label)}
            </span>
            {showYoy ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-3"
                  style={{ background: "#e8873a" }}
                />
                {labels.yoy}
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-[var(--muted)]">{labels.currency}</p>
        </div>
      ) : null}

      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[480px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[var(--aw-hairline,var(--border))]">
              <th className="sticky left-0 bg-[var(--panel,var(--background))] py-2 pr-3 text-left text-[11px] font-medium text-[var(--muted)]">
                {" "}
              </th>
              {statement.periods.map((p) => (
                <th
                  key={p.label}
                  className="px-2 py-2 text-right text-[11px] font-medium tabular-nums text-[var(--muted)]"
                >
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statement.rows.map((row) => {
              const active = row.key === activeKey;
              return (
                <tr
                  key={row.key}
                  className={`cursor-pointer border-b border-[var(--aw-hairline,var(--border))] last:border-0 ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--brand)_10%,transparent)]"
                      : "hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
                  }`}
                  onClick={() => {
                    setSelected(row.key);
                    setChartOpen(true);
                  }}
                >
                  <td
                    className={`sticky left-0 py-2.5 pr-3 text-left font-medium ${
                      active
                        ? "bg-[color-mix(in_srgb,var(--brand)_10%,var(--panel,var(--background)))]"
                        : "bg-[var(--panel,var(--background))]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          active ? "bg-[var(--brand)]" : "bg-[var(--muted)] opacity-50"
                        }`}
                      />
                      {rowLabel(row.key, labels, row.label)}
                    </span>
                  </td>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className="px-2 py-2.5 text-right tabular-nums leading-tight"
                    >
                      <div className="text-[var(--foreground)]">
                        {fmtValue(v, row.unit)}
                      </div>
                      {showYoy ? (
                        <div
                          className={`text-[10px] ${
                            (row.yoy[i] ?? 0) >= 0
                              ? "text-[var(--up)]"
                              : "text-[var(--down)]"
                          }`}
                        >
                          {fmtYoy(row.yoy[i] ?? null)}
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
