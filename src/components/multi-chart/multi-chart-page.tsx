"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import { MultiChartToolbar } from "@/components/multi-chart/multi-chart-toolbar";
import { MultiChartPane } from "@/components/multi-chart/multi-chart-pane";
import { useMultiChartLayout } from "@/components/multi-chart/use-multi-chart-layout";
import { candleResolutionLabels } from "@/components/symbol/page/symbol-page-tab-utils";

const LIGHT_FLAGS: IndicatorFlags = {
  ma: true,
  ema: false,
  boll: false,
  rsi: false,
  macd: false,
};

function MultiChartPageInner() {
  const tSymbol = useTranslations("symbol");
  const {
    layout,
    resolution,
    legs,
    resolutions,
    setLayout,
    setResolution,
    setLeg,
  } = useMultiChartLayout();
  const [flags, setFlags] = useState<IndicatorFlags>(LIGHT_FLAGS);

  const resolutionLabels = useMemo(
    () => candleResolutionLabels(tSymbol),
    [tSymbol],
  );

  const toggleMa = useCallback(() => {
    setFlags((f) => ({ ...f, ma: !f.ma }));
  }, []);
  const toggleMacd = useCallback(() => {
    setFlags((f) => ({ ...f, macd: !f.macd }));
  }, []);

  const gridClass =
    layout === 1
      ? "grid-cols-1 grid-rows-1"
      : layout === 2
        ? "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1"
        : "grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2";

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] min-h-[480px] flex-col gap-2.5 lg:h-[calc(100dvh-5.25rem)]">
      <MultiChartToolbar
        layout={layout}
        onLayoutChange={setLayout}
        resolution={resolution}
        resolutions={resolutions}
        resolutionLabels={resolutionLabels}
        onResolutionChange={setResolution}
        legs={legs}
        showMa={flags.ma}
        showMacd={flags.macd}
        onToggleMa={toggleMa}
        onToggleMacd={toggleMacd}
      />
      <div className={`grid min-h-0 flex-1 gap-2 ${gridClass}`}>
        {legs.map((leg, i) => (
          <MultiChartPane
            key={`pane-${i}`}
            leg={leg}
            resolution={resolution}
            flags={flags}
            onChange={(next) => setLeg(i, next)}
          />
        ))}
      </div>
    </div>
  );
}

export function MultiChartPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-[var(--muted)]">…</div>
      }
    >
      <MultiChartPageInner />
    </Suspense>
  );
}
