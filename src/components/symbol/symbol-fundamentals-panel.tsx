"use client";

import { useTranslations } from "next-intl";
import {
  EarningsPanel,
  type EarningsCalendarRow,
  type EarningsMetric,
  type EarningsSurprise,
} from "@/components/market/earnings-panel";
import {
  CompanyProfilePanel,
  OfficersPanel,
} from "@/components/market/company-panel";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";

type Props = {
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsLoading: boolean;
  degraded: boolean;
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
};

/** Earnings + company profile (merged「基本面」tab). */
export function SymbolFundamentalsPanel({
  earnings,
  earningsUpcoming,
  earningsRecent,
  earningsMetrics,
  earningsLoading,
  degraded,
  company,
  officers,
}: Props) {
  const t = useTranslations("symbol");

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
          {t("profile")}
        </h3>
        <CompanyProfilePanel profile={company} />
        {officers.length > 0 ? (
          <div className="border-t border-[var(--aw-hairline,var(--border))] pt-5">
            <OfficersPanel officers={officers} title={t("officers")} />
          </div>
        ) : null}
      </section>
      <section className="space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-6">
        <h3 className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
          {t("earnings")}
        </h3>
        <EarningsPanel
          surprises={earnings}
          upcoming={earningsUpcoming}
          recent={earningsRecent}
          metrics={earningsMetrics}
          degraded={degraded}
          loading={earningsLoading}
        />
      </section>
    </div>
  );
}
