"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MARKETING_SHELL_WIDTH } from "@/components/marketing/marketing-width";

const ADVANCED_QUOTES_FALLBACK: Record<string, string> = {
  "zh-CN": "高级行情",
  "zh-TW": "高級行情",
  en: "Advanced quotes",
};

/** Shared bottom CTA + site links (learn/tools/pricing live in marketing header). */
export function MarketingCtaBand({
  compact = false,
}: {
  /** Tighter padding for one-screen pages (learn / tools). */
  compact?: boolean;
}) {
  const t = useTranslations("marketing");
  const locale = useLocale();
  const advancedQuotesLabel = t.has("footerAdvancedQuotes")
    ? t("footerAdvancedQuotes")
    : (ADVANCED_QUOTES_FALLBACK[locale] ??
      ADVANCED_QUOTES_FALLBACK.en);

  return (
    <div
      className="mt-auto shrink-0 border-t border-[var(--border)]"
      style={{
        background: "color-mix(in srgb, var(--panel) 70%, transparent)",
      }}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8 ${MARKETING_SHELL_WIDTH} ${
          compact ? "gap-4 py-5 sm:py-6" : "gap-6 py-8 sm:py-10"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`font-semibold tracking-tight ${
              compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
            }`}
          >
            {t("ctaBandTitle")}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("ctaBandBody")}</p>
          <nav className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
            <Link href="/about" className="hover:text-[var(--foreground)]">
              {t("footerAbout")}
            </Link>
            <Link
              href="/advanced-quotes"
              className="hover:text-[var(--foreground)]"
            >
              {advancedQuotesLabel}
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--foreground)]">
              {t("footerDisclaimer")}
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)]">
              {t("footerTerms")}
            </Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)]">
              {t("footerPrivacy")}
            </Link>
          </nav>
        </div>
        <Link
          href="/markets"
          className="qt-btn qt-btn-primary h-11 shrink-0 self-start px-5 text-sm sm:self-center"
        >
          {t("ctaEnter")}
        </Link>
      </div>
    </div>
  );
}
