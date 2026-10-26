"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";
import type { ProcessSummary } from "@/lib/review/process-summary";

type Props = {
  summary: ProcessSummary | undefined;
  loading?: boolean;
};

export function ReviewProcessSummary({ summary, loading }: Props) {
  const t = useTranslations("review");

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-[var(--surface-2)]"
          />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cells: { label: string; value: string }[] = [
    {
      label: t("statFills"),
      value: String(summary.fillCount),
    },
    {
      label: t("statTagged"),
      value:
        summary.taggedPct != null
          ? `${summary.taggedCount} (${summary.taggedPct}%)`
          : String(summary.taggedCount),
    },
    {
      label: t("statUntagged"),
      value: String(summary.untaggedCount),
    },
    {
      label: t("statEmotion"),
      value: String(summary.emotionTaggedCount),
    },
    {
      label: t("statPositions"),
      value: String(summary.openPositionCount),
    },
    {
      label: t("statCash"),
      value:
        summary.cash != null
          ? formatNumber(summary.cash, { maximumFractionDigits: 0 })
          : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-[var(--border)] px-3 py-2"
        >
          <div className="text-[11px] text-[var(--muted)]">{c.label}</div>
          <div className="mt-0.5 text-sm font-medium tabular-nums">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
