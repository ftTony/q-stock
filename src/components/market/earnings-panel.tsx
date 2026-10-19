"use client";

import { useTranslations } from "next-intl";
import { EarningsCharts } from "@/components/market/earnings-charts";
import { formatNumber } from "@/lib/format-number";

export type EarningsSurprise = {
  actual: number | null;
  estimate: number | null;
  period: string;
  quarter: number;
  year: number;
  surprise?: number | null;
  surprisePercent?: number | null;
};

export type EarningsCalendarRow = {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  year: number;
};

export type EarningsMetric = {
  key: string;
  value: number | null;
};

const METRIC_LABEL_KEYS: Record<string, string> = {
  peNormalizedAnnual: "metricPeAnnual",
  peTTM: "metricPeTtm",
  pbAnnual: "metricPb",
  psTTM: "metricPs",
  epsAnnual: "metricEpsAnnual",
  epsTTM: "metricEpsTtm",
  roeTTM: "metricRoe",
  roaTTM: "metricRoa",
  grossMarginTTM: "metricGrossMargin",
  operatingMarginTTM: "metricOpMargin",
  netProfitMarginTTM: "metricNetMargin",
  revenuePerShareTTM: "metricRevPerShare",
  dividendYieldIndicatedAnnual: "metricDivYield",
  "52WeekHigh": "metric52High",
  "52WeekLow": "metric52Low",
  beta: "metricBeta",
  marketCapitalization: "metricMktCap",
};

function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  return formatNumber(v, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  return `${v.toFixed(2)}%`;
}

function isPercentMetric(key: string): boolean {
  return (
    key.includes("Margin") ||
    key.includes("Yield") ||
    key === "roeTTM" ||
    key === "roaTTM"
  );
}

function hourLabel(hour: string, t: (key: string) => string): string {
  if (hour === "bmo") return t("hourBmo");
  if (hour === "amc") return t("hourAmc");
  if (hour === "dmh") return t("hourDmh");
  return hour || "-";
}

export function EarningsPanel({
  surprises,
  upcoming,
  recent,
  metrics,
  degraded,
  loading,
}: {
  surprises: EarningsSurprise[];
  upcoming: EarningsCalendarRow[];
  recent: EarningsCalendarRow[];
  metrics: EarningsMetric[];
  degraded?: boolean;
  loading?: boolean;
}) {
  const t = useTranslations("earnings");
  const tCommon = useTranslations("common");

  if (loading) {
    return (
      <p className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
        {tCommon("loading")}
      </p>
    );
  }

  const empty =
    surprises.length === 0 &&
    upcoming.length === 0 &&
    recent.length === 0 &&
    metrics.length === 0;

  if (empty) {
    return (
      <p className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
        {degraded ? tCommon("degraded") : t("empty")}
      </p>
    );
  }

  const sectionTitle =
    "mb-2 text-[12px] font-semibold uppercase tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]";
  const th =
    "pb-2 pr-3 text-left text-[10px] font-semibold uppercase tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]";
  const td =
    "py-2.5 pr-3 text-[13px] leading-[1.3] tracking-[-0.08px]";

  return (
    <div className="space-y-5">
      <EarningsCharts
        surprises={surprises}
        recent={recent}
        labels={{
          chartEps: t("chartEps"),
          chartSurprise: t("chartSurprise"),
          chartRevenue: t("chartRevenue"),
          actual: t("epsActual"),
          estimate: t("epsEst"),
        }}
      />

      {metrics.length > 0 && (
        <section>
          <h3 className={sectionTitle}>{t("metrics")}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-3 sm:grid-cols-3 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.key} className="min-w-0 space-y-1">
                <div className="text-[10px] leading-[1.3] tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]">
                  {METRIC_LABEL_KEYS[m.key]
                    ? t(METRIC_LABEL_KEYS[m.key] as "metricPeTtm")
                    : t("metricOther")}
                </div>
                <div className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] tabular-nums text-[var(--aw-ink,var(--foreground))]">
                  {isPercentMetric(m.key) ? fmtPct(m.value) : fmtNum(m.value)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 className={sectionTitle}>{t("upcoming")}</h3>
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[560px] w-full">
              <thead>
                <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                  <th className={th}>{t("date")}</th>
                  <th className={th}>{t("period")}</th>
                  <th className={th}>{t("hour")}</th>
                  <th className={th}>{t("epsEst")}</th>
                  <th className={`${th} pr-0`}>{t("revEst")}</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
                  >
                    <td className={`${td} tabular-nums`}>{row.date}</td>
                    <td className={td}>
                      {row.year} Q{row.quarter}
                    </td>
                    <td className={td}>
                      {hourLabel(row.hour, (k) => t(k as "hourBmo"))}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {fmtNum(row.epsEstimate)}
                    </td>
                    <td className={`${td} pr-0 tabular-nums`}>
                      {row.revenueEstimate != null
                        ? fmtNum(row.revenueEstimate / 1e6, 1) + "M"
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {surprises.length > 0 && (
        <section>
          <h3 className={sectionTitle}>{t("surprises")}</h3>
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[560px] w-full">
              <thead>
                <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                  <th className={th}>{t("period")}</th>
                  <th className={th}>{t("epsActual")}</th>
                  <th className={th}>{t("epsEst")}</th>
                  <th className={th}>{t("surprise")}</th>
                  <th className={`${th} pr-0`}>{t("surprisePct")}</th>
                </tr>
              </thead>
              <tbody>
                {surprises.map((e, i) => {
                  const beat =
                    e.surprisePercent != null ? e.surprisePercent >= 0 : null;
                  return (
                    <tr
                      key={i}
                      className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
                    >
                      <td className={`${td} font-medium`}>
                        {e.period || `${e.year} Q${e.quarter}`}
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {fmtNum(e.actual)}
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {fmtNum(e.estimate)}
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {fmtNum(e.surprise ?? null)}
                      </td>
                      <td
                        className={`${td} pr-0 font-medium tabular-nums ${
                          beat === null
                            ? ""
                            : beat
                              ? "text-[var(--up)]"
                              : "text-[var(--down)]"
                        }`}
                      >
                        {e.surprisePercent != null
                          ? `${beat ? "+" : ""}${e.surprisePercent.toFixed(1)}%`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recent.length > 0 && surprises.length === 0 && (
        <section>
          <h3 className={sectionTitle}>{t("recent")}</h3>
          <ul>
            {recent.map((row, i) => (
              <li
                key={i}
                className="flex min-h-[40px] flex-wrap items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))] py-2.5 text-[13px] leading-[1.3] tracking-[-0.08px] last:border-0"
              >
                <span>
                  {row.date} · {row.year} Q{row.quarter}
                </span>
                <span className="tabular-nums text-[var(--aw-ink-muted-48,var(--muted))]">
                  EPS {fmtNum(row.epsActual)} / est {fmtNum(row.epsEstimate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {degraded && (
        <p className="text-[12px] leading-[1.3] tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]">
          {tCommon("degraded")}
        </p>
      )}
    </div>
  );
}
