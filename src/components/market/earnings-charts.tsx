"use client";

import { EarningsEpsCharts } from "@/components/market/earnings-eps-charts";
import { EarningsStatementSection } from "@/components/market/earnings-statement-section";
import type {
  EarningsCalendarRow,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import { buildEarningsStatement } from "@/lib/earnings/build-statement";
import type { EarningsStatement } from "@/lib/earnings/types";

export function EarningsCharts({
  surprises,
  recent,
  statement,
  labels,
}: {
  surprises: EarningsSurprise[];
  recent: EarningsCalendarRow[];
  statement?: EarningsStatement | null;
  labels: {
    chartEps: string;
    chartSurprise: string;
    actual: string;
    estimate: string;
    statementTitle: string;
    showYoy: string;
    hideYoy: string;
    collapseChart: string;
    expandChart: string;
    currency: string;
    yoy: string;
    rowRevenue: string;
    rowEps: string;
    rowGrossMargin: string;
    rowOpMargin: string;
    rowNetMargin: string;
    rowRoe: string;
  };
}) {
  const resolved =
    statement ??
    buildEarningsStatement({
      surprises,
      recent,
    });

  const hasEps = surprises.some(
    (s) => s.actual != null || s.estimate != null,
  );

  if (!hasEps && !resolved) return null;

  return (
    <div className="space-y-6 divide-y divide-[var(--aw-hairline,var(--border))]">
      {hasEps ? (
        <div className="pb-1">
          <EarningsEpsCharts
            surprises={surprises}
            labels={{
              chartEps: labels.chartEps,
              chartSurprise: labels.chartSurprise,
              actual: labels.actual,
              estimate: labels.estimate,
            }}
          />
        </div>
      ) : null}

      {resolved ? (
        <div className={hasEps ? "pt-6" : undefined}>
          <EarningsStatementSection
            statement={resolved}
            labels={{
              statementTitle: labels.statementTitle,
              showYoy: labels.showYoy,
              hideYoy: labels.hideYoy,
              collapseChart: labels.collapseChart,
              expandChart: labels.expandChart,
              currency: labels.currency,
              yoy: labels.yoy,
              rowRevenue: labels.rowRevenue,
              rowEps: labels.rowEps,
              rowGrossMargin: labels.rowGrossMargin,
              rowOpMargin: labels.rowOpMargin,
              rowNetMargin: labels.rowNetMargin,
              rowRoe: labels.rowRoe,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
