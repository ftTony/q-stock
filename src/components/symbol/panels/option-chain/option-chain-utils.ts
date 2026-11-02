import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import {
  isBeforeUsRegularClose,
  usTradeDate,
} from "@/lib/market/session";

export type SideFilter = "all" | "call" | "put";
export type MoneyFilter = "all" | "itm" | "otm";

export type StrikeRow = {
  strike: number;
  call?: OptionRow;
  put?: OptionRow;
};

/**
 * Whether a call/put at `strike` matches the moneyness filter.
 * Call ITM: K < spot; Put ITM: K > spot. ATM (K === spot) is neither.
 */
export function sideMatchesMoney(
  kind: "call" | "put",
  strike: number,
  spot: number,
  money: MoneyFilter,
): boolean {
  if (money === "all" || !(spot > 0)) return true;
  const callItm = strike < spot;
  const putItm = strike > spot;
  if (kind === "call") return money === "itm" ? callItm : !callItm;
  return money === "itm" ? putItm : !putItm;
}

export type Greeks = {
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  pop: number | null;
  breakeven: number | null;
  /** Black-Scholes theoretical (fair) value — used as the mark price. */
  theo: number | null;
  /** Seller's annualised return on strike, already in percent units. */
  sellerReturn: number | null;
};

const RISK_FREE = 0.04;

function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return s * y;
}

function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Black-Scholes greeks + win probability + breakeven for one option row. */
export function bsGreeks(
  spot: number,
  strike: number,
  iv: number | null | undefined,
  daysToExp: number,
  isCall: boolean,
  last: number,
): Greeks {
  const dte = Math.max(daysToExp, 1);
  // Seller collects the premium against the strike they may be assigned at.
  const sellerReturn =
    last > 0 && strike > 0 ? (last / strike) * (365 / dte) * 100 : null;
  const empty: Greeks = {
    delta: null,
    gamma: null,
    theta: null,
    pop: null,
    breakeven: null,
    theo: null,
    sellerReturn,
  };
  if (!(spot > 0) || iv == null || !(iv > 0)) return empty;
  const sigma = iv > 2 ? iv / 100 : iv; // accept decimal or percent
  if (!(sigma > 0)) return empty;
  const T = Math.max(daysToExp, 0.25) / 365;
  const sqT = Math.sqrt(T);
  const d1 =
    (Math.log(spot / strike) + (RISK_FREE + (sigma * sigma) / 2) * T) /
    (sigma * sqT);
  const d2 = d1 - sigma * sqT;
  const disc = Math.exp(-RISK_FREE * T);
  const nd1 = normPdf(d1);
  const delta = isCall ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = nd1 / (spot * sigma * sqT);
  const common = (-spot * nd1 * sigma) / (2 * sqT);
  const theta = isCall
    ? (common - RISK_FREE * strike * disc * normCdf(d2)) / 365
    : (common + RISK_FREE * strike * disc * normCdf(-d2)) / 365;
  const pop = isCall ? normCdf(d2) : normCdf(-d2);
  const breakeven = last > 0 ? (isCall ? strike + last : strike - last) : null;
  const theo = isCall
    ? spot * normCdf(d1) - strike * disc * normCdf(d2)
    : strike * disc * normCdf(-d2) - spot * normCdf(-d1);
  return {
    delta,
    gamma,
    theta,
    pop,
    breakeven,
    theo: theo > 0 ? theo : null,
    sellerReturn,
  };
}

export function mergeStrikes(
  calls: OptionRow[],
  puts: OptionRow[],
): StrikeRow[] {
  const map = new Map<number, StrikeRow>();
  for (const c of calls) {
    const prev = map.get(c.strike);
    map.set(c.strike, { strike: c.strike, call: c, put: prev?.put });
  }
  for (const p of puts) {
    const prev = map.get(p.strike);
    map.set(p.strike, { strike: p.strike, call: prev?.call, put: p });
  }
  return [...map.values()].sort((a, b) => a.strike - b.strike);
}

function ymdUtcMs(ymd: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function daysToExpiry(ymd: string): number {
  const exp = ymdUtcMs(ymd);
  if (exp == null) return 0;
  const today = new Date();
  const start = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(0, Math.round((exp - start) / 86_400_000));
}

/**
 * Chip label for an expiry. Uses America/New_York trade date: past days are
 * expired; expiry day before 16:00 ET still shows 1 day; after close → expired.
 */
export function expiryChipLabel(
  ymd: string,
  daysLabel: (n: number) => string,
  expiredLabel = "Expired",
  now = new Date(),
): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const md = `${String(mo).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

  const todayEt = usTradeDate(now);
  const expMs = ymdUtcMs(ymd);
  const todayMs = ymdUtcMs(todayEt);
  if (expMs == null || todayMs == null) return ymd;

  const days = Math.round((expMs - todayMs) / 86_400_000);
  if (days < 0) return `${md} (${expiredLabel})`;
  if (days === 0) {
    // 0DTE: still live until regular close.
    return isBeforeUsRegularClose(now)
      ? `${md} (${daysLabel(1)})`
      : `${md} (${expiredLabel})`;
  }
  return `${md} (${daysLabel(days)})`;
}
