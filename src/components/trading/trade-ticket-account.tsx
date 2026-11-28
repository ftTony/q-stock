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

type AccountType = "cash" | "margin";

type Props = {
  cashBalance: number;
  equity: number;
  floatingPnl: number;
  dayPnl: number;
  marginUsed: number;
  currency?: string;
  accountType?: AccountType;
  onAccountType?: (t: AccountType) => void;
  borrowedBalance?: number;
  interestAccrued?: number;
  buyingPower?: number;
};

/** Broker-style paper account strip for the order ticket.
 * Includes a cash/margin account switch and margin-specific metrics. */
export function TradeTicketAccount({
  cashBalance,
  equity,
  floatingPnl,
  dayPnl,
  marginUsed,
  currency = "USD",
  accountType = "cash",
  onAccountType,
  borrowedBalance = 0,
  interestAccrued = 0,
  buyingPower,
}: Props) {
  const t = useTranslations("trading");
  const isMargin = accountType === "margin";
  const power = buyingPower ?? Math.max(0, equity);

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

      {/* Account type switch */}
      {onAccountType ? (
        <div
          role="tablist"
          aria-label={t("accountTypeLabel")}
          className="flex border border-[var(--border)]"
        >
          {(["cash", "margin"] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={accountType === type}
              onClick={() => onAccountType(type)}
              className={`h-7 flex-1 text-[11px] font-medium transition-colors ${
                accountType === type
                  ? "bg-[var(--brand)] text-white"
                  : "bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {type === "cash" ? t("accountTypeCash") : t("accountTypeMargin")}
            </button>
          ))}
        </div>
      ) : null}

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

      {isMargin ? (
        <div className="space-y-1 border-t border-[var(--border)] pt-1.5">
          <Line label={t("buyingPower")} value={fmtMoney(power, currency)} />
          <Line label={t("borrowed")} value={fmtMoney(borrowedBalance, currency)} />
          <Line label={t("interestAccrued")} value={fmtMoney(interestAccrued, currency)} />
        </div>
      ) : (
        <p className="text-[11px] leading-snug text-[var(--muted)]">
          {t("marginUsedLine", {
            used: fmtMoney(marginUsed, currency),
            power: fmtMoney(power, currency),
          })}
        </p>
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium tabular-nums text-[var(--foreground)]">{value}</span>
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
