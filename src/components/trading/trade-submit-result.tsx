"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Props = {
  kind: "filled" | "pending";
  onDismiss: () => void;
  /** Close trade UI and open this symbol's review rail. */
  onViewSymbolReview?: () => void;
};

/** Post-submit feedback + symbol review CTA (P0 IA). */
export function TradeSubmitResult({
  kind,
  onDismiss,
  onViewSymbolReview,
}: Props) {
  const t = useTranslations("trading");
  return (
    <div
      role="status"
      className="flex items-start justify-between gap-2 border border-[color-mix(in_srgb,var(--up)_28%,var(--border))] bg-[color-mix(in_srgb,var(--up)_8%,var(--panel))] px-3 py-2 text-[12px] leading-snug"
    >
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-[var(--up)]">
          {kind === "filled" ? t("orderFilledPaper") : t("orderPendingPaper")}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {onViewSymbolReview ? (
            <button
              type="button"
              className="aw-text-link"
              onClick={() => {
                onViewSymbolReview();
                onDismiss();
              }}
            >
              {t("viewSymbolReview")}
            </button>
          ) : null}
          <Link
            href="/review"
            className="aw-text-link text-[var(--muted)]"
            onClick={onDismiss}
          >
            {t("viewReviewDesk")}
          </Link>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]"
        aria-label={t("dismissResult")}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
