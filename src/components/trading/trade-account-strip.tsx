"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";

function fmtMoney(n: number): string {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 只展示本票持仓。可用资金已在上方资金条，不重复。 */
export function TradeAccountStrip({
  positionQty,
  avgCost,
}: {
  cash?: number;
  positionQty: number;
  avgCost: number | null;
}) {
  const t = useTranslations("trading");

  return (
    <div className="grid grid-cols-2 gap-x-3 border-b border-[var(--border)] pb-2.5">
      <div className="min-w-0 text-left">
        <div className="aw-metric-label">{t("position")}</div>
        <div className="aw-metric-value mt-0.5 truncate tabular-nums">
          {positionQty}
        </div>
      </div>
      <div className="min-w-0 text-left">
        <div className="aw-metric-label">{t("avgCost")}</div>
        <div className="aw-metric-value mt-0.5 truncate tabular-nums">
          {avgCost != null ? `$${fmtMoney(avgCost)}` : "—"}
        </div>
      </div>
    </div>
  );
}
