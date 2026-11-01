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

  return (
    <div>
      <div className="flex items-center gap-2 text-[11px]">
        {hasVol ? (
          <span className="ml-auto flex flex-1 items-center gap-1.5">
            <span className="text-[var(--up)] tabular-nums">
              {t("bidSide")} {formatNumber(bidShare, { maximumFractionDigits: 2 })}%
            </span>
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--down)_55%,transparent)]">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-[color-mix(in_srgb,var(--up)_75%,transparent)]"
                style={{ width: `${bidShare}%` }}
              />
            </span>
            <span className="text-[var(--down)] tabular-nums">
              {t("askSide")}{" "}
              {formatNumber(100 - bidShare, { maximumFractionDigits: 2 })}%
            </span>
          </span>
        ) : (
          <span className="ml-auto text-[var(--muted)]">—</span>
        )}
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-4 text-[12px]">
        <div className="flex items-center justify-between py-0.5">
          <span className="text-[var(--muted)]">{t("bidSide")}</span>
          <span className="font-semibold tabular-nums text-[var(--up)]">
            {row.bid != null ? formatNumber(row.bid, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
          </span>
          <span className="tabular-nums text-[var(--muted)]">
            {row.bidVol != null ? `${formatNumber(row.bidVol)}${t("volUnit")}` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-0.5">
          <span className="text-[var(--muted)]">{t("askSide")}</span>
          <span className="font-semibold tabular-nums text-[var(--down)]">
            {row.ask != null ? formatNumber(row.ask, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
          </span>
          <span className="tabular-nums text-[var(--muted)]">
            {row.askVol != null ? `${formatNumber(row.askVol)}${t("volUnit")}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
