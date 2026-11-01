import { formatNumber } from "@/lib/format-number";

export function fmtPx(n: number | null | undefined) {
  if (n == null || !(n > 0)) return "—";
  return formatNumber(n, { maximumFractionDigits: 3 });
}

export function fmtIv(iv: number | null | undefined) {
  if (iv == null || !(iv > 0)) return null;
  const pct = iv > 2 ? iv : iv * 100;
  return formatNumber(pct, { maximumFractionDigits: 1 });
}

export function fmtGreek(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, { maximumFractionDigits: 4 });
}

export function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${formatNumber(n * 100, { maximumFractionDigits: 1 })}%`;
}

/** For values already expressed in percent units (e.g. annualised returns). */
export function fmtPctOf(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${formatNumber(n, { maximumFractionDigits: 1 })}%`;
}

export function fmtBreakeven(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, { maximumFractionDigits: 2 });
}

export function fmtCount(n: number | null | undefined) {
  if (n == null || !(n > 0)) return "—";
  return formatNumber(n, { maximumFractionDigits: 0 });
}

export function fmtMid(bid: number | null | undefined, ask: number | null | undefined) {
  if (bid == null || ask == null || !(bid > 0) || !(ask > 0)) return "—";
  return formatNumber((bid + ask) / 2, { maximumFractionDigits: 3 });
}

export function chgLabel(chg: number | null | undefined) {
  if (chg == null || !Number.isFinite(chg)) return "—";
  const sign = chg > 0 ? "+" : "";
  return `${sign}${formatNumber(chg, { maximumFractionDigits: 1 })}%`;
}

export function chgTone(chg: number | null | undefined) {
  if (chg == null || !Number.isFinite(chg) || chg === 0) return "";
  return chg > 0 ? "text-[var(--up)]" : "text-[var(--down)]";
}
