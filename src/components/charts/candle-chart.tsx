"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { OhlcvBar } from "@/lib/types";
import { usePreference } from "@/components/providers/preference-provider";
import {
  DrawingToolIcon,
  type DrawingTool,
} from "@/components/charts/chart-drawing-icons";

export type { DrawingTool };
export type IndicatorFlags = {
  ma: boolean;
  ema: boolean;
  boll: boolean;
  rsi: boolean;
  macd: boolean;
};

type KLineChartsModule = typeof import("klinecharts");
type ChartInstance = NonNullable<ReturnType<KLineChartsModule["init"]>>;

function toKLineData(bars: OhlcvBar[]) {
  return bars.map((b) => ({
    timestamp: b.time * 1000,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    up: styles.getPropertyValue("--up").trim() || "#e11d48",
    down: styles.getPropertyValue("--down").trim() || "#16a34a",
    fg: styles.getPropertyValue("--foreground").trim() || "#edf2ff",
    muted: styles.getPropertyValue("--muted").trim() || "#8b97ad",
    bg: styles.getPropertyValue("--panel").trim() || "#0f1520",
    border: styles.getPropertyValue("--border").trim() || "#1c2433",
    grid: "rgba(100,116,139,0.18)",
  };
}

function buildChartStyles() {
  const c = readThemeColors();
  return {
    grid: {
      horizontal: { color: c.grid },
      vertical: { color: c.grid },
    },
    candle: {
      type: "candle_solid" as const,
      bar: {
        upColor: c.up,
        downColor: c.down,
        noChangeColor: c.muted,
        upBorderColor: c.up,
        downBorderColor: c.down,
        noChangeBorderColor: c.muted,
        upWickColor: c.up,
        downWickColor: c.down,
        noChangeWickColor: c.muted,
      },
      priceMark: {
        high: { color: c.muted },
        low: { color: c.muted },
        last: {
          upColor: c.up,
          downColor: c.down,
          noChangeColor: c.muted,
        },
      },
      tooltip: {
        text: { color: c.fg },
      },
    },
    indicator: {
      tooltip: {
        text: { color: c.fg },
      },
    },
    xAxis: {
      axisLine: { color: c.border },
      tickLine: { color: c.border },
      tickText: { color: c.muted },
    },
    yAxis: {
      axisLine: { color: c.border },
      tickLine: { color: c.border },
      tickText: { color: c.muted },
    },
    crosshair: {
      horizontal: {
        line: { color: c.muted },
        text: { backgroundColor: c.border, color: c.fg },
      },
      vertical: {
        line: { color: c.muted },
        text: { backgroundColor: c.border, color: c.fg },
      },
    },
    separator: {
      color: c.border,
    },
  };
}

function periodFromResolution(resolution: string) {
  if (resolution === "Y") return { type: "year" as const, span: 1 };
  if (resolution === "Q") return { type: "month" as const, span: 3 };
  return { type: "day" as const, span: 1 };
}

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

export function CandleChart({
  bars,
  flags,
  onFlagToggle,
  indicatorsLabel,
  resetKey,
  resolution = "D",
  symbol = "",
  onLoadMore,
  loadingMore = false,
  hasMore = true,
}: {
  bars: OhlcvBar[];
  /** @deprecated KLineChart computes indicators internally */
  indicators?: unknown;
  flags: IndicatorFlags;
  onFlagToggle?: (key: keyof IndicatorFlags) => void;
  indicatorsLabel?: string;
  resetKey?: string;
  resolution?: string;
  symbol?: string;
  onLoadMore?: (earliestTime: number) => Promise<OhlcvBar[] | void> | void;
  loadingMore?: boolean;
  hasMore?: boolean;
}) {
  const t = useTranslations("symbol");
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const kcRef = useRef<KLineChartsModule | null>(null);
  const barsRef = useRef(bars);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);
  const flagsRef = useRef(flags);
  const indicatorIdsRef = useRef<Record<string, string | null>>({});
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("none");
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { changeColorScheme } = usePreference();

  barsRef.current = bars;
  hasMoreRef.current = hasMore;
  onLoadMoreRef.current = onLoadMore;
  flagsRef.current = flags;

  const syncIndicators = useCallback((chart: ChartInstance) => {
    const f = flagsRef.current;
    const ids = indicatorIdsRef.current;

    const ensure = (key: string, create: () => string | null) => {
      if (ids[key]) return;
      ids[key] = create();
    };
    const remove = (key: string) => {
      if (!ids[key]) return;
      chart.removeIndicator({ id: ids[key]! });
      ids[key] = null;
    };

    if (f.ma) {
      ensure("ma", () =>
        chart.createIndicator(
          { name: "MA", calcParams: [7, 25, 99], paneId: "candle_pane" },
          true,
        ),
      );
    } else remove("ma");

    if (f.ema) {
      ensure("ema", () =>
        chart.createIndicator(
          { name: "EMA", calcParams: [12, 26], paneId: "candle_pane" },
          true,
        ),
      );
    } else remove("ema");

    if (f.boll) {
      ensure("boll", () =>
        chart.createIndicator(
          { name: "BOLL", paneId: "candle_pane" },
          true,
        ),
      );
    } else remove("boll");

    if (f.rsi) {
      ensure("rsi", () => chart.createIndicator("RSI"));
    } else remove("rsi");

    if (f.macd) {
      ensure("macd", () => chart.createIndicator("MACD"));
    } else remove("macd");

    if (!ids.vol) {
      ids.vol = chart.createIndicator("VOL");
    }
  }, []);

  // Init chart (client-only dynamic import)
  useEffect(() => {
    let disposed = false;
    const el = containerRef.current;
    if (!el) return;

    void import("klinecharts").then((KC) => {
      if (disposed || !containerRef.current) return;
      kcRef.current = KC;
      const chart = KC.init(containerRef.current, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styles: buildChartStyles() as any,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (!chart) return;
      chartRef.current = chart;

      chart.setDataLoader({
        getBars: async ({ type, timestamp, callback }) => {
          // KLineChart v10: forward = older (left), backward = newer (right)
          if (type === "init" || type === "update") {
            const list = toKLineData(barsRef.current);
            callback(list, {
              forward: hasMoreRef.current && list.length > 0,
              backward: false,
            });
            return;
          }
          if (type === "forward") {
            const oldestSec = timestamp
              ? Math.floor(timestamp / 1000)
              : barsRef.current[0]?.time;
            if (!oldestSec || !onLoadMoreRef.current) {
              callback([], { forward: false });
              return;
            }
            try {
              const older = await onLoadMoreRef.current(oldestSec);
              const chunk = Array.isArray(older) ? older : [];
              callback(toKLineData(chunk), {
                forward: chunk.length > 0 && hasMoreRef.current,
              });
            } catch {
              callback([], { forward: false });
            }
            return;
          }
          if (type === "backward") {
            callback([], { backward: false });
            return;
          }
          callback([]);
        },
      });

      chart.setSymbol({
        ticker: symbol || "SYMBOL",
        pricePrecision: 4,
        volumePrecision: 2,
      });
      chart.setPeriod(periodFromResolution(resolution));
      syncIndicators(chart);
      setReady(true);
    });

    return () => {
      disposed = true;
      setReady(false);
      if (chartRef.current && kcRef.current) {
        kcRef.current.dispose(chartRef.current);
      }
      chartRef.current = null;
      indicatorIdsRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount on resetKey
  }, [resetKey]);

  // When bars first arrive / replace after reset, re-trigger loader via setPeriod
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ready) return;
    chart.setSymbol({
      ticker: symbol || "SYMBOL",
      pricePrecision: 4,
      volumePrecision: 2,
    });
    chart.setPeriod(periodFromResolution(resolution));
  }, [bars.length > 0, ready, symbol, resolution]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ready) return;
    syncIndicators(chart);
  }, [flags, ready, syncIndicators]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ready) return;
    chart.setStyles(buildChartStyles() as never);
  }, [changeColorScheme, ready]);

  useEffect(() => {
    function onFsChange() {
      const active = document.fullscreenElement === shellRef.current;
      setFullscreen(active);
      requestAnimationFrame(() => {
        chartRef.current?.resize();
      });
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      chartRef.current?.resize();
    });
    ro.observe(shell);
    return () => ro.disconnect();
  }, [ready]);

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await shell.requestFullscreen();
      }
    } catch {
      /* browser may block without gesture / support */
    }
  };

  const startDrawing = (tool: DrawingTool) => {
    setDrawingTool(tool);
    if (tool === "none") return;
    chartRef.current?.createOverlay({ name: tool });
  };

  const clearDrawings = () => {
    chartRef.current?.removeOverlay();
    setDrawingTool("none");
  };

  return (
    <div
      ref={shellRef}
      className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] ${
        fullscreen ? "flex h-screen flex-col rounded-none border-0" : ""
      }`}
    >
      {/* Drawing tools — vertical icon strip on left */}
      <div className="pointer-events-none absolute bottom-10 left-0 top-10 z-10 flex items-start p-1.5 sm:p-2">
        <div className="pointer-events-auto flex max-h-full w-10 flex-col items-center gap-0.5 overflow-y-auto rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 py-1 shadow-sm backdrop-blur-sm qt-scroll sm:w-11">
          <button
            type="button"
            title={t("drawPan")}
            aria-label={t("drawPan")}
            onClick={() => startDrawing("none")}
            className={`flex h-8 w-8 items-center justify-center rounded-md border ${
              drawingTool === "none"
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
            }`}
          >
            <DrawingToolIcon tool="none" />
          </button>
          {DRAWING_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              title={t(tool.labelKey)}
              aria-label={t(tool.labelKey)}
              onClick={() => startDrawing(tool.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                drawingTool === tool.id
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              <DrawingToolIcon tool={tool.id} />
            </button>
          ))}
          <button
            type="button"
            title={t("drawClear")}
            aria-label={t("drawClear")}
            onClick={clearDrawings}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            <DrawingToolIcon tool="clear" />
          </button>
        </div>
      </div>

      {/* Fullscreen — top right, inset from Y-axis scale */}
      <div className="pointer-events-none absolute right-12 top-0 z-10 p-2 sm:right-14 sm:p-2.5 lg:right-16">
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}
          title={fullscreen ? t("exitFullscreen") : t("fullscreen")}
          className="pointer-events-auto flex items-center gap-1 rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 px-2 py-1 text-[11px] text-[var(--muted)] shadow-sm backdrop-blur-sm hover:text-[var(--foreground)] sm:text-xs"
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
          <span className="hidden sm:inline">
            {fullscreen ? t("exitFullscreen") : t("fullscreen")}
          </span>
        </button>
      </div>

      {/* Indicators — in the gap above volume legend (candle/volume separator) */}
      {onFlagToggle && (
        <div className="pointer-events-none absolute bottom-28 left-12 z-10 sm:bottom-32 sm:left-14 lg:bottom-36">
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--border)]/80 bg-[var(--panel)]/90 px-1.5 py-1 text-[11px] shadow-sm backdrop-blur-sm sm:text-xs">
            {indicatorsLabel ? (
              <span className="hidden px-1 text-[var(--muted)] sm:inline">
                {indicatorsLabel}
              </span>
            ) : null}
            {(
              [
                ["ma", "MA"],
                ["ema", "EMA"],
                ["boll", "BOLL"],
                ["rsi", "RSI"],
                ["macd", "MACD"],
              ] as const
            ).map(([key, label]) => (
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
      )}

      <div
        ref={containerRef}
        className={
          fullscreen ? "min-h-0 w-full flex-1" : "h-[480px] w-full sm:h-[560px] lg:h-[620px]"
        }
      />
      {loadingMore && (
        <div className="pointer-events-none absolute bottom-3 left-14 z-10 rounded-md bg-[var(--panel)]/90 px-2 py-1 text-xs text-[var(--muted)] shadow sm:left-16">
          …
        </div>
      )}
    </div>
  );
}
