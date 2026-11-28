"use client";

import type { ReactNode } from "react";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { SymbolMobileBelowChart } from "@/components/symbol/mobile/symbol-mobile-below-chart";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  secondary: ReactNode | null;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  quote: Quote | null;
  metrics: EarningsMetric[];
  marketCap: number | null;
  segment: MobileSegment;
};

/** H5 under-chart stack wired for SymbolTabsPanel.belowChartSlot. */
export function SymbolH5BelowSlot({
  secondary,
  symbol,
  assetType,
  isIndex,
  quote,
  metrics,
  marketCap,
  segment,
}: Props) {
  return (
    <SymbolMobileBelowChart
      symbol={symbol}
      assetType={assetType}
      isIndex={isIndex}
      quote={quote}
      metrics={metrics}
      marketCap={marketCap}
      segment={segment}
      moreBody={secondary ?? undefined}
    />
  );
}
