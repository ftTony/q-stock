"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/** Shared bottom CTA + site links (landing story, learn, tools, disclaimer). */
export function MarketingCtaBand({
  compact = false,
}: {
  /** Tighter padding for one-screen pages (learn / tools). */
  compact?: boolean;
}) {
  const t = useTranslations("marketing");

  return (
    <div
      className="mt-auto shrink-0 border-t border-[var(--border)]"
      style={{
        background: "color-mix(in srgb, var(--panel) 70%, transparent)",
      }}
    >
      <div
        className={`mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 ${
          compact
            ? "gap-4 px-4 py-5 sm:py-6"
            : "gap-6 px-4 py-8 sm:py-10"
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
            <Link href="/learn" className="hover:text-[var(--foreground)]">
              {t("footerLearn")}
            </Link>
            <Link href="/tools" className="hover:text-[var(--foreground)]">
              {t("footerTools")}
            </Link>
            <Link href="/pricing" className="hover:text-[var(--foreground)]">
              {t("footerPricing")}
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--foreground)]">
              {t("footerDisclaimer")}
            </Link>
            <Link href="/markets" className="hover:text-[var(--foreground)]">
              {t("footerMarkets")}
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
