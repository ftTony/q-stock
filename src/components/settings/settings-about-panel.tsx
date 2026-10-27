"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const DISCLAIMER_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

/** Settings → About: product note + full disclaimer (guest-friendly). */
export function SettingsAboutPanel() {
  const t = useTranslations("settings");
  const td = useTranslations("disclaimer");

  return (
    <div className="settings-ui space-y-5">
      <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("aboutIntroTitle")}
        </h3>
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          {t("aboutIntroBody")}
        </p>
        <p className="pt-1">
          <Link
            href="/about"
            className="text-[12px] font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("aboutPageLink")}
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
            {td("title")}
          </h3>
          <Link
            href="/disclaimer"
            className="text-[12px] font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("disclaimerPageLink")}
          </Link>
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">
          {td("subtitle")}
        </p>

        <ol className="divide-y divide-[var(--aw-hairline,var(--border))]">
          {DISCLAIMER_KEYS.map((key, i) => (
            <li key={key} className="flex gap-3 py-3 sm:gap-3.5">
              <span
                aria-hidden
                className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-[var(--brand-text)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[12px] leading-relaxed text-[var(--foreground)] sm:text-[13px]">
                {td(key)}
              </p>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          <Link
            href="/terms"
            className="font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("termsPageLink")}
          </Link>
          <Link
            href="/privacy"
            className="font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("privacyPageLink")}
          </Link>
        </div>

        <aside
          className="flex gap-3 rounded-none px-3 py-3 sm:px-3.5"
          role="note"
          style={{
            background: "color-mix(in srgb, #f59e0b 10%, var(--panel))",
          }}
        >
          <span
            aria-hidden
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[12px] font-semibold"
            style={{
              background: "color-mix(in srgb, #f59e0b 22%, transparent)",
              color: "color-mix(in srgb, #b45309 85%, var(--foreground))",
            }}
          >
            !
          </span>
          <p
            className="text-[12px] leading-relaxed sm:text-[13px]"
            style={{
              color: "color-mix(in srgb, #b45309 88%, var(--foreground))",
            }}
          >
            {td("mainlandNotice")}
          </p>
        </aside>
      </section>
    </div>
  );
}
