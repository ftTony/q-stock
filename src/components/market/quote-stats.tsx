import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { ChangeAbs, ChangePct } from "@/components/market/price";
import type { Quote } from "@/lib/types";

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

function metricValue(
  metrics: EarningsMetric[],
  key: string,
): number | null {
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
      <div className="text-[11px] text-[var(--muted)]">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium tabular-nums">
        {children}
      </div>
    </div>
  );
}

export function QuoteStatsPanel({
  quote,
  metrics = [],
}: {
  quote: Quote;
  metrics?: EarningsMetric[];
}) {
  const t = useTranslations("symbol");

  const amplitude =
    quote.previousClose > 0
      ? ((quote.high - quote.low) / quote.previousClose) * 100
      : null;

  const spread =
    quote.ask != null && quote.bid != null ? quote.ask - quote.bid : null;

  const weekHigh = metricValue(metrics, "52WeekHigh");
  const weekLow = metricValue(metrics, "52WeekLow");
  const mktCap = metricValue(metrics, "marketCapitalization");
  const pe = metricValue(metrics, "peTTM");
  const beta = metricValue(metrics, "beta");
  const showFund = metrics.length > 0;

  return (
    <div className="qt-panel w-full p-3 sm:p-4">
      <div className="mb-2 text-[11px] font-semibold tracking-wide text-[var(--muted)] uppercase">
        {t("quotePanel")}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
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
        <StatCell label={t("volume")}>{fmtCompact(quote.volume)}</StatCell>
        <StatCell label={t("turnover")}>{fmtCompact(quote.turnover)}</StatCell>
        <StatCell label={t("bid")}>
          {quote.bid != null
            ? `${fmt(quote.bid)}${quote.bidSize != null ? ` × ${fmtCompact(quote.bidSize)}` : ""}`
            : "-"}
        </StatCell>
        <StatCell label={t("ask")}>
          {quote.ask != null
            ? `${fmt(quote.ask)}${quote.askSize != null ? ` × ${fmtCompact(quote.askSize)}` : ""}`
            : "-"}
        </StatCell>
        <StatCell label={t("spread")}>
          {spread != null ? fmt(spread, 4) : "-"}
        </StatCell>
        {showFund && (
          <>
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
    </div>
  );
}
