"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import {
  softWarnPositionPct,
  summarizeOrderRisk,
} from "@/lib/trading/risk-math";

type Props = {
  equity: number | null;
  qty: number;
  entry: number;
  stop: number | null;
  maxPositionPct?: number;
  symbol?: string;
  assetType?: string;
  className?: string;
};

export function OrderRiskSummary({
  equity,
  qty,
  entry,
  stop,
  maxPositionPct = 20,
  symbol,
  assetType,
  className = "",
}: Props) {
  const t = useTranslations("orderRisk");
  if (equity == null || !(equity > 0) || !(qty > 0) || !(entry > 0)) {
    return null;
  }

  const s = summarizeOrderRisk({ equity, qty, entry, stop });
  const warn = softWarnPositionPct(s.positionPct, maxPositionPct);
  const toolQs = new URLSearchParams();
  if (equity > 0) toolQs.set("equity", String(Math.round(equity)));
  if (entry > 0) toolQs.set("entry", String(entry));
  if (stop != null && stop > 0) toolQs.set("stop", String(stop));
  if (symbol) toolQs.set("symbol", symbol);
  if (assetType) toolQs.set("assetType", assetType);
  const toolHref = `/tools/position?${toolQs.toString()}`;

  return (
    <div
      className={`border-t border-[var(--aw-hairline,var(--border))] pt-3 text-[12px] leading-snug ${className}`}
    >
      <p className="text-[11px] font-medium leading-none text-[var(--muted)]">
        {t("title")}
      </p>
      <p className="mt-1.5 tabular-nums text-[13px] text-[var(--foreground)]">
        {t("positionPct", {
          pct:
            s.positionPct != null
              ? formatNumber(s.positionPct, {
                  maximumFractionDigits: 1,
                })
              : "—",
        })}
      </p>
      {s.hasStop && s.riskAmount != null ? (
        <p className="mt-1 tabular-nums text-[13px] text-[var(--foreground)]">
          {t("riskLine", {
            amount: formatNumber(s.riskAmount, {
              maximumFractionDigits: 2,
            }),
            pct:
              s.riskPct != null
                ? formatNumber(s.riskPct, { maximumFractionDigits: 1 })
                : "—",
          })}
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-[var(--muted)]">{t("noStop")}</p>
      )}
      {warn ? (
        <p className="mt-1 text-[color-mix(in_srgb,#ca8a04_90%,var(--foreground))]">
          {t("softCap", { max: maxPositionPct })}
        </p>
      ) : null}
      <p className="mt-1.5">
        <Link href={toolHref} className="aw-text-link text-[12px]">
          {t("positionTool")}
        </Link>
      </p>
    </div>
  );
}
