"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/** Richer “getting started” block for the Rule Lab left rail. */
export function StrategiesLabIntro() {
  const t = useTranslations("strategies");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md bg-[var(--surface-2)] px-2.5 py-2.5">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="text-[12px] font-medium">{t("introTitle")}</div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">
          {t("introBody")}
        </p>
        <ol className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-[var(--foreground)]/90">
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-text)]">
              1
            </span>
            <span>{t("introStep1")}</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-text)]">
              2
            </span>
            <span>{t("introStep2")}</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-text)]">
              3
            </span>
            <span>{t("introStep3")}</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-text)]">
              4
            </span>
            <span>{t("introStep4")}</span>
          </li>
        </ol>
        <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
          {t("introNote")}
        </p>
      </div>
      <Link
        href="/learn/strategy-lab-intro"
        className="mt-2 inline-block shrink-0 text-[11px] text-[var(--brand-text)] hover:underline"
      >
        {t("introLink")} →
      </Link>
    </div>
  );
}
