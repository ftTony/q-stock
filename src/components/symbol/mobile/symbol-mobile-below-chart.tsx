"use client";

import type { ReactNode } from "react";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import {
  SymbolMobileQuickActions,
  type MobileSegment,
} from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import { SymbolOrderRail } from "@/components/symbol/rail/symbol-order-rail";
import type { RailTab } from "@/components/symbol/rail/symbol-order-rail";
import { SymbolRailStats } from "@/components/symbol/rail/symbol-rail-stats";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
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
  /** Only mounted while segment === more. */
  moreStrip?: ReactNode;
  moreBody?: ReactNode;
};

function isRailTab(s: MobileSegment): s is RailTab {
  return s === "plan" || s === "review" || s === "market";
}

/**
 * H5 under-chart: one segment bar → one scroll pane.
 * 更多 owns 新闻/基本面/衍生品; 计划/复盘/行情 never share a second tab row.
 */
export function SymbolMobileBelowChart({
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
  moreStrip,
  moreBody,
}: Props) {
  const showMarket = assetType !== "crypto" && !isIndex;
  const onMore = segment === "more";

  return (
    <div className="aw-mobile-below-chart flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
      <SymbolMobileQuickActions
        segment={segment}
        showMarket={showMarket}
        onSelectSegment={onSegmentChange}
      />

      {onMore ? moreStrip : null}

      <div className="aw-mobile-below-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
        {onMore ? (
          <div className="aw-mobile-more-body [&_>div]:!min-h-0 [&_>div]:!flex-none [&_>div]:!overflow-visible">
            {moreBody}
          </div>
        ) : isRailTab(segment) ? (
          <>
            {segment === "market" && showMarket ? (
              <div className="border-b border-[var(--aw-hairline,var(--border))] px-3 py-2">
                <SymbolRailStats
                  quote={quote}
                  metrics={metrics}
                  assetType={assetType}
                  marketCap={marketCap}
                />
              </div>
            ) : null}
            <SymbolOrderRail
              symbol={symbol}
              assetType={assetType}
              isIndex={isIndex}
              tab={segment}
              onTabChange={onSegmentChange}
              hideTabList
              embedInScroll
              focusPlanToken={focusPlanToken}
              onBoundStrategyChange={onBoundStrategyChange}
              onRequestOrder={onOpenTrade}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
