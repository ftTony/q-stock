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
      <div className="flex flex-wrap gap-2">
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
            className={`rounded-xl px-3 py-1.5 text-sm ${
              resolution === key
                ? "bg-[var(--brand)] text-[#0b1220] font-semibold"
                : "qt-btn-ghost border border-[var(--border)] bg-[var(--panel)]"
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
