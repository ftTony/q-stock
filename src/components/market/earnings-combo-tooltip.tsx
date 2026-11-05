"use client";

import { createPortal } from "react-dom";
import { EARNINGS_YOY_COLOR } from "@/components/market/earnings-compare";

export type ComboTipPos = {
  left: number;
  top: number;
  place: "above" | "below";
};

export type ComboTipData = {
  period: string;
  value: string;
  yoy: string | null;
};

export function EarningsComboTooltip({
  tip,
  tipPos,
  valueLabel,
  compareLabel,
}: {
  tip: ComboTipData;
  tipPos: ComboTipPos;
  valueLabel: string;
  compareLabel: string;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[100] min-w-[10.5rem] rounded-none border border-[var(--border)] bg-[var(--panel)] px-2.5 py-2 shadow-md"
      style={{
        left: tipPos.left,
        top: tipPos.top,
        transform:
          tipPos.place === "above"
            ? "translate(-50%, -100%)"
            : "translate(-50%, 0)",
      }}
      role="tooltip"
    >
      <div className="mb-1.5 text-[12px] font-semibold text-[var(--foreground)]">
        {tip.period}
      </div>
      <div className="flex items-center justify-between gap-4 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
          <span className="inline-block h-2 w-2 shrink-0 rounded-none bg-[var(--brand)]" />
          {valueLabel}
        </span>
        <span className="tabular-nums text-[var(--foreground)]">{tip.value}</span>
      </div>
      {tip.yoy != null ? (
        <div className="mt-1 flex items-center justify-between gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
            <span
              className="inline-block h-0.5 w-2.5 shrink-0"
              style={{ background: EARNINGS_YOY_COLOR }}
            />
            {compareLabel}
          </span>
          <span className="tabular-nums text-[var(--foreground)]">{tip.yoy}</span>
        </div>
      ) : null}
      {tipPos.place === "above" ? (
        <>
          <div
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-[var(--border)]"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[var(--panel)]"
            style={{ marginTop: -1 }}
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[6px] border-x-transparent border-b-[var(--border)]"
            aria-hidden
          />
          <div
            className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[5px] border-x-transparent border-b-[var(--panel)]"
            style={{ marginBottom: -1 }}
            aria-hidden
          />
        </>
      )}
    </div>,
    document.body,
  );
}
