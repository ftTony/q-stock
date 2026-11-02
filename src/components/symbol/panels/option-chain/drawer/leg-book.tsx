"use client";

import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";

/** Bid/ask depth + buy-sell ratio strip for the quoted contract. */
export function LegBook({
  row,
  t,
}: {
  row: OptionRow | undefined;
  t: (k: string) => string;
}) {
  if (!row) return null;
  const bidV = row.bidVol ?? 0;
  const askV = row.askVol ?? 0;
  const ratio =
    row.bidAskRatio != null
      ? row.bidAskRatio
      : bidV + askV > 0
        ? ((bidV - askV) / (bidV + askV)) * 100
        : null;
  const bidShare =
    ratio != null
      ? Math.min(100, Math.max(0, (ratio + 100) / 2))
      : bidV + askV > 0
        ? (bidV / (bidV + askV)) * 100
        : 50;
  const hasVol = bidV > 0 || askV > 0;
  const px = (v: number | null | undefined) =>
    v != null && v > 0
      ? formatNumber(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  return (
    <div className="flex flex-col gap-1.5">
      {hasVol ? (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="shrink-0 tabular-nums text-[var(--up)]">
            {t("bidSide")}{" "}
            {formatNumber(bidShare, { maximumFractionDigits: 2 })}%
          </span>
          <span className="relative h-1 flex-1 overflow-hidden bg-[color-mix(in_srgb,var(--down)_45%,transparent)]">
            <span
              className="absolute inset-y-0 left-0 bg-[color-mix(in_srgb,var(--up)_70%,transparent)]"
              style={{ width: `${bidShare}%` }}
            />
          </span>
          <span className="shrink-0 tabular-nums text-[var(--down)]">
            {t("askSide")}{" "}
            {formatNumber(100 - bidShare, { maximumFractionDigits: 2 })}%
          </span>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-x-4 text-[12px]">
        <div className="flex items-center gap-2 py-0.5">
          <span className="w-8 shrink-0 text-[11px] text-[var(--muted)]">
            {t("bidSide")}
          </span>
          <span className="min-w-0 flex-1 text-right font-medium tabular-nums text-[var(--up)]">
            {px(row.bid)}
          </span>
          <span className="w-10 shrink-0 text-right tabular-nums text-[var(--muted)]">
            {row.bidVol != null
              ? `${formatNumber(row.bidVol)}${t("volUnit")}`
              : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <span className="w-8 shrink-0 text-[11px] text-[var(--muted)]">
            {t("askSide")}
          </span>
          <span className="min-w-0 flex-1 text-right font-medium tabular-nums text-[var(--down)]">
            {px(row.ask)}
          </span>
          <span className="w-10 shrink-0 text-right tabular-nums text-[var(--muted)]">
            {row.askVol != null
              ? `${formatNumber(row.askVol)}${t("volUnit")}`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
