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
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
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
          className={`relative z-[1] h-8 px-2.5 text-[12px] leading-none font-medium transition-colors ${resolution === key
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
            className="h-full min-h-[280px] w-full animate-pulse bg-[color-mix(in_srgb,var(--aw-hairline,var(--border))_35%,transparent)] lg:min-h-0"
            aria-label={loadingLabel}
          />
        </div>
      ) : intradayEmpty ? (
        <div className="flex min-h-[280px] flex-1 items-center justify-center lg:min-h-0">
          <EmptyStateBlock art="chart" label={intradayUnavailableLabel} />
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
            symbol={symbol}
            assetType={assetType}
            fillParent
            onLoadMore={onLoadMore}
            loadingMore={loadingMore}
            hasMore={hasMore}
          />
        </div>
      )}
    </div>
  );
}
