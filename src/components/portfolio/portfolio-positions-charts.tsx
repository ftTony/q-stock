"use client";

import { PortfolioAllocationDonut } from "@/components/portfolio/portfolio-allocation-donut";
import { PortfolioPnlBars } from "@/components/portfolio/portfolio-pnl-bars";
import type { PaperPosition } from "@/components/portfolio/types";

type Props = {
  positions: PaperPosition[];
  labels: {
    chartPnl: string;
    chartAllocation: string;
  };
};

export function PortfolioPositionsCharts({ positions, labels }: Props) {
  if (positions.length === 0) return null;

  return (
    <div className="grid gap-0 border-t border-[var(--border)] lg:grid-cols-2 lg:divide-x lg:divide-[var(--border)]">
      <div className="min-w-0 pt-4 lg:pr-4">
        <h3 className="mb-2 text-sm font-semibold tracking-tight">
          {labels.chartPnl}
        </h3>
        <PortfolioPnlBars positions={positions} ariaLabel={labels.chartPnl} />
      </div>
      <div className="min-w-0 border-t border-[var(--border)] pt-4 lg:border-t-0 lg:pl-4">
        <h3 className="mb-2 text-sm font-semibold tracking-tight">
          {labels.chartAllocation}
        </h3>
        <PortfolioAllocationDonut
          positions={positions}
          ariaLabel={labels.chartAllocation}
        />
      </div>
    </div>
  );
}
