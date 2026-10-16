"use client";

import {
  CandleChart,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
import { INDICATOR_KEYS } from "@/components/charts/candle-chart-overlays";
import type { AssetType, CandleResolution, OhlcvBar } from "@/lib/types";

type Props = {
  resolution: CandleResolution;
  onResolutionChange: (r: CandleResolution) => void;
  resolutionLabels: { D: string; Q: string; Y: string };
  indicatorsLabel: string;
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
  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            ["D", resolutionLabels.D],
            ["Q", resolutionLabels.Q],
            ["Y", resolutionLabels.Y],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onResolutionChange(key)}
            className={`h-6 px-1.5 text-[10px] leading-none font-medium ${
              resolution === key
                ? "border-b-2 border-[var(--brand)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}

        {/* Mobile: indicators live here so they don’t cover the plot */}
        <div
          className="flex max-w-full flex-wrap items-center gap-1 md:hidden"
          aria-label={indicatorsLabel}
        >
          {INDICATOR_KEYS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFlagToggle(key)}
              className={`h-6 px-1.5 text-[10px] leading-none ${
                flags[key]
                  ? "border-b-2 border-[var(--brand)] font-medium text-[var(--brand-text)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loadingChart ? (
        <div className="flex h-[360px] items-center justify-center border-b border-[var(--border)] text-sm text-[var(--muted)] sm:h-[520px] lg:h-[620px]">
          {loadingLabel}
        </div>
      ) : (
        <CandleChart
          bars={bars}
          flags={flags}
          onFlagToggle={onFlagToggle}
          indicatorsLabel={indicatorsLabel}
          resetKey={`${assetType}:${symbol}:${resolution}`}
          resolution={resolution}
          symbol={symbol}
          onLoadMore={onLoadMore}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}
