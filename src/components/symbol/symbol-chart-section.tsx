"use client";

import {
  CandleChart,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
import { INDICATOR_KEYS } from "@/components/charts/candle-chart-overlays";
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

export function SymbolChartSection({
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
  const periods: CandleResolution[] = ["T", "1", "5", "D", "Q", "Y"];
  const primaryKeys = INDICATOR_KEYS.filter(([k]) => PRIMARY_INDICATORS.has(k));
  const moreKeys = INDICATOR_KEYS.filter(([k]) => !PRIMARY_INDICATORS.has(k));
  const intradayEmpty =
    isIntradayResolution(resolution) && !loadingChart && bars.length === 0;

  return (
    <div className="aw-surface-flush flex h-full min-h-0 flex-col">
      <div className="aw-chart-toolbar flex shrink-0 flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface)] px-2">
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
      </div>

      {loadingChart ? (
        <div className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0">
          <div
            className="h-full min-h-[280px] w-full animate-pulse bg-[var(--surface-2)]/60 lg:min-h-0"
            aria-label={loadingLabel}
          />
        </div>
      ) : intradayEmpty ? (
        <div className="aw-caption flex min-h-[280px] flex-1 items-center justify-center px-6 text-center text-[14px] lg:min-h-0">
          {intradayUnavailableLabel}
        </div>
      ) : (
        <div className="min-h-0 flex-1 [&_>div]:h-full [&_>div]:rounded-none [&_>div]:border-0">
          <CandleChart
            bars={bars}
            flags={flags}
            onFlagToggle={onFlagToggle}
            indicatorsLabel={indicatorsLabel}
            showFloatingIndicators={false}
            resetKey={`${assetType}:${symbol}:${resolution}`}
            resolution={resolution}
            fillParent
            onLoadMore={isIntradayResolution(resolution) ? undefined : onLoadMore}
            loadingMore={loadingMore}
            hasMore={hasMore && !isIntradayResolution(resolution)}
          />
        </div>
      )}
    </div>
  );
}
