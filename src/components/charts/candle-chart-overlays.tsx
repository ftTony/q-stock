"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DrawingToolIcon,
  type DrawingTool,
} from "@/components/charts/chart-drawing-icons";

export type IndicatorFlags = {
  ma: boolean;
  ema: boolean;
  boll: boolean;
  rsi: boolean;
  macd: boolean;
};

const DRAWING_TOOLS: { id: DrawingTool; labelKey: string }[] = [
  { id: "segment", labelKey: "drawSegment" },
  { id: "rayLine", labelKey: "drawRay" },
  { id: "straightLine", labelKey: "drawLine" },
  { id: "horizontalStraightLine", labelKey: "drawHLine" },
  { id: "verticalStraightLine", labelKey: "drawVLine" },
  { id: "parallelStraightLine", labelKey: "drawParallel" },
  { id: "fibonacciLine", labelKey: "drawFib" },
  { id: "priceLine", labelKey: "drawPrice" },
  { id: "brush", labelKey: "drawBrush" },
];

const INDICATOR_KEYS = [
  ["ma", "MA"],
  ["ema", "EMA"],
  ["boll", "BOLL"],
  ["rsi", "RSI"],
  ["macd", "MACD"],
] as const;

type Props = {
  drawingTool: DrawingTool;
  onStartDrawing: (tool: DrawingTool) => void;
  onClearDrawings: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  flags: IndicatorFlags;
  onFlagToggle?: (key: keyof IndicatorFlags) => void;
  indicatorsLabel?: string;
  loadingMore?: boolean;
};

function toolBtnClass(active: boolean) {
  return `flex h-8 w-8 items-center justify-center rounded-md border ${
    active
      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
      : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
  }`;
}

/** Drawing strip, indicator pills, fullscreen — responsive for small screens. */
export function CandleChartOverlays({
  drawingTool,
  onStartDrawing,
  onClearDrawings,
  fullscreen,
  onToggleFullscreen,
  flags,
  onFlagToggle,
  indicatorsLabel,
  loadingMore,
}: Props) {
  const t = useTranslations("symbol");
  const [mounted, setMounted] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (drawingTool !== "none") setMobileToolsOpen(true);
  }, [drawingTool]);

  const strip = (
    <div className="pointer-events-auto flex max-h-full w-10 flex-col items-center gap-0.5 overflow-y-auto rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 py-1 shadow-sm backdrop-blur-sm qt-scroll sm:w-11">
      <button
        type="button"
        title={t("drawPan")}
        aria-label={t("drawPan")}
        onClick={() => {
          onStartDrawing("none");
          setMobileToolsOpen(false);
        }}
        className={toolBtnClass(drawingTool === "none")}
      >
        <DrawingToolIcon tool="none" />
      </button>
      {DRAWING_TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          title={t(tool.labelKey)}
          aria-label={t(tool.labelKey)}
          onClick={() => onStartDrawing(tool.id)}
          className={toolBtnClass(drawingTool === tool.id)}
        >
          <DrawingToolIcon tool={tool.id} />
        </button>
      ))}
      <button
        type="button"
        title={t("drawClear")}
        aria-label={t("drawClear")}
        onClick={() => {
          onClearDrawings();
          setMobileToolsOpen(false);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
      >
        <DrawingToolIcon tool="clear" />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle only after mount (avoids SSR/client aria mismatch); md+: strip always on */}
      <div className="pointer-events-none absolute bottom-10 left-0 top-[40px] z-10 flex flex-col items-start gap-1 p-1.5 sm:p-2 md:top-[45px]">
        {mounted ? (
          <button
            type="button"
            title={t("drawing")}
            aria-label={t("drawing")}
            onClick={() => setMobileToolsOpen((o) => !o)}
            className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm md:hidden ${
              mobileToolsOpen || drawingTool !== "none"
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                : "border-[var(--border)]/80 bg-[var(--panel)]/90 text-[var(--muted)]"
            }`}
          >
            <DrawingToolIcon tool="segment" />
          </button>
        ) : null}
        <div
          className={`${
            mobileToolsOpen ? "flex" : "hidden"
          } md:flex`}
        >
          {strip}
        </div>
      </div>

      <div className="pointer-events-none absolute right-12 top-0 z-10 p-2 sm:right-14 sm:p-2.5 lg:right-16">
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}
          title={fullscreen ? t("exitFullscreen") : t("fullscreen")}
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 text-[var(--muted)] shadow-sm backdrop-blur-sm hover:text-[var(--foreground)]"
        >
          {fullscreen ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>
      </div>

      {/* Floating indicators: md+ only; mobile uses chart section toolbar */}
      {onFlagToggle ? (
        <div className="pointer-events-none absolute bottom-28 left-12 z-10 hidden sm:bottom-32 sm:left-14 md:block lg:bottom-36">
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 px-1.5 py-1 text-[11px] shadow-sm backdrop-blur-sm sm:text-xs">
            {indicatorsLabel ? (
              <span className="px-1 text-[var(--muted)]">{indicatorsLabel}</span>
            ) : null}
            {INDICATOR_KEYS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onFlagToggle(key)}
                className={`rounded-md border px-2 py-0.5 ${
                  flags[key]
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loadingMore ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-[var(--panel)]/90 px-2 py-1 text-xs text-[var(--muted)] shadow md:left-14">
          …
        </div>
      ) : null}
    </>
  );
}

export { INDICATOR_KEYS };
