"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  CandleChart,
  type CandleChartHandle,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
import { INDICATOR_KEYS } from "@/components/charts/candle-chart-overlays";
import {
  readChartUiSettings,
  writeChartUiSettings,
  type ChartUiSettings,
} from "@/components/charts/candle-chart-settings";
import { CandleChartToolbarActions } from "@/components/charts/candle-chart-toolbar-actions";
import { ordersToTradeMarkers } from "@/components/charts/candle-chart-trade-markers";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
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
}: Props) {
  const locale = useLocale();
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const chartRef = useRef<CandleChartHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [chartSettings, setChartSettings] = useState<ChartUiSettings>({
    showTradeMarkers: true,
  });

  useEffect(() => {
    setChartSettings(readChartUiSettings());
  }, []);

  const fillsQuery = useTradingOrders({
    status: "filled",
    symbol,
    assetType,
    enabled: signedIn && chartSettings.showTradeMarkers,
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
  const primaryKeys = INDICATOR_KEYS.filter(([k]) => PRIMARY_INDICATORS.has(k));
  const moreKeys = INDICATOR_KEYS.filter(([k]) => !PRIMARY_INDICATORS.has(k));
  const intradayEmpty =
    isIntradayResolution(resolution) && !loadingChart && bars.length === 0;

  const onChartSettingsChange = (next: ChartUiSettings) => {
    setChartSettings(next);
    writeChartUiSettings(next);
  };

  return (
    <div className="aw-surface-flush flex h-full min-h-0 flex-col">
      <div className="aw-chart-toolbar flex shrink-0 flex-nowrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface)] px-2">
        {periods.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onResolutionChange(key)}
            data-active={resolution === key}
            className="aw-toolbar-btn"
          >
            {resolutionLabels[key]}
          </button>
        ))}

        <span className="mx-1.5 h-3 w-px bg-[var(--border)]" aria-hidden />

        <div
          className="flex max-w-full flex-wrap items-center gap-1"
          aria-label={indicatorsLabel}
        >
          {primaryKeys.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFlagToggle(key)}
              data-active={flags[key]}
              className="aw-toolbar-btn"
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
              className="aw-toolbar-btn max-sm:hidden text-[var(--muted)]"
            >
              {label}
            </button>
          ))}
        </div>

        <CandleChartToolbarActions
          flags={flags}
          onFlagToggle={onFlagToggle}
          settings={chartSettings}
          onSettingsChange={onChartSettingsChange}
          onClearDrawings={() => chartRef.current?.clearDrawings()}
          fullscreen={fullscreen}
          onToggleFullscreen={() => chartRef.current?.toggleFullscreen()}
          onScreenshot={() => chartRef.current?.captureScreenshot()}
        />
      </div>

      {intradayEmpty ? (
        <div className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0">
          <EmptyStateBlock art="chart" label={intradayUnavailableLabel} />
        </div>
      ) : bars.length === 0 && loadingChart ? (
        <div className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0">
          <div
            className="h-full min-h-[280px] w-full animate-pulse bg-[color-mix(in_srgb,var(--aw-hairline,var(--border))_35%,transparent)] lg:min-h-0"
            aria-label={loadingLabel}
          />
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 [&_>div]:h-full [&_>div]:rounded-none [&_>div]:border-0">
          <CandleChart
            ref={chartRef}
            bars={bars}
            flags={flags}
            onFlagToggle={onFlagToggle}
            indicatorsLabel={indicatorsLabel}
            showFloatingIndicators={false}
            showFloatingChrome={false}
            resetKey={`${assetType}:${symbol}:${resolution}`}
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
            <div
              className="pointer-events-none absolute inset-0 animate-pulse bg-[color-mix(in_srgb,var(--aw-hairline,var(--border))_28%,transparent)]"
              aria-label={loadingLabel}
            />
          ) : null}
        </div>
      )}
    </div>
  );
});
