"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { OhlcvBar } from "@/lib/types";
import { usePreference } from "@/components/providers/preference-provider";

export type IndicatorFlags = {
  ma: boolean;
  ema: boolean;
  boll: boolean;
  rsi: boolean;
  macd: boolean;
};

export type DrawingTool =
  | "none"
  | "segment"
  | "rayLine"
  | "straightLine"
  | "horizontalStraightLine"
  | "verticalStraightLine"
  | "parallelStraightLine"
  | "fibonacciLine"
  | "priceLine"
  | "brush";

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
  resetKey?: string;
  resolution?: string;
  symbol?: string;
  onLoadMore?: (earliestTime: number) => Promise<OhlcvBar[] | void> | void;
  loadingMore?: boolean;
  hasMore?: boolean;
}) {
  const t = useTranslations("symbol");
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
          if (type === "init" || type === "forward" || type === "update") {
            const list = toKLineData(barsRef.current);
            callback(list, {
              backward: hasMoreRef.current && list.length > 0,
              forward: false,
            });
            return;
          }
          if (type === "backward") {
            const oldestSec = timestamp
              ? Math.floor(timestamp / 1000)
              : barsRef.current[0]?.time;
            if (!oldestSec || !onLoadMoreRef.current) {
              callback([], { backward: false });
              return;
            }
            try {
              const older = await onLoadMoreRef.current(oldestSec);
              const chunk = Array.isArray(older) ? older : [];
              callback(toKLineData(chunk), {
                backward: chunk.length > 0 && hasMoreRef.current,
              });
            } catch {
              callback([], { backward: false });
            }
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="mr-1 text-[var(--muted)]">{t("drawing")}:</span>
        <button
          type="button"
          onClick={() => startDrawing("none")}
          className={`rounded-full border px-2.5 py-1 ${
            drawingTool === "none"
              ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          {t("drawPan")}
        </button>
        {DRAWING_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => startDrawing(tool.id)}
            className={`rounded-full border px-2.5 py-1 ${
              drawingTool === tool.id
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {t(tool.labelKey)}
          </button>
        ))}
        <button
          type="button"
          onClick={clearDrawings}
          className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {t("drawClear")}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)]">
        <div
          ref={containerRef}
          className="h-[360px] w-full sm:h-[440px]"
        />
        {loadingMore && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-[var(--panel)]/90 px-2 py-1 text-xs text-[var(--muted)] shadow">
            …
          </div>
        )}
      </div>
    </div>
  );
}
