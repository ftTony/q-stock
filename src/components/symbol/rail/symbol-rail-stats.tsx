"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { formatNumber } from "@/lib/format-number";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  quote: Quote | null;
  metrics?: EarningsMetric[];
  assetType?: AssetType;
  marketCap?: number | null;
};

type Cell = {
  labelKey: string;
  value: string;
  /** Compare to prev close for up/down tint (prices only). */
  tint?: number | null;
};

function fmtPx(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

/** Compact volume / notional / shares — Futu-style 万/亿 when zh, else K/M/B. */
function fmtCompact(n: number | null | undefined, localeHint: string): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const zh = localeHint.startsWith("zh");
  if (zh) {
    if (abs >= 1e8) return `${(n / 1e8).toFixed(2)}亿`;
    if (abs >= 1e4) return `${(n / 1e4).toFixed(2)}万`;
    return formatNumber(n, { maximumFractionDigits: 0 });
  }
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatNumber(n, { maximumFractionDigits: 0 });
}

function fmtRatio(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function metricOf(metrics: EarningsMetric[], key: string): number | null {
  const hit = metrics.find((m) => m.key === key);
  const v = hit?.value;
  return v != null && Number.isFinite(v) ? v : null;
}

function tintClass(tint: number | null | undefined, prev: number | null): string {
  if (tint == null || prev == null || !Number.isFinite(tint) || !(prev > 0)) {
    return "text-[var(--aw-ink,var(--foreground))]";
  }
  if (tint > prev) return "text-[var(--up)]";
  if (tint < prev) return "text-[var(--down)]";
  return "text-[var(--aw-ink,var(--foreground))]";
}

function PairRow({
  left,
  right,
  prev,
  label,
}: {
  left: Cell;
  right: Cell;
  prev: number | null;
  label: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 py-1.5">
      {[left, right].map((cell) => (
        <div
          key={cell.labelKey}
          className="flex min-w-0 items-baseline justify-between gap-2"
        >
          <span className="aw-caption shrink-0">
            {label(cell.labelKey)}
          </span>
          <span
            className={`min-w-0 truncate text-right text-[14px] font-medium tabular-nums leading-[1.25] tracking-[-0.16px] ${tintClass(cell.tint, prev)}`}
          >
            {cell.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Futu-style quote strip: 2-column label/value pairs, up/down tint vs prev close,
 * collapsible extras (fundamentals).
 */
export function SymbolRailStats({
  quote,
  metrics = [],
  assetType = "stock",
  marketCap = null,
}: Props) {
  const t = useTranslations("symbol");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const isZh = locale.startsWith("zh");
  const label = (key: string) => t(key as "high");

  const prev = quote?.previousClose ?? null;
  const price = quote?.price ?? null;

  const mktCap =
    marketCap ??
    (() => {
      const m = metricOf(metrics, "marketCapitalization");
      return m != null ? m * 1e6 : null;
    })();

  const peTtm = metricOf(metrics, "peTTM");
  const peStatic = metricOf(metrics, "peNormalizedAnnual");
  const pb = metricOf(metrics, "pbAnnual");
  const weekHigh = metricOf(metrics, "52WeekHigh");
  const weekLow = metricOf(metrics, "52WeekLow");
  const beta = metricOf(metrics, "beta");

  const sharesOut = useMemo(() => {
    const fromMetric = metricOf(metrics, "shareOutstanding");
    if (fromMetric != null && fromMetric > 0) return fromMetric * 1e6;
    if (mktCap != null && price != null && price > 0) return mktCap / price;
    return null;
  }, [metrics, mktCap, price]);

  const amplitude =
    quote && prev != null && prev > 0
      ? ((quote.high - quote.low) / prev) * 100
      : null;

  const primary: [Cell, Cell][] = [
    [
      { labelKey: "high", value: fmtPx(quote?.high), tint: quote?.high },
      { labelKey: "low", value: fmtPx(quote?.low), tint: quote?.low },
    ],
    [
      { labelKey: "open", value: fmtPx(quote?.open), tint: quote?.open },
      { labelKey: "prevClose", value: fmtPx(prev), tint: null },
    ],
    [
      {
        labelKey: "volume",
        value: fmtCompact(quote?.volume, isZh ? "zh" : "en"),
      },
      {
        labelKey: "amount",
        value: fmtCompact(quote?.turnover, isZh ? "zh" : "en"),
      },
    ],
  ];

  if (assetType !== "crypto") {
    primary.push([
      {
        labelKey: "mktCap",
        value: fmtCompact(mktCap, isZh ? "zh" : "en"),
      },
      { labelKey: "peTtm", value: fmtRatio(peTtm) },
    ]);
  }

  const extra: [Cell, Cell][] =
    assetType === "crypto"
      ? []
      : [
          [
            {
              labelKey: "sharesOut",
              value: fmtCompact(sharesOut, isZh ? "zh" : "en"),
            },
            { labelKey: "pbRatio", value: fmtRatio(pb) },
          ],
          [
            { labelKey: "peStatic", value: fmtRatio(peStatic) },
            {
              labelKey: "amplitude",
              value:
                amplitude != null
                  ? `${formatNumber(amplitude, { maximumFractionDigits: 2 })}%`
                  : "—",
            },
          ],
          [
            {
              labelKey: "week52High",
              value: fmtPx(weekHigh),
              tint: weekHigh,
            },
            {
              labelKey: "week52Low",
              value: fmtPx(weekLow),
              tint: weekLow,
            },
          ],
          [
            { labelKey: "beta", value: fmtRatio(beta) },
            { labelKey: "bid", value: fmtPx(quote?.bid), tint: quote?.bid },
          ],
        ];

  const rows = expanded ? [...primary, ...extra] : primary;

  return (
    <div className="bg-[var(--aw-canvas)] px-3 pt-1.5 pb-1">
      {rows.map((pair, i) => (
        <PairRow
          key={i}
          left={pair[0]}
          right={pair[1]}
          prev={prev}
          label={label}
        />
      ))}
      {extra.length > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center py-1 text-[var(--aw-ink-muted-48,var(--muted))] hover:text-[var(--aw-ink)]"
          aria-expanded={expanded}
          title={expanded ? t("statsCollapse") : t("statsExpand")}
        >
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <path d="M2.5 4.5 L6 8 L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">
            {expanded ? t("statsCollapse") : t("statsExpand")}
          </span>
        </button>
      ) : (
        <div className="h-1" />
      )}
    </div>
  );
}
