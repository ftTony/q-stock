"use client";

import { useTranslations } from "next-intl";

export type SentimentBucket = {
  available?: boolean;
  message?: string;
  buzz_score?: number;
  sentiment_score?: number;
  bullish_pct?: number;
  bearish_pct?: number;
  trend?: string | null;
  source?: string;
};

export type SymbolSentiment = {
  news?: SentimentBucket;
  reddit?: SentimentBucket;
} | null;

function barPct(bucket?: SentimentBucket): number | null {
  if (!bucket || bucket.available === false) return null;
  if (typeof bucket.bullish_pct === "number" && Number.isFinite(bucket.bullish_pct)) {
    return Math.max(0, Math.min(100, bucket.bullish_pct));
  }
  if (
    typeof bucket.sentiment_score === "number" &&
    Number.isFinite(bucket.sentiment_score)
  ) {
    return Math.max(0, Math.min(100, (bucket.sentiment_score + 1) * 50));
  }
  return null;
}

function formatScore(bucket?: SentimentBucket): string {
  if (!bucket || bucket.available === false) return "—";
  if (typeof bucket.bullish_pct === "number" && Number.isFinite(bucket.bullish_pct)) {
    return `${bucket.bullish_pct.toFixed(0)}%`;
  }
  if (
    typeof bucket.sentiment_score === "number" &&
    Number.isFinite(bucket.sentiment_score)
  ) {
    const s = bucket.sentiment_score;
    return `${s > 0 ? "+" : ""}${s.toFixed(2)}`;
  }
  return "—";
}

function scoreValue(bucket?: SentimentBucket): number | null {
  if (!bucket || bucket.available === false) return null;
  if (typeof bucket.sentiment_score === "number") return bucket.sentiment_score;
  if (typeof bucket.bullish_pct === "number") return (bucket.bullish_pct - 50) / 50;
  return null;
}

type Props = {
  sentiment: SymbolSentiment;
};

/**
 * Full-width rail meters (Longbridge pressure-bar feel) — not a floating chip.
 */
export function SymbolSentimentChip({ sentiment }: Props) {
  const t = useTranslations("symbol");
  const rows: { label: string; bucket?: SentimentBucket }[] = [
    { label: t("sentimentNews"), bucket: sentiment?.news },
    { label: t("sentimentSocial"), bucket: sentiment?.reddit },
  ];

  return (
    <div
      className="hidden items-end gap-3 border-l border-[var(--aw-hairline,var(--border))] pl-3 md:flex"
      title={t("sentiment")}
      aria-label={t("sentiment")}
    >
      {rows.map(({ label, bucket }) => {
        const fill = barPct(bucket);
        const score = scoreValue(bucket);
        const bearish = fill == null ? 0 : Math.max(0, 100 - fill);
        const bullish = fill == null ? 0 : fill;
        const tone =
          score == null
            ? "text-[var(--aw-ink,var(--foreground))]"
            : score < -0.05
              ? "text-[var(--down)]"
              : score > 0.05
                ? "text-[var(--up)]"
                : "text-[var(--aw-ink,var(--foreground))]";
        return (
          <div key={label} className="w-[5.5rem]">
            <div className="mb-1 flex items-baseline justify-between gap-1.5 text-[12px] leading-none tracking-[-0.12px]">
              <span className="text-[var(--aw-ink-muted-48,var(--muted))]">{label}</span>
              <span className={`tabular-nums font-semibold ${tone}`}>
                {formatScore(bucket)}
              </span>
            </div>
            <div className="flex h-[3px] w-full overflow-hidden rounded-full bg-[var(--aw-hairline,#d5dce8)]">
              <div className="h-full bg-[var(--down)]" style={{ width: `${bearish}%` }} />
              <div className="h-full bg-[var(--up)]" style={{ width: `${bullish}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
