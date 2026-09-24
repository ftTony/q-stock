"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { ChangeAbs, ChangePct } from "@/components/market/price";
import type { AssetType, Quote } from "@/lib/types";

function fmt(v: number | null | undefined, digits = 2): string {
  if (v == null || Number.isNaN(v)) return "-";
  return v.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function fmtCompact(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "-";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
  return fmt(v, abs >= 1 ? 2 : 4);
}

function metricValue(metrics: EarningsMetric[], key: string): number | null {
  const m = metrics.find((x) => x.key === key);
  return m?.value ?? null;
}

function StatCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] leading-tight text-[var(--muted)] sm:text-[11px]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-xs font-medium tabular-nums sm:text-sm">
        {children}
      </div>
    </div>
  );
}

/** Compact quote metrics grid (no panel chrome). */
export function QuoteStatsGrid({
  quote,
  metrics = [],
  assetType = "stock",
  className = "",
}: {
  quote: Quote;
  metrics?: EarningsMetric[];
  assetType?: AssetType;
  className?: string;
}) {
  const t = useTranslations("symbol");
  const isCrypto = assetType === "crypto";

  const amplitude =
    quote.previousClose > 0
      ? ((quote.high - quote.low) / quote.previousClose) * 100
      : null;

  const weekHigh = metricValue(metrics, "52WeekHigh");
  const weekLow = metricValue(metrics, "52WeekLow");
  const mktCap = metricValue(metrics, "marketCapitalization");
  const pe = metricValue(metrics, "peTTM");
  const beta = metricValue(metrics, "beta");

  return (
    <div
      className={`grid grid-cols-3 gap-x-3 gap-y-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 ${className}`}
    >
      <StatCell label={t("open")}>{fmt(quote.open)}</StatCell>
      <StatCell label={t("high")}>{fmt(quote.high)}</StatCell>
      <StatCell label={t("low")}>{fmt(quote.low)}</StatCell>
      <StatCell label={t("prevClose")}>{fmt(quote.previousClose)}</StatCell>
      <StatCell label={t("changeAmt")}>
        <ChangeAbs value={quote.change} />
      </StatCell>
      <StatCell label={t("changePct")}>
        <ChangePct value={quote.percentChange} />
      </StatCell>
      <StatCell label={t("amplitude")}>
        {amplitude != null ? `${amplitude.toFixed(2)}%` : "-"}
      </StatCell>
      {!isCrypto && (
        <>
          <StatCell label={t("volume")}>{fmtCompact(quote.volume)}</StatCell>
          <StatCell label={t("turnover")}>{fmtCompact(quote.turnover)}</StatCell>
          <StatCell label={t("week52High")}>{fmt(weekHigh)}</StatCell>
          <StatCell label={t("week52Low")}>{fmt(weekLow)}</StatCell>
          <StatCell label={t("mktCap")}>
            {mktCap != null ? fmtCompact(mktCap * 1e6) : "-"}
          </StatCell>
          <StatCell label={t("peTtm")}>{fmt(pe)}</StatCell>
          <StatCell label={t("beta")}>{fmt(beta)}</StatCell>
        </>
      )}
    </div>
  );
}

/** Standalone panel variant (title + grid). */
export function QuoteStatsPanel({
  quote,
  metrics = [],
  assetType = "stock",
}: {
  quote: Quote;
  metrics?: EarningsMetric[];
  assetType?: AssetType;
}) {
  const t = useTranslations("symbol");
  return (
    <div className="qt-panel w-full p-3 sm:p-4">
      <div className="mb-2.5 text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
        {t("quotePanel")}
      </div>
      <QuoteStatsGrid quote={quote} metrics={metrics} assetType={assetType} />
    </div>
  );
}
