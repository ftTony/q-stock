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

const PRICE_KEYS: MetricKey[] = ["open", "high", "low", "prevClose"];
const SIZE_KEYS: MetricKey[] = ["volume", "amount", "mktCap"];

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

  const cells = (keys: MetricKey[]) =>
    keys.map((key) => (
      <div key={key} className="min-w-0 text-left">
        <div className="aw-metric-label">{t(key)}</div>
        <div className="aw-metric-value mt-0.5 truncate">
          {quote ? renderVal(key, values[key]) : "—"}
        </div>
      </div>
    ));

  return (
    <div className="space-y-2 border-b border-[var(--border)] px-3 py-2.5">
      <div className="grid grid-cols-4 gap-x-3">{cells(PRICE_KEYS)}</div>
      <div className="grid grid-cols-3 gap-x-3 border-t border-[var(--border)] pt-2">
        {cells(SIZE_KEYS)}
      </div>
    </div>
  );
}
