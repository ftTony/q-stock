"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePaperRiskSettings } from "@/hooks/query/use-trading";
import { formatNumber } from "@/lib/format-number";

/** Soft educational strip: day P/L vs configured daily-loss circuit. */
export function PortfolioTodayRiskCard({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("paperRisk");
  const riskQuery = usePaperRiskSettings(signedIn);
  if (!signedIn) return null;

  const data = riskQuery.data as
    | {
        dayPnlPct?: number | null;
        circuitBroken?: boolean;
        settings?: { maxDailyLossPct?: number; softOnly?: boolean };
      }
    | undefined;

  if (riskQuery.isLoading && !data) {
    return (
      <div className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[12px] text-[var(--muted)]">
        {t("todayRiskLoading")}
      </div>
    );
  }

  const dayPnl = data?.dayPnlPct;
  const cap = data?.settings?.maxDailyLossPct ?? 5;
  const broken = Boolean(data?.circuitBroken);
  const soft = data?.settings?.softOnly !== false;
  const pnlLabel =
    dayPnl == null || !Number.isFinite(dayPnl)
      ? "—"
      : `${dayPnl >= 0 ? "+" : ""}${formatNumber(dayPnl, {
          maximumFractionDigits: 2,
        })}%`;

  return (
    <div
      className={`rounded border px-3 py-2.5 ${
        broken
          ? "border-[color-mix(in_srgb,var(--down)_35%,var(--border))] bg-[color-mix(in_srgb,var(--down)_8%,var(--panel))]"
          : "border-[var(--border)] bg-[var(--panel)]"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[12px] font-medium text-[var(--foreground)]">
          {t("todayRiskTitle")}
        </p>
        <p
          className={`text-[13px] font-semibold tabular-nums ${
            dayPnl == null
              ? "text-[var(--muted)]"
              : dayPnl >= 0
                ? "text-[var(--up)]"
                : "text-[var(--down)]"
          }`}
        >
          {pnlLabel}
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
        {broken
          ? soft
            ? t("todayRiskSoftTrip", { cap })
            : t("todayRiskHardTrip", { cap })
          : t("todayRiskHint", { cap })}
      </p>
      <Link
        href="/settings"
        className="mt-1.5 inline-block text-[11px] text-[var(--brand-text)] underline-offset-2 hover:underline"
      >
        {t("todayRiskSettings")}
      </Link>
    </div>
  );
}
