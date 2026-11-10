"use client";

import { useState, type ReactNode } from "react";
import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { CalcResult } from "../option-calculator";
import { daysToExpiry } from "../option-chain-utils";
import { fmtNum } from "./drawer-ui";

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
    <div className="flex min-w-0 items-baseline justify-between gap-2 py-[3px]">
      <span className="shrink-0 text-[11px] leading-[16px] text-[var(--muted)]">
        {label}
      </span>
      <span
        className={`truncate text-right text-[12px] leading-[16px] tabular-nums ${
          tone === "up"
            ? "font-medium text-[var(--up)]"
            : tone === "down"
              ? "font-medium text-[var(--down)]"
              : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 text-[var(--muted)] transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path
        d="M2.5 4.25 L6 7.75 L9.5 4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Contract quote: price hero + compact preview; detail grid collapses
 * behind a centered chevron (same pattern as symbol quote stats).
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
  book,
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
  /** Depth strip — only shown when details are expanded. */
  book?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const f2 = (v: number | null | undefined) =>
    v != null && v > 0
      ? formatNumber(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";
  const days = daysToExpiry(expiry);
  const chg = row?.chgPct ?? null;
  const last = row?.last != null && row.last > 0 ? row.last : null;
  const mid = premium;
  const display = mid ?? last;
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
  const chgTone =
    chg == null ? null : chg >= 0 ? ("up" as const) : ("down" as const);

  const preview: [string, string, "up" | "down" | null][] = [
    [t("high"), f2(row?.high), null],
    [t("low"), f2(row?.low), null],
    [t("volLbl"), row?.volume ? formatNumber(row.volume) : "—", null],
    [
      t("dteLbl"),
      days > 0 ? `${days} ${t("daysUnit")}` : t("expired"),
      null,
    ],
  ];

  const detail: [string, string, "up" | "down" | null][] = [
    [t("open"), f2(row?.open), null],
    [t("prevClose"), f2(row?.prevClose), null],
    [t("oiLbl"), row?.oi ? formatNumber(row.oi) : "—", null],
    [t("expiryDateLbl"), expiry, null],
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
    <div className="flex flex-col">
      {/* Hero */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] leading-[16px] text-[var(--muted)]">
            {symbol} {formatNumber(strike, { maximumFractionDigits: 2 })}{" "}
            {isCall ? t("callOpt") : t("putOpt")}
          </div>
          <div
            className={`mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums ${
              chgTone === "up"
                ? "text-[var(--up)]"
                : chgTone === "down"
                  ? "text-[var(--down)]"
                  : "text-[var(--foreground)]"
            }`}
          >
            {display != null
              ? formatNumber(display, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "—"}
          </div>
        </div>
        <div className="shrink-0 pb-0.5 text-right text-[12px] tabular-nums">
          {chg != null ? (
            <span
              className={
                chgTone === "up" ? "text-[var(--up)]" : "text-[var(--down)]"
              }
            >
              {chg >= 0 ? "▲ " : "▼ "}
              {chg >= 0 ? "+" : ""}
              {formatNumber(Math.abs(chg), { maximumFractionDigits: 2 })}%
            </span>
          ) : (
            <span className="text-[var(--muted)]">—</span>
          )}
          {last != null && mid != null ? (
            <div className="mt-0.5 text-[11px] text-[var(--muted)]">
              {t("latestPrice")}{" "}
              {formatNumber(last, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Always-on preview (4 keys) */}
      <div className="mt-2.5 grid grid-cols-2 gap-x-5 border-t border-[var(--aw-hairline,var(--border))] pt-2">
        {preview.map(([label, value, tone]) => (
          <QuoteCell key={label} label={label} value={value} tone={tone} />
        ))}
      </div>

      {/* Expanded detail + book */}
      {open ? (
        <div className="mt-0.5 space-y-2">
          <div className="grid grid-cols-2 gap-x-5">
            {detail.map(([label, value, tone]) => (
              <QuoteCell key={label} label={label} value={value} tone={tone} />
            ))}
          </div>
          {book ? (
            <div className="border-t border-[var(--aw-hairline,var(--border))] pt-2">
              {book}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className="mt-0.5 flex w-full items-center justify-center py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
        aria-expanded={open}
        aria-label={open ? t("quoteCollapse") : t("quoteExpand")}
        onClick={() => setOpen((v) => !v)}
      >
        <Chevron open={open} />
      </button>
    </div>
  );
}
