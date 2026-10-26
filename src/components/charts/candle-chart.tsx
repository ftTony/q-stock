"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { OhlcvBar } from "@/lib/types";
import { usePreference } from "@/components/providers/preference-provider";
import type { DrawingTool } from "@/components/charts/chart-drawing-icons";
import {
  CandleChartOverlays,
  type IndicatorFlags,
} from "@/components/charts/candle-chart-overlays";
import {
  buildChartStyles,
  periodFromResolution,
  toKLineData,
  type TipLabels,
} from "@/components/charts/candle-chart-styles";
import { isAssetSessionOpen } from "@/lib/market/session";
import type { AssetType } from "@/lib/types";

export type { DrawingTool, IndicatorFlags };

type KLineChartsModule = typeof import("klinecharts");
type ChartInstance = NonNullable<ReturnType<KLineChartsModule["init"]>>;

export function CandleChart({
  bars,
  flags,
  onFlagToggle,
  indicatorsLabel,
  showFloatingIndicators = true,
  resetKey,
  resolution = "D",
  symbol = "",
  assetType = "stock",
  onLoadMore,
  loadingMore = false,
  hasMore = true,
  fillParent = false,
}: {
  bars: OhlcvBar[];
  /** @deprecated KLineChart computes indicators internally */
  indicators?: unknown;
  flags: IndicatorFlags;
  onFlagToggle?: (key: keyof IndicatorFlags) => void;
  indicatorsLabel?: string;
  /** False when a parent toolbar already lists MA/MACD/… */
  showFloatingIndicators?: boolean;
  resetKey?: string;
  resolution?: string;
  symbol?: string;
  assetType?: AssetType;
  onLoadMore?: (earliestTime: number) => Promise<OhlcvBar[] | void> | void;
  loadingMore?: boolean;
  hasMore?: boolean;
  /** Fill a flex parent instead of fixed 360/520/620 heights. */
  fillParent?: boolean;
}) {
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
  const [liveSession, setLiveSession] = useState(() =>
    isAssetSessionOpen(assetType),
  );
  const { changeColorScheme } = usePreference();
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tipLabelsRef = useRef<TipLabels>({
    time: t("time"),
    open: t("open"),
    high: t("high"),
    low: t("low"),
    close: t("close"),
    volume: t("volume"),
  });
  tipLabelsRef.current = {
    time: t("time"),
    open: t("open"),
    high: t("high"),
    low: t("low"),
    close: t("close"),
    volume: t("volume"),
  };

  barsRef.current = bars;
  hasMoreRef.current = hasMore;
  onLoadMoreRef.current = onLoadMore;
  flagsRef.current = flags;

  useEffect(() => {
    const tick = () => setLiveSession(isAssetSessionOpen(assetType));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [assetType]);

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
        styles: buildChartStyles(tipLabelsRef.current, resolution, {
          liveSession: isAssetSessionOpen(assetType),
          flushEdge: fillParent,
        }) as any,
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
    chart.setStyles(
      buildChartStyles(tipLabelsRef.current, resolution, {
        liveSession,
        flushEdge: fillParent,
      }) as never,
    );
  }, [changeColorScheme, ready, locale, resolution, liveSession, fillParent]);

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

  // fillParent sits beside the workbench resizer — no shell border or the
  // right edge doubles with the 1px hairline divider.
  const shellClass = fullscreen
    ? "relative flex h-screen flex-col overflow-hidden rounded-none border-0 bg-[var(--panel)]"
    : fillParent
      ? "relative flex h-[360px] flex-col overflow-hidden rounded-none border-0 bg-[var(--panel)] sm:h-[520px] lg:h-full lg:min-h-[280px]"
      : "relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)]";

  const plotClass =
    fullscreen || fillParent
      ? "min-h-0 w-full flex-1"
      : "h-[360px] w-full sm:h-[520px] lg:h-[620px]";

  return (
    <div ref={shellRef} className={shellClass}>
      <CandleChartOverlays
        drawingTool={drawingTool}
        onStartDrawing={startDrawing}
        onClearDrawings={clearDrawings}
        fullscreen={fullscreen}
        onToggleFullscreen={() => void toggleFullscreen()}
        flags={flags}
        onFlagToggle={onFlagToggle}
        showFloatingIndicators={showFloatingIndicators}
        indicatorsLabel={indicatorsLabel}
        loadingMore={loadingMore}
      />

      <div ref={containerRef} className={plotClass} />
    </div>
  );
}
