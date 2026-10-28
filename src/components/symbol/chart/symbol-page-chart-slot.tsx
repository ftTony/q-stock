"use client";

import { useCallback, useMemo } from "react";
import { SymbolChartSection } from "@/components/symbol/page/symbol-page-dynamics";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import type { AssetType, CandleResolution, OhlcvBar } from "@/lib/types";

type Props = {
  resolution: CandleResolution;
  onResolutionChange: (r: CandleResolution) => void;
  resolutionLabels: Record<CandleResolution, string>;
  indicatorsLabel: string;
  intradayUnavailableLabel: string;
  flags: IndicatorFlags;
  onFlagsChange: (updater: (f: IndicatorFlags) => IndicatorFlags) => void;
  loadingChart: boolean;
  loadingLabel: string;
  bars: OhlcvBar[];
  assetType: AssetType;
  symbol: string;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  inWatchlist: boolean;
  watchBusy: boolean;
  onToggleWatchlist: () => void;
};

/** Memoized chart island — keeps symbol-page-client under the line budget. */
export function SymbolPageChartSlot({
  resolution,
  onResolutionChange,
  resolutionLabels,
  indicatorsLabel,
  intradayUnavailableLabel,
  flags,
  onFlagsChange,
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
  const onFlagToggle = useCallback(
    (key: keyof IndicatorFlags) => {
      onFlagsChange((f) => ({ ...f, [key]: !f[key] }));
    },
    [onFlagsChange],
  );

  return useMemo(
    () => (
      <SymbolChartSection
        resolution={resolution}
        onResolutionChange={onResolutionChange}
        resolutionLabels={resolutionLabels}
        indicatorsLabel={indicatorsLabel}
        intradayUnavailableLabel={intradayUnavailableLabel}
        flags={flags}
        onFlagToggle={onFlagToggle}
        loadingChart={loadingChart}
        loadingLabel={loadingLabel}
        bars={bars}
        assetType={assetType}
        symbol={symbol}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
        inWatchlist={inWatchlist}
        watchBusy={watchBusy}
        onToggleWatchlist={onToggleWatchlist}
      />
    ),
    [
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
    ],
  );
}
