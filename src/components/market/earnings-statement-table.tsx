"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CompareMode } from "@/components/market/earnings-compare";
import {
  fmtDeltaPct,
  fmtValue,
  qoqSeries,
} from "@/components/market/earnings-compare";
import { useDragPanX } from "@/hooks/use-drag-pan-x";
import type { StatementPeriod, StatementRow } from "@/lib/earnings/types";

const COL_W = 88;
const LABEL_W = 112;

type GroupId = "profit" | "solvency" | "operating" | "other";

const SELECTED_BG =
  "bg-[color-mix(in_srgb,var(--brand)_12%,var(--panel,var(--background)))]";
const IDLE_BG = "bg-[var(--panel,var(--background))]";
/** Apply on every <td> — <tr> backgrounds often don't paint in tables. */
const ROW_HOVER =
  "group-hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--panel,var(--background)))]";

export function EarningsStatementTable({
  periods,
  profitRows,
  solvencyRows,
  operatingRows,
  otherRows,
  variant,
  compareMode,
  activeKey,
  cornerLabel,
  groupProfitability,
  groupSolvency,
  groupOperating,
  otherTitle,
  openGroups,
  onToggleGroup,
  onSelectRow,
  rowLabel,
  panKey,
}: {
  periods: StatementPeriod[];
  profitRows: StatementRow[];
  solvencyRows: StatementRow[];
  operatingRows: StatementRow[];
  otherRows: StatementRow[];
  variant: "metrics" | "statement";
  compareMode: CompareMode;
  activeKey: string;
  cornerLabel: string;
  groupProfitability: string;
  groupSolvency: string;
  groupOperating: string;
  otherTitle: string;
  openGroups: Record<GroupId, boolean>;
  onToggleGroup: (id: GroupId) => void;
  onSelectRow: (key: string) => void;
  rowLabel: (key: string, custom?: string) => string;
  panKey: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { dragging } = useDragPanX(bodyRef, panKey);
  const [canScrollX, setCanScrollX] = useState(false);
  const tableMinW = LABEL_W + Math.max(periods.length, 1) * COL_W;

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const bar = barRef.current;
    if (!body) return;
    const measure = () => {
      setCanScrollX(body.scrollWidth > body.clientWidth + 1);
      if (bar) bar.scrollLeft = body.scrollLeft;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(body);
    return () => ro.disconnect();
  }, [panKey, tableMinW]);

  useEffect(() => {
    const body = bodyRef.current;
    const bar = barRef.current;
    if (!body || !bar) return;
    let lock = false;
    const sync = (from: HTMLElement, to: HTMLElement) => {
      if (lock) return;
      lock = true;
      to.scrollLeft = from.scrollLeft;
      lock = false;
    };
    const onBody = () => sync(body, bar);
    const onBar = () => sync(bar, body);
    body.addEventListener("scroll", onBody, { passive: true });
    bar.addEventListener("scroll", onBar, { passive: true });
    bar.scrollLeft = body.scrollLeft;
    return () => {
      body.removeEventListener("scroll", onBody);
      bar.removeEventListener("scroll", onBar);
    };
  }, [panKey, tableMinW, canScrollX]);

  function renderRow(row: StatementRow) {
    const active = row.key === activeKey;
    const delta =
      compareMode === "off"
        ? null
        : compareMode === "yoy"
          ? row.yoy
          : qoqSeries(row.values);
    const cellBg = active ? SELECTED_BG : `${IDLE_BG} ${ROW_HOVER}`;
    return (
      <tr
        key={row.key}
        className="group cursor-pointer"
        onClick={() => onSelectRow(row.key)}
      >
        <td
          className={`sticky left-0 z-[2] truncate py-2.5 pr-3 text-left font-medium ${cellBg}`}
          style={{ minWidth: LABEL_W, width: LABEL_W, maxWidth: LABEL_W }}
        >
          <span className="inline-flex max-w-full items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                active ? "bg-[var(--brand)]" : "bg-[var(--muted)] opacity-40"
              }`}
            />
            <span
              className={`truncate ${
                active
                  ? "text-[var(--brand-text)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {rowLabel(row.key, row.label)}
            </span>
          </span>
        </td>
        {row.values.map((v, i) => (
          <td
            key={i}
            className={`px-1.5 py-2.5 text-right tabular-nums leading-tight ${cellBg}`}
            style={{ minWidth: COL_W, width: COL_W }}
          >
            <div className="text-[var(--foreground)]">
              {fmtValue(v, row.unit)}
            </div>
            {delta ? (
              <div
                className={`text-[10px] ${
                  (delta[i] ?? 0) >= 0
                    ? "text-[var(--up)]"
                    : "text-[var(--down)]"
                }`}
              >
                {fmtDeltaPct(delta[i] ?? null)}
              </div>
            ) : null}
          </td>
        ))}
      </tr>
    );
  }

  function renderGroup(id: GroupId, title: string, rows: StatementRow[]) {
    if (!rows.length) return null;
    const open = openGroups[id];
    return (
      <tbody key={id}>
        <tr>
          <td
            className={`sticky left-0 z-[2] py-2 pr-3 ${IDLE_BG}`}
            style={{ minWidth: LABEL_W, width: LABEL_W, maxWidth: LABEL_W }}
          >
            <button
              type="button"
              className="inline-flex max-w-full items-center gap-1 text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]"
              onClick={(e) => {
                e.stopPropagation();
                onToggleGroup(id);
              }}
              aria-expanded={open}
            >
              <svg
                className={`h-3 w-3 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              <span className="truncate">{title}</span>
            </button>
          </td>
          {periods.length > 0 ? (
            <td colSpan={periods.length} className={IDLE_BG} aria-hidden />
          ) : null}
        </tr>
        {open ? rows.map(renderRow) : null}
      </tbody>
    );
  }

  const table = (
    <table
      className="border-separate border-spacing-0 text-[12px]"
      style={{ minWidth: tableMinW, width: tableMinW }}
    >
      <thead>
        <tr>
          <th
                className={`sticky left-0 top-0 z-[3] py-2 pr-3 text-left text-[11px] font-medium text-[var(--muted)] ${IDLE_BG}`}
            style={{
              minWidth: LABEL_W,
              width: LABEL_W,
              maxWidth: LABEL_W,
            }}
          >
            {cornerLabel}
          </th>
          {periods.map((p) => (
            <th
              key={`${p.year}-Q${p.quarter}`}
              className={`sticky top-0 z-[2] px-1.5 py-2 text-right text-[11px] font-medium tabular-nums text-[var(--muted)] ${IDLE_BG}`}
              style={{ minWidth: COL_W, width: COL_W }}
            >
              {p.label}
            </th>
          ))}
        </tr>
      </thead>
      {renderGroup("profit", groupProfitability, profitRows)}
      {renderGroup("solvency", groupSolvency, solvencyRows)}
      {renderGroup("operating", groupOperating, operatingRows)}
      {variant === "statement"
        ? renderGroup("other", otherTitle, otherRows)
        : null}
    </table>
  );

  return (
    <div className="flex max-h-[min(52vh,420px)] w-full min-w-0 flex-col">
      {/* Native bars hidden; Y still wheel-scrollable. X driven by bottom mirror. */}
      <div
        ref={bodyRef}
        className={`min-h-0 w-full min-w-0 flex-1 overflow-auto overscroll-contain select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {table}
      </div>
      {canScrollX ? (
        <div
          ref={barRef}
          className="qt-scroll h-3 shrink-0 overflow-x-auto overflow-y-hidden border-t border-[var(--aw-hairline,var(--border))] bg-[var(--panel,var(--background))]"
          aria-label="horizontal scroll"
        >
          <div style={{ width: tableMinW, height: 1 }} aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
