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
    <div className="grid grid-cols-2 gap-x-4 border-b border-[var(--aw-hairline,var(--border))] pb-3">
      <div className="min-w-0 text-left">
        <div className="text-[11px] leading-none text-[var(--muted)]">
          {t("position")}
        </div>
        <div className="mt-1 truncate text-[14px] font-semibold tabular-nums tracking-[-0.2px] text-[var(--foreground)]">
          {positionQty}
        </div>
      </div>
      <div className="min-w-0 text-left">
        <div className="text-[11px] leading-none text-[var(--muted)]">
          {t("avgCost")}
        </div>
        <div className="mt-1 truncate text-[14px] font-semibold tabular-nums tracking-[-0.2px] text-[var(--foreground)]">
          {avgCost != null ? `$${fmtMoney(avgCost)}` : "—"}
        </div>
      </div>
    </div>
  );
}
