"use client";

import type { ReactNode } from "react";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { SymbolMobileBelowChart } from "@/components/symbol/mobile/symbol-mobile-below-chart";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import { SymbolMobileTabStrip } from "@/components/symbol/mobile/symbol-mobile-tab-strip";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";
import type { AssetType, Quote } from "@/lib/types";

type TabItem = { id: SymbolTab; label: string };

type Props = {
  secondary: ReactNode | null;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  quote: Quote | null;
  metrics: EarningsMetric[];
  marketCap: number | null;
  segment: MobileSegment;
  onSegmentChange: (segment: MobileSegment) => void;
  onOpenTrade: () => void;
  focusPlanToken: number;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  panelTab: SymbolTab;
  moreTabs: TabItem[];
  onMoreTabChange: (id: SymbolTab) => void;
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
  onSegmentChange,
  onOpenTrade,
  focusPlanToken,
  onBoundStrategyChange,
  panelTab,
  moreTabs,
  onMoreTabChange,
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
      onSegmentChange={onSegmentChange}
      onOpenTrade={onOpenTrade}
      focusPlanToken={focusPlanToken}
      onBoundStrategyChange={onBoundStrategyChange}
      moreBody={secondary}
      moreStrip={
        <SymbolMobileTabStrip
          tabs={moreTabs}
          tab={panelTab}
          onTabChange={onMoreTabChange}
        />
      }
    />
  );
}
