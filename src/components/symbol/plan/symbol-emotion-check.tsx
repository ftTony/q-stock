"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export const EMOTION_TAG_IDS = [
  "fomo",
  "panic",
  "revenge",
  "oversizing",
  "noPlan",
  "calm",
] as const;

export type EmotionTagId = (typeof EMOTION_TAG_IDS)[number];

type Props = {
  selected: EmotionTagId[];
  onChange: (next: EmotionTagId[]) => void;
  className?: string;
};

export function SymbolEmotionCheck({
  selected,
  onChange,
  className = "",
}: Props) {
  const t = useTranslations("symbolEmotion");
  const [open, setOpen] = useState(selected.length > 0);

  function toggle(id: EmotionTagId) {
    if (id === "calm") {
      onChange(selected.includes("calm") ? [] : ["calm"]);
      return;
    }
    const withoutCalm = selected.filter((x) => x !== "calm");
    onChange(
      withoutCalm.includes(id)
        ? withoutCalm.filter((x) => x !== id)
        : [...withoutCalm, id],
    );
  }

  const summary =
    selected.length > 0
      ? selected.map((id) => t(id)).join(" · ")
      : t("hint");

  return (
    <div
      className={`border-t border-[var(--aw-hairline,var(--border))] pt-2.5 ${className}`}
    >
      <button
        type="button"
        className="flex w-full items-baseline justify-between gap-2 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="aw-metric-label">{t("title")}</span>
        <span className="min-w-0 truncate text-[12px] leading-snug text-[var(--muted)]">
          {open ? (selected.length > 0 ? summary : t("hint")) : summary}
        </span>
      </button>
      {open ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EMOTION_TAG_IDS.map((id) => {
            const on = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(id)}
                className={`inline-flex h-7 items-center rounded-sm border px-2 text-[12px] font-medium leading-none tracking-[-0.08px] transition active:scale-95 ${
                  on
                    ? "border-[var(--brand)]/35 bg-[var(--brand-soft)] text-[var(--brand-text)]"
                    : "border-[var(--aw-hairline,var(--border))] text-[var(--muted)] hover:border-[var(--brand)]/35 hover:text-[var(--foreground)]"
                }`}
              >
                {t(id)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
