"use client";

import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { CalcResult } from "../option-calculator";
import { daysToExpiry } from "../option-chain-utils";
import { fmtNum } from "./drawer-ui";

/** One label/value cell of the contract quote grid. */
function QuoteCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | null;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-[3px]">
      <span className="shrink-0 text-[11px] text-[var(--muted)]">{label}</span>
      <span
        className={`truncate text-right text-[12px] font-medium tabular-nums ${
          tone === "up"
            ? "text-[var(--up)]"
            : tone === "down"
              ? "text-[var(--down)]"
              : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Contract quote detail (drawer top): prices, volume/OI, leverage,
 * intrinsic/time value, greeks and mark price for the target contract.
 */
export function ContractQuote({
  row,
  greeks,
  premium,
  spot,
  strike,
  isCall,
  expiry,
  symbol,
  t,
}: {
  row: OptionRow | undefined;
  greeks: CalcResult | null;
  premium: number | null;
  spot: number;
  strike: number;
  isCall: boolean;
  expiry: string;
  symbol: string;
  t: (k: string) => string;
}) {
  const f2 = (v: number | null | undefined) =>
    v != null && v > 0
      ? formatNumber(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";
  const days = daysToExpiry(expiry);
  const chg = row?.chgPct ?? null;
  const intrinsic =
    premium != null
      ? isCall
        ? Math.max(spot - strike, 0)
        : Math.max(strike - spot, 0)
      : null;
  const timeValue =
    premium != null && intrinsic != null
      ? Math.max(premium - intrinsic, 0)
      : null;
  const leverage =
    premium != null && premium > 0 && spot > 0 ? spot / premium : null;
  const chgTone = chg == null ? null : chg >= 0 ? "up" : "down";

  const cells: [string, string, "up" | "down" | null][] = [
    [t("high"), f2(row?.high), null],
    [t("low"), f2(row?.low), null],
    [t("open"), f2(row?.open), null],
    [t("prevClose"), f2(row?.prevClose), null],
    [t("volLbl"), row?.volume ? formatNumber(row.volume) : "—", null],
    [t("oiLbl"), row?.oi ? formatNumber(row.oi) : "—", null],
    [t("expiryDateLbl"), expiry, null],
    [
      t("dteLbl"),
      days > 0 ? `${days} ${t("daysUnit")}` : t("expired"),
      null,
    ],
    [t("strikeLbl"), formatNumber(strike, { maximumFractionDigits: 2 }), null],
    [
      t("chgLbl"),
      chg != null
        ? `${chg >= 0 ? "+" : ""}${formatNumber(chg, { maximumFractionDigits: 2 })}%`
        : "—",
      chgTone,
    ],
    [
      t("leverageLbl"),
      leverage != null
        ? `${formatNumber(leverage, { maximumFractionDigits: 2 })}x`
        : "—",
      null,
    ],
    [t("multiplierLbl"), "100", null],
    [t("intrinsicLbl"), f2(intrinsic), null],
    [t("timeValueLbl"), f2(timeValue), null],
    ["Delta", fmtNum(greeks?.delta ?? null), null],
    ["Gamma", fmtNum(greeks?.gamma ?? null), null],
    ["Vega", fmtNum(greeks?.vega ?? null), null],
    ["Rho", fmtNum(greeks?.rho ?? null), null],
    ["Theta", fmtNum(greeks?.theta ?? null), null],
    [t("optTypeLbl"), t("american"), null],
  ];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--foreground)]">
          {t("quoteTitle")}
        </span>
        <span className="text-[11px] text-[var(--muted)]">
          {symbol} {formatNumber(strike, { maximumFractionDigits: 2 })}{" "}
          {isCall ? t("callOpt") : t("putOpt")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        {cells.map(([label, value, tone]) => (
          <QuoteCell key={label} label={label} value={value} tone={tone} />
        ))}
      </div>
    </div>
  );
}
