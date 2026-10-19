"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";
import type { Quote } from "@/lib/types";

type MetricKey =
  | "open"
  | "high"
  | "low"
  | "prevClose"
  | "volume"
  | "amount"
  | "mktCap";

type Props = {
  quote: Quote | null;
  marketCap?: number | null;
};

function fmtPx(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtVol(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatNumber(n, { maximumFractionDigits: 0 });
}

function renderVal(key: MetricKey, value: number | null | undefined) {
  if (key === "volume" || key === "amount" || key === "mktCap") {
    return fmtVol(value);
  }
  return fmtPx(value);
}

/** Longbridge-style: three columns, label left / value right, hairline rows. */
const ROWS: MetricKey[][] = [
  ["open", "high", "low"],
  ["prevClose", "volume", "amount"],
  ["mktCap"],
];

export function SymbolRailStats({ quote, marketCap = null }: Props) {
  const t = useTranslations("symbol");

  const values: Record<MetricKey, number | null | undefined> = {
    open: quote?.open,
    high: quote?.high,
    low: quote?.low,
    prevClose: quote?.previousClose,
    volume: quote?.volume,
    amount: quote?.turnover,
    mktCap: marketCap,
  };

  return (
    <div className="border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] px-2 py-1.5">
      {ROWS.map((row, ri) => (
        <div
          key={ri}
          className="grid grid-cols-3 gap-x-2 py-0.5"
        >
          {row.map((key) => (
            <div
              key={key}
              className="flex min-w-0 items-baseline justify-between gap-1"
            >
              <span className="shrink-0 text-[12px] leading-none tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
                {t(key)}
              </span>
              <span className="truncate text-right text-[12px] font-medium tabular-nums leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
                {quote ? renderVal(key, values[key]) : "—"}
              </span>
            </div>
          ))}
          {row.length < 3
            ? Array.from({ length: 3 - row.length }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))
            : null}
        </div>
      ))}
    </div>
  );
}
