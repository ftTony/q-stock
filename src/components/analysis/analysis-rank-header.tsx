"use client";

import type { CSSProperties, RefObject } from "react";
import { useTranslations } from "next-intl";
import { SortIcon } from "@/components/analysis/analysis-rank-cells";
import {
  ANALYSIS_COL_LABEL_KEY,
  type AnalysisColId,
  type AnalysisPinId,
} from "@/components/analysis/analysis-rank-columns";
import type { useAnalysisRankColumns } from "@/components/analysis/use-analysis-rank-columns";

type Cols = ReturnType<typeof useAnalysisRankColumns>;

const midClipX =
  "min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent";

const thClass =
  "border-b border-[var(--border)] bg-[var(--panel)] px-2 py-2 font-medium";

/** Hit target only — column guide is painted on th/td via qt-resize-hover-line. */
function PinResizeHandle({
  id,
  cols,
  /** Pull off the panel edge so overflow-hidden parents don't clip the cue. */
  insetEnd = false,
}: {
  id: AnalysisPinId;
  cols: Cols;
  insetEnd?: boolean;
}) {
  const t = useTranslations("analysis");
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      title={t("columnResizeHint")}
      onPointerDown={(e) => cols.startPinResize(e, id)}
      onPointerEnter={() => cols.applyResizeHover(id)}
      onPointerLeave={() => cols.applyResizeHover(null)}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-0 z-20 h-full w-3 cursor-col-resize touch-none ${
        insetEnd ? "right-0.5" : "right-0"
      }`}
    />
  );
}

export function AnalysisRankHeader({
  cols,
  leftW,
  midStyle,
  midHeadRef,
  syncH,
}: {
  cols: Cols;
  leftW: number;
  midStyle: CSSProperties;
  midHeadRef: RefObject<HTMLDivElement | null>;
  syncH: (from: "head" | "body" | "foot") => void;
}) {
  const t = useTranslations("analysis");
  const tMarket = useTranslations("market");
  const { check, symbol: symW, name: nameW, actions: actW } = cols.pinWidths;

  return (
    <div className="flex shrink-0 bg-[var(--panel)]">
      <div
        ref={cols.leftHeadWrapRef}
        className="shrink-0"
        style={{ width: leftW }}
      >
        <table
          ref={cols.leftHeadTableRef}
          className="table-fixed border-separate border-spacing-0 text-sm"
          style={{ width: leftW }}
        >
          <colgroup>
            <col data-pin-col="check" style={{ width: check }} />
            <col data-pin-col="symbol" style={{ width: symW }} />
            <col data-pin-col="name" style={{ width: nameW }} />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] text-[var(--muted)]">
              <th
                data-pin-col="check"
                className={thClass}
                style={{ width: check }}
              />
              <th
                data-pin-col="symbol"
                data-resize-col="symbol"
                className={`${thClass} relative${
                  cols.resizeHoverCol === "symbol" ? " qt-resize-hover-line" : ""
                }`}
                style={{ width: symW }}
              >
                {t("colCode")}
                <PinResizeHandle id="symbol" cols={cols} />
              </th>
              <th
                data-pin-col="name"
                data-resize-col="name"
                className={`${thClass} relative${
                  cols.resizeHoverCol === "name" ? " qt-resize-hover-line" : ""
                }`}
                style={{ width: nameW }}
              >
                {t("colName")}
                <PinResizeHandle id="name" cols={cols} />
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div
        ref={midHeadRef}
        className={midClipX}
        onScroll={() => syncH("head")}
      >
        <table
          ref={cols.headTableRef}
          className="table-fixed border-separate border-spacing-0 text-sm"
          style={midStyle}
        >
          <colgroup>
            {cols.order.map((id: AnalysisColId) => (
              <col key={id} style={{ width: `var(--cw-${id})` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] text-[var(--muted)]">
              {cols.order.map((id: AnalysisColId) => {
                const active = cols.sortKey === id;
                const label = t(ANALYSIS_COL_LABEL_KEY[id]);
                return (
                  <th
                    key={id}
                    data-col-id={id}
                    data-resize-col={id}
                    onPointerDown={(e) => cols.startColDrag(e, id, label)}
                    className={`${thClass} relative cursor-grab touch-none whitespace-nowrap text-right${
                      cols.resizeHoverCol === id ? " qt-resize-hover-line" : ""
                    }`}
                    style={{ width: `var(--cw-${id})` }}
                  >
                    <button
                      type="button"
                      className={`inline-flex max-w-full items-center justify-end font-medium ${
                        active ? "text-[var(--foreground)]" : ""
                      }`}
                      onClick={() => cols.toggleSort(id)}
                    >
                      <span className="truncate">{label}</span>
                      <SortIcon dir={active ? cols.sortDir : null} />
                    </button>
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      title={t("columnResizeHint")}
                      onPointerDown={(e) => cols.startResize(e, id)}
                      onPointerEnter={() => cols.applyResizeHover(id)}
                      onPointerLeave={() => cols.applyResizeHover(null)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>
      <div
        ref={cols.rightHeadWrapRef}
        className="shrink-0"
        style={{ width: actW }}
      >
        <table
          ref={cols.rightHeadTableRef}
          className="table-fixed border-separate border-spacing-0 text-sm"
          style={{ width: actW }}
        >
          <colgroup>
            <col data-pin-col="actions" style={{ width: actW }} />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] text-[var(--muted)]">
              <th
                data-pin-col="actions"
                data-resize-col="actions"
                className={`${thClass} relative text-right${
                  cols.resizeHoverCol === "actions" ? " qt-resize-hover-line" : ""
                }`}
                style={{ width: actW }}
              >
                {/*
                  Mid|ops boundary sits on the pin's left edge — mid pane's last
                  col handle is easy to miss there. Bridge: hover/drag here
                  resizes the last mid metric column.
                */}
                {cols.order.length > 0 ? (
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    title={t("columnResizeHint")}
                    onPointerDown={(e) => {
                      const last = cols.order[cols.order.length - 1];
                      if (last) cols.startResize(e, last);
                    }}
                    onPointerEnter={() => {
                      const last = cols.order[cols.order.length - 1];
                      if (last) cols.applyResizeHover(last);
                    }}
                    onPointerLeave={() => cols.applyResizeHover(null)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-0 z-20 h-full w-2.5 cursor-col-resize touch-none"
                  />
                ) : null}
                {tMarket("actions")}
                <PinResizeHandle id="actions" cols={cols} insetEnd />
              </th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
}
