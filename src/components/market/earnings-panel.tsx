"use client";

import { useTranslations } from "next-intl";
import { EarningsCharts } from "@/components/market/earnings-charts";
import { formatNumber } from "@/lib/format-number";
import type { EarningsStatement } from "@/lib/earnings/types";

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

function fmtMetricValue(key: string, value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  if (isPercentMetric(key)) return fmtPct(value);
  // Finnhub marketCapitalization is in millions
  if (key === "marketCapitalization") {
    const abs = Math.abs(value) * 1e6;
    if (abs >= 1e12) return `${fmtNum((value * 1e6) / 1e12, 2)}T`;
    if (abs >= 1e9) return `${fmtNum((value * 1e6) / 1e9, 2)}B`;
    if (abs >= 1e6) return `${fmtNum(value, 1)}M`;
    return fmtNum(value * 1e6, 0);
  }
  return fmtNum(value);
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

export type EarningsPanelView = "all" | "metrics" | "income" | "calendar";

export function EarningsPanel({
  surprises,
  upcoming,
  recent,
  metrics,
  statement,
  degraded,
  loading,
  view = "all",
}: {
  surprises: EarningsSurprise[];
  upcoming: EarningsCalendarRow[];
  recent: EarningsCalendarRow[];
  metrics: EarningsMetric[];
  statement?: EarningsStatement | null;
  degraded?: boolean;
  loading?: boolean;
  view?: EarningsPanelView;
}) {
  const t = useTranslations("earnings");
  const tCommon = useTranslations("common");

  if (loading) {
    return <p className="aw-caption">{tCommon("loading")}</p>;
  }

  const knownMetrics = metrics.filter((m) => METRIC_LABEL_KEYS[m.key]);
  const showMetrics = view === "all" || view === "metrics";
  const showIncome = view === "all" || view === "income";
  const showCalendar = view === "all" || view === "calendar";

  const empty =
    surprises.length === 0 &&
    upcoming.length === 0 &&
    recent.length === 0 &&
    knownMetrics.length === 0 &&
    !statement;

  if (empty) {
    return (
      <p className="aw-caption">
        {degraded ? tCommon("degraded") : t("empty")}
      </p>
    );
  }

  if (view === "metrics" && knownMetrics.length === 0) {
    return <p className="aw-caption">{t("empty")}</p>;
  }

  const sectionTitle =
    "mb-2.5 text-[12px] font-semibold tracking-[-0.08px] text-[var(--muted)]";
  const th =
    "pb-2 text-[11px] font-medium tracking-[-0.08px] text-[var(--muted)]";
  const thNum = `${th} text-right`;
  const td =
    "py-2.5 text-[13px] leading-[1.35] tracking-[-0.08px] text-[var(--foreground)]";
  const tdNum = `${td} text-right tabular-nums`;

  return (
    <div className="space-y-6">
      {showIncome ? (
        <EarningsCharts
          surprises={surprises}
          recent={recent}
          statement={statement}
          labels={{
            chartEps: t("chartEps"),
            chartSurprise: t("chartSurprise"),
            actual: t("epsActual"),
            estimate: t("epsEst"),
            statementTitle: t("statementTitle"),
            showYoy: t("showYoy"),
            hideYoy: t("hideYoy"),
            collapseChart: t("collapseChart"),
            expandChart: t("expandChart"),
            currency: t("currencyNote"),
            yoy: t("yoy"),
            rowRevenue: t("rowRevenue"),
            rowEps: t("rowEps"),
            rowGrossMargin: t("rowGrossMargin"),
            rowOpMargin: t("rowOpMargin"),
            rowNetMargin: t("rowNetMargin"),
            rowRoe: t("rowRoe"),
          }}
        />
      ) : null}

      {showMetrics && knownMetrics.length > 0 && (
        <section>
          {view === "all" ? (
            <h3 className={sectionTitle}>{t("metrics")}</h3>
          ) : null}
          <div
            className={`grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-4 ${
              view === "all"
                ? "border-t border-[var(--aw-hairline,var(--border))] pt-3"
                : ""
            }`}
          >
            {knownMetrics.map((m) => (
              <div key={m.key} className="min-w-0 space-y-1">
                <div className="text-[11px] leading-[1.3] tracking-[-0.08px] text-[var(--muted)]">
                  {t(METRIC_LABEL_KEYS[m.key] as "metricPeTtm")}
                </div>
                <div className="truncate text-[15px] font-semibold leading-[1.25] tracking-[-0.2px] tabular-nums text-[var(--foreground)]">
                  {fmtMetricValue(m.key, m.value)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showCalendar && upcoming.length > 0 && (
        <section>
          <h3 className={sectionTitle}>{t("upcoming")}</h3>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[520px] table-fixed border-collapse">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[20%]" />
                <col className="w-[26%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                  <th className={`${th} text-left`}>{t("date")}</th>
                  <th className={`${th} text-left`}>{t("period")}</th>
                  <th className={`${th} text-left`}>{t("hour")}</th>
                  <th className={thNum}>{t("epsEst")}</th>
                  <th className={thNum}>{t("revEst")}</th>
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
                    <td className={tdNum}>{fmtNum(row.epsEstimate)}</td>
                    <td className={tdNum}>
                      {row.revenueEstimate != null
                        ? `${fmtNum(row.revenueEstimate / 1e6, 1)}M`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showCalendar && surprises.length > 0 && (
        <section>
          <h3 className={sectionTitle}>{t("surprises")}</h3>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[520px] table-fixed border-collapse">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                  <th className={`${th} text-left`}>{t("period")}</th>
                  <th className={thNum}>{t("epsActual")}</th>
                  <th className={thNum}>{t("epsEst")}</th>
                  <th className={thNum}>{t("surprise")}</th>
                  <th className={thNum}>{t("surprisePct")}</th>
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
                      <td className={tdNum}>{fmtNum(e.actual)}</td>
                      <td className={tdNum}>{fmtNum(e.estimate)}</td>
                      <td className={tdNum}>{fmtNum(e.surprise ?? null)}</td>
                      <td
                        className={`${tdNum} font-medium ${
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

      {showCalendar && recent.length > 0 && surprises.length === 0 && (
        <section>
          <h3 className={sectionTitle}>{t("recent")}</h3>
          <ul>
            {recent.map((row, i) => (
              <li
                key={i}
                className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-[var(--aw-hairline,var(--border))] py-2.5 text-[13px] leading-[1.35] tracking-[-0.08px] last:border-0"
              >
                <span className="font-medium text-[var(--foreground)]">
                  {row.date} · {row.year} Q{row.quarter}
                </span>
                <span className="tabular-nums text-[var(--muted)]">
                  EPS {fmtNum(row.epsActual)} / est {fmtNum(row.epsEstimate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {degraded && <p className="aw-caption">{tCommon("degraded")}</p>}
    </div>
  );
}
