"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { FLAG_I18N } from "@/components/review/review-flag-labels";
import { formatDateTime, formatNumber } from "@/lib/format-number";
import type { ProcessFill } from "@/lib/review/process-summary";

export type FillFilter = "all" | "tagged" | "flags";

type Props = {
  fills: ProcessFill[];
  filter: FillFilter;
  loading?: boolean;
};

export function ReviewFillsList({ fills, filter, loading }: Props) {
  const t = useTranslations("review");

  const filtered = fills.filter((f) => {
    if (filter === "tagged") return Boolean(f.strategyId);
    if (filter === "flags") return f.flags.length > 0;
    return true;
  });

  if (loading && fills.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{t("fillsLoading")}</p>;
  }

  if (filtered.length === 0) {
    return (
      <div className="space-y-2 py-4 text-sm text-[var(--muted)]">
        <p>{t("fillsEmpty")}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/portfolio" className="aw-text-link text-sm">
            {t("ctaPortfolio")}
          </Link>
          <Link href="/markets" className="aw-text-link text-sm">
            {t("ctaMarkets")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {filtered.map((f) => {
        const when = f.filledAt || f.createdAt;
        return (
          <li key={f.id} className="space-y-1.5 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2 text-sm">
                <Link
                  href={`/symbol/${f.assetType}/${encodeURIComponent(f.symbol)}`}
                  className="font-medium hover:underline"
                >
                  {f.symbol}
                </Link>
                <span
                  className={
                    f.side === "buy"
                      ? "text-[var(--up)]"
                      : "text-[var(--down)]"
                  }
                >
                  {f.side === "buy" ? t("sideBuy") : t("sideSell")}
                </span>
                <span className="tabular-nums text-[var(--muted)]">
                  {formatNumber(f.qty, { maximumFractionDigits: 4 })}
                  {f.filledPrice != null
                    ? ` @ ${formatNumber(f.filledPrice, {
                        maximumFractionDigits: 2,
                      })}`
                    : ""}
                </span>
              </div>
              <span className="text-[11px] tabular-nums text-[var(--muted)]">
                {formatDateTime(when)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {f.strategyId ? (
                <Link
                  href={`/strategies/${f.strategyId}`}
                  className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[12px] text-[var(--brand-text)]"
                >
                  {f.strategyName || t("tagged")}
                </Link>
              ) : null}
              {f.flags.map((flag) => (
                <span
                  key={flag}
                  className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[12px] text-[var(--muted)]"
                >
                  {t(FLAG_I18N[flag])}
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
