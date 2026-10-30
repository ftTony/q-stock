"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { OhlcvBar } from "@/lib/types";
import { usePreference } from "@/components/providers/preference-provider";
import type { DrawingTool } from "@/components/charts/chart-drawing-icons";
import {
  CandleChartOverlays,
  type IndicatorFlags,
} from "@/components/charts/candle-chart-overlays";
import { syncCandleIndicators } from "@/components/charts/candle-chart-indicators";
import {
  applyFillParentChartLayout,
  buildChartStyles,
  candleChartPlotClass,
  candleChartShellClass,
  FILL_PARENT_CHART_LAYOUT,
  periodFromResolution,
  toKLineData,
  type TipLabels,
} from "@/components/charts/candle-chart-styles";
import {
  resolveCandleType,
  type ChartUiSettings,
} from "@/components/charts/candle-chart-settings";
import { captureAndDownloadChart } from "@/components/charts/candle-chart-screenshot";
import {
  syncTradeMarkers,
  USER_DRAWINGS_GROUP,
  type ChartTradeMarker,
} from "@/components/charts/candle-chart-trade-markers";
import { isAssetSessionOpen } from "@/lib/market/session";
import type { AssetType } from "@/lib/types";

export type { DrawingTool, IndicatorFlags, ChartTradeMarker };

export type CandleChartHandle = {
  toggleFullscreen: () => void;
  captureScreenshot: () => void;
  clearDrawings: () => void;
};

type KLineChartsModule = typeof import("klinecharts");
type ChartInstance = NonNullable<ReturnType<KLineChartsModule["init"]>>;

type CandleChartProps = {
  bars: OhlcvBar[];
  /** @deprecated KLineChart computes indicators internally */
  indicators?: unknown;
  flags: IndicatorFlags;
  onFlagToggle?: (key: keyof IndicatorFlags) => void;
  indicatorsLabel?: string;
  /** False when a parent toolbar already lists MA/MACD/… */
  showFloatingIndicators?: boolean;
  /** False when parent toolbar owns settings / fullscreen / screenshot. */
  showFloatingChrome?: boolean;
  /** False for multi-chart / read-only panes (no left drawing strip). */
  showDrawingTools?: boolean;
  resetKey?: string;
  resolution?: string;
  symbol?: string;
  assetType?: AssetType;
  onLoadMore?: (earliestTime: number) => Promise<OhlcvBar[] | void> | void;
  loadingMore?: boolean;
  hasMore?: boolean;
  /** Fill a flex parent instead of fixed 360/520/620 heights. */
  fillParent?: boolean;
  /** Paper fills — buy/sell annotations on the candle pane. */
  tradeMarkers?: ChartTradeMarker[];
  chartSettings?: ChartUiSettings;
  onFullscreenChange?: (fullscreen: boolean) => void;
};

export const CandleChart = forwardRef<CandleChartHandle, CandleChartProps>(
  function CandleChart(
    {
      bars,
      flags,
      onFlagToggle,
      indicatorsLabel,
      showFloatingIndicators = true,
      showFloatingChrome = true,
      showDrawingTools = true,
      resetKey,
      resolution = "D",
      symbol = "",
      assetType = "stock",
      onLoadMore,
      loadingMore = false,
      hasMore = true,
      fillParent = false,
      tradeMarkers = [],
      chartSettings = { showTradeMarkers: true },
      onFullscreenChange,
    },
    ref,
  ) {
  const chartType = resolveCandleType(chartSettings, resolution);
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const kcRef = useRef<KLineChartsModule | null>(null);
  const barsRef = useRef(bars);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);
  const flagsRef = useRef(flags);
  const tradeMarkersRef = useRef(tradeMarkers);
  const indicatorIdsRef = useRef<Record<string, string | null>>({});
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("none");
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const chartSettingsRef = useRef(chartSettings);
  chartSettingsRef.current = chartSettings;
  const showDrawingToolsRef = useRef(showDrawingTools);
  showDrawingToolsRef.current = showDrawingTools;
  const [liveSession, setLiveSession] = useState(() =>
    isAssetSessionOpen(assetType),
  );
  const { changeColorScheme } = usePreference();
  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tApp = useTranslations("app");
  const domainRef = useRef(tApp("domain"));
  domainRef.current = tApp("domain");
  /** Corner mark follows locale (`app.name`: 钱力股 / 錢力股 / Qianli Gu / …). */
  const brandRef = useRef(tApp("name"));
  brandRef.current = tApp("name");
  const logoSrcRef = useRef("/logo-light.png?v=2");
  logoSrcRef.current = locale.startsWith("zh")
    ? "/logo-cn.png?v=2"
    : locale.startsWith("en")
      ? "/logo-en.png?v=2"
      : "/logo-light.png?v=2";
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
  tradeMarkersRef.current = tradeMarkers;

  useEffect(() => {
    const tick = () => setLiveSession(isAssetSessionOpen(assetType));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [assetType]);

  const syncIndicators = useCallback((chart: ChartInstance) => {
    syncCandleIndicators(chart, flagsRef.current, indicatorIdsRef.current);
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
        styles: buildChartStyles(tipLabelsRef.current, resolution, {
          liveSession: isAssetSessionOpen(assetType),
          flushEdge: fillParent,
          chartType: resolveCandleType(chartSettingsRef.current, resolution),
          noDrawingStrip: !showDrawingToolsRef.current,
        }) as never,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(fillParent ? { layout: FILL_PARENT_CHART_LAYOUT } : {}),
      });
      if (!chart) return;
      chartRef.current = chart;
      if (fillParent) applyFillParentChartLayout(chart);

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

  // Period / symbol change: setPeriod reloads via dataLoader (barsRef is current).
  // Also re-fire when bars go from empty → data without remounting the chart.
  const hasBars = bars.length > 0;
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ready) return;
    chart.setSymbol({
      ticker: symbol || "SYMBOL",
      pricePrecision: 4,
      volumePrecision: 2,
    });
    chart.setPeriod(periodFromResolution(resolution));
  }, [hasBars, ready, symbol, resolution]);

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
        chartType,
        noDrawingStrip: !showDrawingTools,
      }) as never,
    );
  }, [
    changeColorScheme,
    resolvedTheme,
    ready,
    locale,
    resolution,
    liveSession,
    fillParent,
    chartType,
    showDrawingTools,
  ]);

  const tradeMarkersKey = tradeMarkers
    .map((m) => `${m.id}:${m.timeMs}:${m.price}:${m.side}`)
    .join("|");
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ready) return;
    const marks = chartSettings.showTradeMarkers
      ? tradeMarkersRef.current
      : [];
    syncTradeMarkers(chart, marks);
  }, [
    ready,
    tradeMarkersKey,
    changeColorScheme,
    bars.length,
    chartSettings.showTradeMarkers,
  ]);

  useEffect(() => {
    function onFsChange() {
      const active = document.fullscreenElement === shellRef.current;
      setFullscreen(active);
      onFullscreenChange?.(active);
      requestAnimationFrame(() => {
        chartRef.current?.resize();
      });
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [onFullscreenChange]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    // Single-flight resize: mobile URL bar / soft keyboard can spam RO.
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        chartRef.current?.resize();
      });
    });
    ro.observe(shell);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready]);

  // Flex parents can lay out after KC.init — kick resize once height is real.
  useEffect(() => {
    if (!ready) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      chartRef.current?.resize();
      raf2 = requestAnimationFrame(() => chartRef.current?.resize());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [ready, resetKey]);

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
    chartRef.current?.createOverlay({
      name: tool,
      groupId: USER_DRAWINGS_GROUP,
    });
  };

  const clearDrawings = () => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.removeOverlay({ groupId: USER_DRAWINGS_GROUP });
    setDrawingTool("none");
    syncTradeMarkers(
      chart,
      chartSettingsRef.current.showTradeMarkers
        ? tradeMarkersRef.current
        : [],
    );
  };

  const captureScreenshot = () => {
    const chart = chartRef.current;
    if (!chart) return;
    void captureAndDownloadChart({
      chart,
      labels: tipLabelsRef.current,
      resolution,
      liveSession,
      flushEdge: fillParent,
      chartType: resolveCandleType(chartSettingsRef.current, resolution),
      domain: domainRef.current,
      brand: brandRef.current,
      logoSrc: logoSrcRef.current,
      filename: `${symbol || "chart"}-${resolution || "D"}.png`,
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      toggleFullscreen: () => void toggleFullscreen(),
      captureScreenshot,
      clearDrawings,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable imperative API
    [symbol, resolution],
  );

  return (
    <div
      ref={shellRef}
      className={candleChartShellClass(fullscreen, fillParent)}
    >
      <CandleChartOverlays
        drawingTool={drawingTool}
        onStartDrawing={startDrawing}
        onClearDrawings={clearDrawings}
        fullscreen={fullscreen}
        onToggleFullscreen={() => void toggleFullscreen()}
        flags={flags}
        onFlagToggle={onFlagToggle}
        showFloatingIndicators={showFloatingIndicators}
        showFloatingChrome={showFloatingChrome}
        showDrawingTools={showDrawingTools}
        indicatorsLabel={indicatorsLabel}
        loadingMore={loadingMore}
      />

      <div
        ref={containerRef}
        className={candleChartPlotClass(fullscreen, fillParent)}
      />
    </div>
  );
  },
);
