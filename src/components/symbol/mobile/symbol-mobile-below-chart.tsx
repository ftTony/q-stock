"use client";

import type { ReactNode } from "react";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import { SymbolRailMarket } from "@/components/symbol/rail/symbol-rail-market";
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
  /** Non-chart tab body: rendered as its own full page. */
  moreBody?: ReactNode;
};

/**
 * H5 under-chart:
 * - 图表 tab → quote overview (stats) + market depth/funds/short/chips.
 * - any other tab → a standalone page (no chart, no overview).
 * The chart itself stays mounted in SymbolTabsPanel and is only CSS-hidden.
 */
export function SymbolMobileBelowChart({
  symbol,
  assetType,
  isIndex,
  quote,
  metrics,
  marketCap,
  segment,
  moreBody,
}: Props) {
  const isChart = segment === "chart";

  return (
    <div className="aw-mobile-below-chart flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
      <div className="aw-mobile-below-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
        {isChart ? (
          <>
            <div className="shrink-0 border-b border-[var(--aw-hairline,var(--border))] px-3 py-2">
              <SymbolRailStats
                quote={quote}
                metrics={metrics}
                assetType={assetType}
                marketCap={marketCap}
                isIndex={isIndex}
              />
            </div>
            <SymbolRailMarket symbol={symbol} assetType={assetType} deferDepth />
          </>
        ) : (
          <div className="aw-mobile-more-body [&_>div]:!min-h-0 [&_>div]:!flex-none [&_>div]:!overflow-visible">
            {moreBody}
          </div>
        )}
      </div>
    </div>
  );
}
