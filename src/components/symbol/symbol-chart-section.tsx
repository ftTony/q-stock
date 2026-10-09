"use client";

import {
  CandleChart,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
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
      <div className="flex flex-wrap items-center gap-1">
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
            className={`h-6 rounded-md px-1.5 text-[10px] leading-none font-medium ${
              resolution === key
                ? "bg-[var(--brand)] text-[#0b1220]"
                : "border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loadingChart ? (
        <div className="qt-panel flex h-[480px] items-center justify-center text-sm text-[var(--muted)] sm:h-[560px] lg:h-[620px]">
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
