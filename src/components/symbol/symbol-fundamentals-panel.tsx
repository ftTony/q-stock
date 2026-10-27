"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  EarningsPanel,
  type EarningsCalendarRow,
  type EarningsMetric,
  type EarningsSurprise,
} from "@/components/market/earnings-panel";
import { EarningsStatementSection } from "@/components/market/earnings-statement-section";
import {
  CompanyProfilePanel,
  OfficersPanel,
} from "@/components/market/company-panel";
import {
  SymbolFundamentalsNav,
  type FundamentalsSection,
} from "@/components/symbol/symbol-fundamentals-nav";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type { EarningsStatement } from "@/lib/earnings/types";

type Props = {
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsStatement: EarningsStatement | null;
  earningsBalance: EarningsStatement | null;
  earningsCashflow: EarningsStatement | null;
  earningsLoading: boolean;
  degraded: boolean;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
};

const METRIC_KEYS = new Set([
  "peNormalizedAnnual",
  "peTTM",
  "pbAnnual",
  "psTTM",
  "epsAnnual",
  "epsTTM",
  "roeTTM",
  "roaTTM",
  "grossMarginTTM",
  "operatingMarginTTM",
  "netProfitMarginTTM",
  "revenuePerShareTTM",
  "dividendYieldIndicatedAnnual",
  "52WeekHigh",
  "52WeekLow",
  "beta",
  "marketCapitalization",
]);

/** Company + earnings with left nav (财务 / 简况). */
export function SymbolFundamentalsPanel({
  earnings,
  earningsUpcoming,
  earningsRecent,
  earningsMetrics,
  earningsStatement,
  earningsBalance,
  earningsCashflow,
  earningsLoading,
  degraded,
  company,
  officers,
}: Props) {
  const t = useTranslations("symbol");
  const tEarn = useTranslations("earnings");

  const availability = useMemo(() => {
    const hasMetrics = earningsMetrics.some((m) => METRIC_KEYS.has(m.key));
    const hasIncome =
      earnings.some((s) => s.actual != null || s.estimate != null) ||
      Boolean(earningsStatement?.rows.length) ||
      earningsRecent.some(
        (r) => r.revenueActual != null || r.epsActual != null,
      );
    const hasCalendar =
      earningsUpcoming.length > 0 ||
      earnings.length > 0 ||
      earningsRecent.length > 0;
    return {
      metrics: hasMetrics,
      income: hasIncome,
      balance: Boolean(earningsBalance?.rows.length),
      cashflow: Boolean(earningsCashflow?.rows.length),
      calendar: hasCalendar,
      profile: Boolean(company),
      officers: officers.length > 0,
    };
  }, [
    company,
    earnings,
    earningsBalance,
    earningsCashflow,
    earningsMetrics,
    earningsRecent,
    earningsStatement,
    earningsUpcoming,
    officers.length,
  ]);

  const defaultSection = ((): FundamentalsSection => {
    if (availability.income) return "income";
    if (availability.metrics) return "metrics";
    if (availability.balance) return "balance";
    if (availability.cashflow) return "cashflow";
    if (availability.calendar) return "calendar";
    if (availability.profile) return "profile";
    if (availability.officers) return "officers";
    return "profile";
  })();

  const [active, setActive] = useState<FundamentalsSection>(defaultSection);

  const groups = useMemo(
    () => [
      {
        id: "finance",
        label: t("fundNavFinance"),
        items: [
          {
            id: "metrics" as const,
            label: t("fundNavMetrics"),
            available: availability.metrics || earningsLoading,
          },
          {
            id: "income" as const,
            label: t("fundNavIncome"),
            available: availability.income || earningsLoading,
          },
          {
            id: "balance" as const,
            label: t("fundNavBalance"),
            available: true,
          },
          {
            id: "cashflow" as const,
            label: t("fundNavCashflow"),
            available: true,
          },
          {
            id: "calendar" as const,
            label: t("fundNavCalendar"),
            available: availability.calendar || earningsLoading,
          },
        ],
      },
      {
        id: "overview",
        label: t("fundNavOverview"),
        items: [
          {
            id: "profile" as const,
            label: t("fundNavProfile"),
            available: availability.profile || !earningsLoading,
          },
          {
            id: "officers" as const,
            label: t("fundNavOfficers"),
            available: availability.officers,
          },
        ],
      },
    ],
    [availability, earningsLoading, t],
  );

  const resolvedActive = groups.some((g) =>
    g.items.some((i) => i.id === active && i.available),
  )
    ? active
    : defaultSection;

  const statementLabels = {
    statementTitle:
      resolvedActive === "balance"
        ? t("fundNavBalance")
        : resolvedActive === "cashflow"
          ? t("fundNavCashflow")
          : tEarn("statementTitle"),
    showYoy: tEarn("showYoy"),
    hideYoy: tEarn("hideYoy"),
    collapseChart: tEarn("collapseChart"),
    expandChart: tEarn("expandChart"),
    currency: tEarn("currencyNote"),
    yoy: tEarn("yoy"),
    rowRevenue: tEarn("rowRevenue"),
    rowEps: tEarn("rowEps"),
    rowGrossMargin: tEarn("rowGrossMargin"),
    rowOpMargin: tEarn("rowOpMargin"),
    rowNetMargin: tEarn("rowNetMargin"),
    rowRoe: tEarn("rowRoe"),
  };

  return (
    <div className="grid min-h-full grid-cols-1 gap-4 sm:grid-cols-[148px_1px_minmax(0,1fr)] sm:gap-0">
      <SymbolFundamentalsNav
        groups={groups}
        active={resolvedActive}
        onSelect={setActive}
      />
      <div
        className="hidden bg-[var(--aw-hairline,var(--border))] sm:block"
        aria-hidden
      />
      <div className="flex min-h-full min-w-0 flex-col sm:pl-5">
        {resolvedActive === "profile" ? (
          <CompanyProfilePanel profile={company} />
        ) : null}
        {resolvedActive === "officers" ? (
          officers.length > 0 ? (
            <OfficersPanel officers={officers} title={t("officers")} />
          ) : (
            <EmptyStateBlock art="statement" label={t("fundNavEmpty")} />
          )
        ) : null}
        {resolvedActive === "balance" ? (
          earningsBalance ? (
            <EarningsStatementSection
              statement={earningsBalance}
              labels={statementLabels}
            />
          ) : earningsLoading ? (
            <EmptyStateBlock art="statement" label={tEarn("empty")} />
          ) : (
            <EmptyStateBlock art="statement" label={t("fundNavNeedBroker")} />
          )
        ) : null}
        {resolvedActive === "cashflow" ? (
          earningsCashflow ? (
            <EarningsStatementSection
              statement={earningsCashflow}
              labels={statementLabels}
            />
          ) : earningsLoading ? (
            <EmptyStateBlock art="statement" label={tEarn("empty")} />
          ) : (
            <EmptyStateBlock art="statement" label={t("fundNavNeedBroker")} />
          )
        ) : null}
        {resolvedActive === "metrics" ||
        resolvedActive === "income" ||
        resolvedActive === "calendar" ? (
          <EarningsPanel
            surprises={earnings}
            upcoming={earningsUpcoming}
            recent={earningsRecent}
            metrics={earningsMetrics}
            statement={earningsStatement}
            degraded={degraded}
            loading={earningsLoading}
            view={resolvedActive}
          />
        ) : null}
      </div>
    </div>
  );
}
