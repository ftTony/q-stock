"use client";

import { useTranslations } from "next-intl";
import type { AlertFrequency } from "@/lib/alerts/threshold";

export type { AlertFrequency };

const OPTIONS: AlertFrequency[] = ["once", "daily", "always"];

type Props = {
  value: AlertFrequency;
  onChange: (v: AlertFrequency) => void;
  /** Compact popover (symbol quote strip). */
  dense?: boolean;
  className?: string;
};

/** Segmented control: once / daily / always — selected = fill + weight, not heavy outline. */
export function AlertFrequencySeg({
  value,
  onChange,
  dense = false,
  className = "",
}: Props) {
  const t = useTranslations("alerts");

  return (
    <div className={`space-y-1.5 ${className}`}>
      <span
        className={`block text-[var(--muted)] ${dense ? "text-[11px]" : "text-[12px]"}`}
      >
        {t("frequency")}
      </span>
      <div
        role="radiogroup"
        aria-label={t("frequency")}
        className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--border)]"
      >
        {OPTIONS.map((id) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(id)}
              className={`text-center transition ${
                dense ? "h-7 text-[11px]" : "h-8 text-[12px]"
              } ${
                selected
                  ? "bg-[var(--panel)] font-medium text-[var(--foreground)]"
                  : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t(`freq_${id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
