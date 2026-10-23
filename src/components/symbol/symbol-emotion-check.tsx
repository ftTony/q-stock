"use client";

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

const TONE: Record<
  EmotionTagId,
  { idle: string; on: string }
> = {
  fomo: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[#f5a3b5] bg-[#fce8ec] text-[#b42345]",
  },
  panic: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[#f5c07a] bg-[#fff1e0] text-[#9a6700]",
  },
  revenge: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[var(--down)]/40 bg-[color-mix(in_srgb,var(--down)_10%,transparent)] text-[var(--down)]",
  },
  oversizing: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[var(--brand)]/40 bg-[var(--brand-soft)] text-[var(--brand-text)]",
  },
  noPlan: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)]",
  },
  calm: {
    idle: "border-[var(--border)] text-[var(--muted)]",
    on: "border-[var(--up)]/50 bg-[color-mix(in_srgb,var(--up)_10%,transparent)] text-[var(--up)]",
  },
};

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

  return (
    <div
      className={`border-t border-[var(--aw-hairline,var(--border))] pt-2.5 ${className}`}
    >
      <p className="aw-metric-label">{t("title")}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {EMOTION_TAG_IDS.map((id) => {
          const on = selected.includes(id);
          const tone = TONE[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(id)}
              className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-medium leading-none tracking-[-0.08px] transition active:scale-95 ${
                on ? tone.on : `${tone.idle} hover:border-[var(--brand)]/35 hover:text-[var(--foreground)]`
              }`}
            >
              {t(id)}
            </button>
          );
        })}
      </div>
      <p className="aw-caption mt-1.5">{t("hint")}</p>
    </div>
  );
}
