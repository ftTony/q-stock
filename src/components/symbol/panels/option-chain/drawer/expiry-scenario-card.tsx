"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";
import type { ExpiryScenarioRow } from "../option-strategy-utils";

type Props = {
  symbol: string;
  assetType: AssetType;
  maxLoss: number | null;
  maxProfit: number | null;
  breakevens: number[];
  netPremium: number;
  scenarios: ExpiryScenarioRow[];
  ivPct: number | null;
};

function pnlTone(v: number | null): string {
  if (v == null || v === 0) return "text-[var(--foreground)]";
  return v > 0 ? "text-[var(--up)]" : "text-[var(--down)]";
}

function fmtSignedMoney(v: number): string {
  const body = formatNumber(Math.abs(v), { maximumFractionDigits: 0 });
  if (v > 0) return `+$${body}`;
  if (v < 0) return `-$${body}`;
  return "$0";
}

function fmtPnl(v: number | null): string {
  if (v == null) return "—";
  return fmtSignedMoney(v);
}

/** Max-loss plain language + expiry ±σ scenario table + plan CTA. */
export function ExpiryScenarioCard({
  symbol,
  assetType,
  maxLoss,
  maxProfit,
  breakevens,
  netPremium,
  scenarios,
  ivPct,
}: Props) {
  const t = useTranslations("symbol.optTool");
  const moneyAbs = (v: number) =>
    `$${formatNumber(Math.abs(v), { maximumFractionDigits: 0 })}`;

  const beText =
    breakevens.length > 0
      ? breakevens
          .slice(0, 2)
          .map((b) => formatNumber(b, { maximumFractionDigits: 2 }))
          .join(" / ")
      : t("riskNoBreakeven");

  const labelOf = (key: string) => {
    switch (key) {
      case "m2":
        return t("scenarioM2");
      case "m1":
        return t("scenarioM1");
      case "spot":
        return t("scenarioSpot");
      case "p1":
        return t("scenarioP1");
      case "p2":
        return t("scenarioP2");
      default:
        return key;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="text-[12px] font-medium text-[var(--foreground)]">
        {t("riskTitle")}
      </div>

      <div className="space-y-1.5 border border-[var(--aw-hairline,var(--border))] px-3 py-2.5">
        <p className="text-[12px] leading-relaxed text-[var(--foreground)]">
          {maxLoss == null ? (
            <>
              {t("riskLossUnboundedLead")}
              <span className="font-semibold text-[var(--down)]">
                {t("riskLossUnboundedEm")}
              </span>
              {t("riskLossUnboundedTail")}
            </>
          ) : (
            <>
              {t("riskLossCappedLead")}
              <span className="font-semibold tabular-nums text-[var(--down)]">
                {moneyAbs(maxLoss)}
              </span>
              {t("riskLossCappedTail")}
            </>
          )}
        </p>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          <span>
            {t("riskBreakevenLead")}
            <span className="tabular-nums text-[var(--foreground)]">
              {beText}
            </span>
          </span>
          {netPremium !== 0 ? (
            <>
              <span> · {t("riskPremiumLead")}</span>
              <span
                className={`tabular-nums ${pnlTone(netPremium)}`}
              >
                {fmtSignedMoney(netPremium)}
              </span>
            </>
          ) : null}
          {maxProfit == null ? (
            <span> · {t("riskProfitUnbounded")}</span>
          ) : (
            <>
              <span> · {t("riskProfitCappedLead")}</span>
              <span className="tabular-nums text-[var(--up)]">
                {moneyAbs(maxProfit)}
              </span>
            </>
          )}
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-medium text-[var(--foreground)]">
            {t("scenarioTitle")}
          </span>
          <span className="text-[11px] text-[var(--muted)]">
            {ivPct != null && ivPct > 0
              ? t("scenarioIvHint", {
                  iv: formatNumber(ivPct, { maximumFractionDigits: 1 }),
                })
              : t("scenarioNoIv")}
          </span>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-[11px] text-[var(--muted)]">{t("scenarioEmpty")}</p>
        ) : (
          <div className="overflow-hidden border border-[var(--aw-hairline,var(--border))]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--aw-hairline,var(--border))] text-left text-[11px] text-[var(--muted)]">
                  <th className="px-2.5 py-1.5 font-medium">
                    {t("scenarioColLevel")}
                  </th>
                  <th className="px-2.5 py-1.5 text-right font-medium">
                    {t("scenarioColPrice")}
                  </th>
                  <th className="px-2.5 py-1.5 text-right font-medium">
                    {t("scenarioColPnl")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
                  >
                    <td className="px-2.5 py-1.5 text-[var(--muted)]">
                      {labelOf(row.key)}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums text-[var(--foreground)]">
                      {formatNumber(row.price, { maximumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`px-2.5 py-1.5 text-right font-medium tabular-nums ${pnlTone(row.pnl)}`}
                    >
                      {fmtPnl(row.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">
          {t("scenarioFootnote")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <Link
          href={`/symbol/${assetType}/${symbol}?focus=plan`}
          className="font-medium text-[var(--brand-text)] hover:underline"
        >
          {t("riskGoPlan")}
        </Link>
        <span className="text-[var(--muted)]">{t("riskPlanHint")}</span>
      </div>
    </div>
  );
}
