"use client";

import { useTranslations } from "next-intl";
import { EarningsCharts } from "@/components/market/earnings-charts";

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
  return v.toLocaleString(undefined, {
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
    return <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>;
  }

  const empty =
    surprises.length === 0 &&
    upcoming.length === 0 &&
    recent.length === 0 &&
    metrics.length === 0;

  if (empty) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {degraded ? tCommon("degraded") : t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
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
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {t("metrics")}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.key}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3 py-2.5"
              >
                <div className="text-[11px] text-[var(--muted)]">
                  {METRIC_LABEL_KEYS[m.key]
                    ? t(METRIC_LABEL_KEYS[m.key] as "metricPeTtm")
                    : t("metricOther")}
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {isPercentMetric(m.key) ? fmtPct(m.value) : fmtNum(m.value)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {t("upcoming")}
          </h3>
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] text-[var(--muted)] uppercase">
                  <th className="pb-2 pr-3 font-semibold">{t("date")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("period")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("hour")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("epsEst")}</th>
                  <th className="pb-2 font-semibold">{t("revEst")}</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)]/70 last:border-0">
                    <td className="py-2.5 pr-3 tabular-nums">{row.date}</td>
                    <td className="py-2.5 pr-3">
                      {row.year} Q{row.quarter}
                    </td>
                    <td className="py-2.5 pr-3">{hourLabel(row.hour, (k) => t(k as "hourBmo"))}</td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {fmtNum(row.epsEstimate)}
                    </td>
                    <td className="py-2.5 tabular-nums">
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
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {t("surprises")}
          </h3>
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] text-[var(--muted)] uppercase">
                  <th className="pb-2 pr-3 font-semibold">{t("period")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("epsActual")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("epsEst")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("surprise")}</th>
                  <th className="pb-2 font-semibold">{t("surprisePct")}</th>
                </tr>
              </thead>
              <tbody>
                {surprises.map((e, i) => {
                  const beat =
                    e.surprisePercent != null ? e.surprisePercent >= 0 : null;
                  return (
                    <tr
                      key={i}
                      className="border-b border-[var(--border)]/70 last:border-0"
                    >
                      <td className="py-2.5 pr-3 font-medium">
                        {e.period || `${e.year} Q${e.quarter}`}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {fmtNum(e.actual)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {fmtNum(e.estimate)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {fmtNum(e.surprise ?? null)}
                      </td>
                      <td
                        className={`py-2.5 tabular-nums font-medium ${
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
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {t("recent")}
          </h3>
          <ul className="space-y-2 text-sm">
            {recent.map((row, i) => (
              <li
                key={i}
                className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)] py-2"
              >
                <span>
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

      {degraded && (
        <p className="text-xs text-[var(--muted)]">{tCommon("degraded")}</p>
      )}
    </div>
  );
}
