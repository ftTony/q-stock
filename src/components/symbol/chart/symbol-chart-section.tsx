"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  CandleChart,
  type CandleChartHandle,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
import { INDICATOR_KEYS } from "@/components/charts/candle-chart-overlays";
import {
  readChartUiSettings,
  resolveCandleType,
  writeChartUiSettings,
  type ChartCandleType,
  type ChartUiSettings,
} from "@/components/charts/candle-chart-settings";
import { CandleChartTypeMenu } from "@/components/charts/candle-chart-type-menu";
import { CandleChartToolbarActions } from "@/components/charts/candle-chart-toolbar-actions";
import { ordersToTradeMarkers } from "@/components/charts/candle-chart-trade-markers";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import { SymbolMarketCredsEmpty } from "@/components/symbol/shared/symbol-market-creds-empty";
import {
  SymbolChartContextMenu,
  type ChartContextMenuState,
} from "@/components/symbol/chart/symbol-chart-context-menu";
import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";
import { TopToast } from "@/components/ui/top-toast";
import { useTradingOrders } from "@/hooks/query/use-trading";
import {
  isIntradayResolution,
  type AssetType,
  type CandleResolution,
  type OhlcvBar,
} from "@/lib/types";

const PRIMARY_INDICATORS = new Set(["ma", "macd"]);

type Props = {
  resolution: CandleResolution;
  onResolutionChange: (r: CandleResolution) => void;
  resolutionLabels: Record<CandleResolution, string>;
  indicatorsLabel: string;
  intradayUnavailableLabel: string;
  flags: IndicatorFlags;
  onFlagToggle: (key: keyof IndicatorFlags) => void;
  loadingChart: boolean;
  loadingLabel: string;
  bars: OhlcvBar[];
  assetType: AssetType;
  symbol: string;
  onLoadMore: (earliestTime: number) => Promise<OhlcvBar[]>;
  loadingMore: boolean;
  hasMore: boolean;
  inWatchlist: boolean;
  watchBusy?: boolean;
  onToggleWatchlist: () => void | Promise<void>;
};

export const SymbolChartSection = memo(function SymbolChartSection({
  resolution,
  onResolutionChange,
  resolutionLabels,
  indicatorsLabel,
  intradayUnavailableLabel,
  flags,
  onFlagToggle,
  loadingChart,
  loadingLabel,
  bars,
  assetType,
  symbol,
  onLoadMore,
  loadingMore,
  hasMore,
  inWatchlist,
  watchBusy,
  onToggleWatchlist,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const chartRef = useRef<CandleChartHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ChartContextMenuState>(null);
  const [soonToast, setSoonToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"neutral" | "success">("neutral");
  const [chartSettings, setChartSettings] = useState<ChartUiSettings>({
    showTradeMarkers: true,
  });

  const onChartContextMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    setChartSettings(readChartUiSettings());
  }, []);

  /** Defer fills until first bars paint — keep chart critical path lean. */
  const [markersArmed, setMarkersArmed] = useState(false);
  useEffect(() => {
    setMarkersArmed(false);
  }, [symbol, assetType]);
  useEffect(() => {
    if (markersArmed || loadingChart || bars.length === 0) return;
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setMarkersArmed(true);
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(arm, 600);
    }
    return () => {
      cancelled = true;
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [markersArmed, loadingChart, bars.length]);

  const fillsQuery = useTradingOrders({
    status: "filled",
    symbol,
    assetType,
    enabled: signedIn && chartSettings.showTradeMarkers && markersArmed,
  });
  const tradeMarkers = useMemo(() => {
    const orders =
      (
        fillsQuery.data as
          | {
              orders?: Array<{
                id: string;
                side: string;
                status?: string;
                filledAt?: string | null;
                filledPrice?: number | null;
              }>;
            }
          | undefined
      )?.orders ?? [];
    const zh = locale.startsWith("zh");
    return ordersToTradeMarkers(orders, {
      buy: zh ? "买" : "B",
      sell: zh ? "卖" : "S",
    });
  }, [fillsQuery.data, locale]);
  const periods: CandleResolution[] = ["T", "1", "5", "D", "Q", "Y"];
  const activeChartType = resolveCandleType(chartSettings, resolution);
  const primaryKeys = INDICATOR_KEYS.filter(([k]) => PRIMARY_INDICATORS.has(k));
  const moreKeys = INDICATOR_KEYS.filter(([k]) => !PRIMARY_INDICATORS.has(k));
  const intradayEmpty =
    isIntradayResolution(resolution) && !loadingChart && bars.length === 0;

  const onChartSettingsChange = (next: ChartUiSettings) => {
    setChartSettings(next);
    writeChartUiSettings(next);
  };

  const onChartTypeChange = (type: ChartCandleType) => {
    onChartSettingsChange({ ...chartSettings, chartType: type });
  };

  return (
    <div className="aw-surface-flush flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <TopToast
        message={soonToast}
        tone={toastTone}
        onDismiss={() => setSoonToast(null)}
      />
      <SymbolChartContextMenu
        open={ctxMenu}
        onClose={() => setCtxMenu(null)}
        symbol={symbol}
        assetType={assetType}
        inWatchlist={inWatchlist}
        watchBusy={watchBusy}
        onToggleWatchlist={onToggleWatchlist}
        onSoon={(feature) => {
          setToastTone("neutral");
          setSoonToast(
            feature === "rangeStats"
              ? t("chartCtxRangeStatsSoon")
              : t("chartCtxOverlaySoon"),
          );
        }}
        onWatchAdded={() => {
          setToastTone("success");
          setSoonToast(tCommon("watchAdded"));
        }}
      />
      <div className="aw-chart-toolbar relative z-20 flex shrink-0 flex-nowrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface)] px-2">
        {/* Left cluster: periods + (desktop) type/indicators — keep flush left. */}
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {periods.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onResolutionChange(key)}
              data-active={resolution === key}
              className="aw-toolbar-btn shrink-0"
            >
              {resolutionLabels[key]}
            </button>
          ))}
          {/* Desktop only — H5 keeps type/indicators in the settings gear. */}
          <span
            className="mx-1 hidden h-3 w-px shrink-0 bg-[var(--border)] lg:block lg:mx-1.5"
            aria-hidden
          />
          <div className="hidden shrink-0 lg:block">
            <CandleChartTypeMenu
              value={activeChartType}
              onChange={onChartTypeChange}
            />
          </div>
          <div
            className="hidden shrink-0 items-center gap-0.5 lg:flex"
            aria-label={indicatorsLabel}
          >
            <span className="mx-1.5 h-3 w-px bg-[var(--border)]" aria-hidden />
            {primaryKeys.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onFlagToggle(key)}
                data-active={flags[key]}
                className="aw-toolbar-btn shrink-0"
              >
                {label}
              </button>
            ))}
            {moreKeys.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onFlagToggle(key)}
                data-active={flags[key]}
                className="aw-toolbar-btn shrink-0 text-[var(--muted)]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <CandleChartToolbarActions
          flags={flags}
          onFlagToggle={onFlagToggle}
          settings={chartSettings}
          onSettingsChange={onChartSettingsChange}
          resolution={resolution}
          onClearDrawings={() => chartRef.current?.clearDrawings()}
          fullscreen={fullscreen}
          onToggleFullscreen={() => chartRef.current?.toggleFullscreen()}
          onScreenshot={() => chartRef.current?.captureScreenshot()}
        />
      </div>

      {intradayEmpty ? (
        <div
          className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0"
          onContextMenu={onChartContextMenu}
        >
          <EmptyStateBlock art="chart" label={intradayUnavailableLabel} />
        </div>
      ) : loadingChart && bars.length === 0 ? (
        <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-[var(--panel,var(--surface))] max-lg:min-h-[240px]">
          <ChartLoadingOverlay label={loadingLabel} placement="center" />
        </div>
      ) : bars.length === 0 ? (
        <div
          className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0"
          onContextMenu={onChartContextMenu}
        >
          <SymbolMarketCredsEmpty
            assetType={assetType}
            fallbackLabel={t("chartEmpty")}
          />
        </div>
      ) : (
        <div
          className="relative min-h-0 w-full flex-1 overflow-hidden max-lg:min-h-[240px] [&_>div]:h-full [&_>div]:min-h-0 [&_>div]:rounded-none [&_>div]:border-0"
          onContextMenuCapture={onChartContextMenu}
        >
          <CandleChart
            ref={chartRef}
            bars={bars}
            flags={flags}
            onFlagToggle={onFlagToggle}
            indicatorsLabel={indicatorsLabel}
            showFloatingIndicators={false}
            showFloatingChrome={false}
            // Remount only on symbol change — resolution uses setPeriod.
            resetKey={`${assetType}:${symbol}`}
            resolution={resolution}
            symbol={symbol}
            assetType={assetType}
            fillParent
            onLoadMore={onLoadMore}
            loadingMore={loadingMore}
            hasMore={hasMore}
            tradeMarkers={
              chartSettings.showTradeMarkers ? tradeMarkers : []
            }
            chartSettings={chartSettings}
            onFullscreenChange={setFullscreen}
          />
          {loadingChart ? (
            <ChartLoadingOverlay label={loadingLabel} placement="corner" />
          ) : null}
        </div>
      )}
    </div>
  );
});
