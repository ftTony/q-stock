"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

const PERIODS = ["D", "Q", "Y"] as const;

function ResolutionTabs({
  resolution,
  onResolutionChange,
  resolutionLabels,
}: {
  resolution: CandleResolution;
  onResolutionChange: (r: CandleResolution) => void;
  resolutionLabels: { D: string; Q: string; Y: string };
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const syncIndicator = useCallback(() => {
    const list = listRef.current;
    const btn = btnRefs.current.get(resolution);
    if (!list || !btn) return;
    setIndicator({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    });
  }, [resolution]);

  useLayoutEffect(() => {
    syncIndicator();
  }, [syncIndicator, resolutionLabels]);

  useEffect(() => {
    window.addEventListener("resize", syncIndicator);
    return () => window.removeEventListener("resize", syncIndicator);
  }, [syncIndicator]);

  return (
    <div
      ref={listRef}
      className="relative -mb-px flex items-center gap-0.5 pb-px"
    >
      {PERIODS.map((key) => (
        <button
          key={key}
          type="button"
          ref={(el) => {
            if (el) btnRefs.current.set(key, el);
            else btnRefs.current.delete(key);
          }}
          onClick={() => onResolutionChange(key)}
          className={`relative z-[1] h-8 px-2.5 text-[12px] leading-none font-medium transition-colors ${
            resolution === key
              ? "text-[var(--foreground)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {resolutionLabels[key]}
        </button>
      ))}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 z-[2] h-0.5 rounded-full bg-[var(--brand)] transition-[left,width] duration-200 ease-out"
        style={{ left: indicator.left, width: Math.max(indicator.width, 0) }}
      />
    </div>
  );
}

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
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1 border-b border-[var(--border)]">
        <ResolutionTabs
          resolution={resolution}
          onResolutionChange={onResolutionChange}
          resolutionLabels={resolutionLabels}
        />

        {/* Mobile: indicators live here so they don’t cover the plot */}
        <div
          className="ml-auto flex max-w-full flex-wrap items-center gap-0.5 pb-px md:hidden"
          aria-label={indicatorsLabel}
        >
          {INDICATOR_KEYS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFlagToggle(key)}
              className={`h-8 px-1.5 text-[10px] leading-none ${
                flags[key]
                  ? "font-medium text-[var(--brand-text)]"
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
