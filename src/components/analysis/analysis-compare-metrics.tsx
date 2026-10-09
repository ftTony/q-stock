"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  basketKey,
  type AnalysisBasketItem,
} from "@/components/analysis/types";
import {
  currencyPrefix,
  formatCompact,
  formatMoney,
  formatPct,
  type FundMetrics,
} from "@/components/analysis/compare-fundamentals";

type RowDef = {
  key: string;
  label: string;
  render: (b: AnalysisBasketItem) => ReactNode;
};

type Props = {
  basket: AnalysisBasketItem[];
  funds: Record<string, FundMetrics>;
  fundsLoading: boolean;
};

export function AnalysisCompareMetrics({
  basket,
  funds,
  fundsLoading,
}: Props) {
  const t = useTranslations("analysis");

  function fundCell(
    b: AnalysisBasketItem,
    pick: (f: FundMetrics) => string,
  ): ReactNode {
    const f = funds[basketKey(b)];
    if (fundsLoading && !f) return "…";
    if (!f) return "—";
    return pick(f);
  }

  const rows: RowDef[] = [
    {
      key: "price",
      label: t("price"),
      render: (b) =>
        b.price != null ? (
          <span className="font-medium tabular-nums">
            {currencyPrefix(b.assetType)}
            <PriceText value={b.price} change={b.percentChange ?? 0} />
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "change",
      label: t("change"),
      render: (b) =>
        b.percentChange != null ? (
          <span className="font-medium">
            <ChangePct value={b.percentChange} />
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "high",
      label: t("high"),
      render: (b) => formatMoney(b.high, b.assetType),
    },
    {
      key: "low",
      label: t("low"),
      render: (b) => formatMoney(b.low, b.assetType),
    },
    {
      key: "prevClose",
      label: t("prevClose"),
      render: (b) => formatMoney(b.previousClose, b.assetType),
    },
    {
      key: "mktCap",
      label: t("metricMktCap"),
      render: (b) =>
        fundCell(b, (f) =>
          formatCompact(f.marketCap, currencyPrefix(b.assetType)),
        ),
    },
    {
      key: "pe",
      label: t("metricPe"),
      render: (b) =>
        fundCell(b, (f) => (f.pe != null ? f.pe.toFixed(2) : "—")),
    },
    {
      key: "pb",
      label: t("metricPb"),
      render: (b) =>
        fundCell(b, (f) => (f.pb != null ? f.pb.toFixed(2) : "—")),
    },
    {
      key: "revenue",
      label: t("metricRevenue"),
      render: (b) =>
        fundCell(b, (f) =>
          formatCompact(f.revenue, currencyPrefix(b.assetType)),
        ),
    },
    {
      key: "profit",
      label: t("metricProfit"),
      render: (b) =>
        fundCell(b, (f) =>
          formatCompact(f.profit, currencyPrefix(b.assetType)),
        ),
    },
    {
      key: "roe",
      label: t("metricRoe"),
      render: (b) => fundCell(b, (f) => formatPct(f.roe)),
    },
    {
      key: "roa",
      label: t("metricRoa"),
      render: (b) => fundCell(b, (f) => formatPct(f.roa)),
    },
    {
      key: "grossMargin",
      label: t("metricGrossMargin"),
      render: (b) => fundCell(b, (f) => formatPct(f.grossMargin)),
    },
    {
      key: "netMargin",
      label: t("metricNetMargin"),
      render: (b) => fundCell(b, (f) => formatPct(f.netMargin)),
    },
    {
      key: "debtToAsset",
      label: t("metricDebtToAsset"),
      render: (b) => fundCell(b, (f) => formatPct(f.debtToAsset)),
    },
    {
      key: "totalAssets",
      label: t("metricTotalAssets"),
      render: (b) =>
        fundCell(b, (f) =>
          formatCompact(f.totalAssets, currencyPrefix(b.assetType)),
        ),
    },
  ];

  return (
    <section className="qt-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-3.5 py-2.5">
        <h3 className="text-[14px] font-semibold">{t("metrics")}</h3>
      </div>
      <div className="overflow-x-auto qt-scroll">
        <table className="w-full text-[14px] leading-5">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[14px] text-[var(--muted)]">
              <th className="w-28 px-3.5 py-2.5 font-semibold sm:w-36">
                {t("metric")}
              </th>
              {basket.map((b) => (
                <th
                  key={`h-${b.assetType}:${b.symbol}`}
                  className="px-3 py-2.5 font-semibold text-[var(--foreground)]"
                >
                  {b.symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-[var(--border)]/70 last:border-0"
              >
                <th className="px-3.5 py-2.5 text-left text-[14px] font-normal text-[var(--muted)]">
                  {row.label}
                </th>
                {basket.map((b) => (
                  <td
                    key={`${row.key}-${b.assetType}:${b.symbol}`}
                    className="px-3 py-2.5 tabular-nums text-[var(--foreground)]"
                  >
                    {row.render(b)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--border)] px-3.5 py-2 text-[12px] text-[var(--muted)]">
        {t("metricsNote")}
      </p>
    </section>
  );
}
