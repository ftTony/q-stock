"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";

function fmtMoney(n: number, currency = "USD"): string {
  const prefix = currency === "USD" || currency === "USDT" ? "US$" : `${currency} `;
  return `${prefix}${formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Props = {
  cashBalance: number;
  equity: number;
  floatingPnl: number;
  dayPnl: number;
  marginUsed: number;
  currency?: string;
};

/** Broker-style paper account strip for the order ticket. */
export function TradeTicketAccount({
  cashBalance,
  equity,
  floatingPnl,
  dayPnl,
  marginUsed,
  currency = "USD",
}: Props) {
  const t = useTranslations("trading");
  const buyingPower = Math.max(0, equity);

  return (
    <div className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-[var(--foreground)]">
          {t("paperAccountName")}
        </span>
        <span className="inline-flex h-5 items-center rounded-none bg-[color-mix(in_srgb,var(--up)_18%,transparent)] px-1.5 text-[10px] font-semibold leading-none text-[var(--up)]">
          {t("paperBadge")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <Metric label={t("balance")} value={fmtMoney(cashBalance, currency)} />
        <Metric label={t("equity")} value={fmtMoney(equity, currency)} />
        <Metric
          label={t("floatingPnl")}
          value={fmtMoney(floatingPnl, currency)}
          tone={floatingPnl === 0 ? undefined : floatingPnl > 0 ? "up" : "down"}
        />
        <Metric
          label={t("dayPnlUtc")}
          value={fmtMoney(dayPnl, currency)}
          tone={dayPnl === 0 ? undefined : dayPnl > 0 ? "up" : "down"}
        />
      </div>
      <p className="text-[11px] leading-snug text-[var(--muted)]">
        {t("marginUsedLine", {
          used: fmtMoney(marginUsed, currency),
          power: fmtMoney(buyingPower, currency),
        })}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="min-w-0">
      <div className="aw-metric-label">{label}</div>
      <div
        className={`mt-0.5 truncate text-[13px] font-medium tabular-nums tracking-[-0.16px] ${
          tone === "up"
            ? "text-[var(--up)]"
            : tone === "down"
              ? "text-[var(--down)]"
              : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
