"use client";

import { formatNumber } from "@/lib/format-number";

/**
 * Shared tokens for the option-strategy drawer.
 * Sections use one hairline divider — no tinted cards / boxed disclosures.
 */
export const FIELD_CLS = "qt-input h-8 px-2 text-[12px] tabular-nums";
export const QT_TRIGGER = "h-7 rounded-none px-2 text-[12px]";
export const SECTION_CLS =
  "border-t border-[var(--aw-hairline,var(--border))] pt-3 mt-1";

/** Sharp strategy chip (App 直角 — never rounded-full). */
export const CHIP_CLS =
  "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[12px] transition-colors";
export const CHIP_ON =
  "border-[var(--brand)]/35 bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]";
export const CHIP_OFF =
  "border-transparent text-[var(--muted)] hover:border-[var(--aw-hairline,var(--border))] hover:text-[var(--foreground)]";

/** Annual risk-free rate used by the quote greeks and the calculator default. */
export const DEFAULT_RATE_PCT = 4.2158;

/** Signed money, ∞ for an unbounded wing. */
export function fmtMoney(v: number | null): string {
  if (v == null) return "∞";
  const abs = Math.abs(v);
  const body = formatNumber(abs, {
    minimumFractionDigits: abs < 100 ? 2 : 0,
    maximumFractionDigits: abs < 100 ? 2 : 0,
  });
  return v <= 0 ? `-$${body}` : `$${body}`;
}

export function fmtNum(v: number | null, digits = 4): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return formatNumber(v, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

export function ymdToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whole days from `a` to `b`, both `YYYY-MM-DD`. */
export function daysBetween(a: string, b: string): number {
  const pa = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a);
  const pb = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b);
  if (!pa || !pb) return 0;
  const ta = Date.UTC(+pa[1]!, +pa[2]! - 1, +pa[3]!);
  const tb = Date.UTC(+pb[1]!, +pb[2]! - 1, +pb[3]!);
  return Math.round((tb - ta) / 86_400_000);
}
