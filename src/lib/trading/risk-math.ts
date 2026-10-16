/** Pure risk math for paper-order preview (no I/O). */

export type OrderRiskInput = {
  equity: number;
  qty: number;
  entry: number;
  /** Optional invalidation / stop price for risk amount. */
  stop?: number | null;
};

export type OrderRiskSummary = {
  notional: number;
  positionPct: number | null;
  riskAmount: number | null;
  riskPct: number | null;
  hasStop: boolean;
};

export function summarizeOrderRisk(input: OrderRiskInput): OrderRiskSummary {
  const { equity, qty, entry, stop } = input;
  const notional =
    qty > 0 && entry > 0 && Number.isFinite(qty * entry) ? qty * entry : 0;
  const positionPct =
    equity > 0 && notional > 0 ? (notional / equity) * 100 : null;

  let riskAmount: number | null = null;
  let hasStop = false;
  if (
    stop != null &&
    stop > 0 &&
    entry > 0 &&
    qty > 0 &&
    Number.isFinite(stop)
  ) {
    hasStop = true;
    riskAmount = Math.abs(entry - stop) * qty;
  }
  const riskPct =
    equity > 0 && riskAmount != null ? (riskAmount / equity) * 100 : null;

  return { notional, positionPct, riskAmount, riskPct, hasStop };
}

export const DEFAULT_RISK_SETTINGS = {
  maxPositionPctPerSymbol: 20,
  maxGrossExposurePct: 80,
  maxDailyLossPct: 5,
  maxOrderNotionalPct: null as number | null,
  softOnly: true,
  requireEmotionCheck: false,
};

export function softWarnPositionPct(
  positionPct: number | null,
  maxPct: number,
): boolean {
  return positionPct != null && positionPct > maxPct;
}
