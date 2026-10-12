export type PositionSide = "long" | "short";
export type PositionRiskMode = "percent" | "amount";

export type PositionInput = {
  equity: number;
  riskMode: PositionRiskMode;
  riskPercent: number;
  riskAmount: number;
  entry: number;
  stop: number;
  side: PositionSide;
  multiplier: number;
};

export type PositionResult =
  | {
      ok: true;
      riskBudget: number;
      perUnitRisk: number;
      qty: number;
      notional: number;
      riskUsed: number;
      riskPctOfEquity: number;
      positionPctOfEquity: number;
    }
  | { ok: false; error: "invalid" | "stop_side" | "zero_risk" | "zero_qty" };

export function calcPosition(input: PositionInput): PositionResult {
  const {
    equity,
    riskMode,
    riskPercent,
    riskAmount,
    entry,
    stop,
    side,
    multiplier,
  } = input;

  if (
    !(equity > 0) ||
    !(entry > 0) ||
    !(stop > 0) ||
    !(multiplier >= 1) ||
    (riskMode === "percent" && !(riskPercent > 0 && riskPercent <= 10)) ||
    (riskMode === "amount" && !(riskAmount > 0 && riskAmount <= equity))
  ) {
    return { ok: false, error: "invalid" };
  }

  if (side === "long" && stop >= entry) return { ok: false, error: "stop_side" };
  if (side === "short" && stop <= entry) return { ok: false, error: "stop_side" };

  const riskBudget =
    riskMode === "percent" ? equity * (riskPercent / 100) : riskAmount;
  const perUnitRisk = Math.abs(entry - stop) * multiplier;
  if (!(perUnitRisk > 0)) return { ok: false, error: "zero_risk" };

  const qty = Math.floor(riskBudget / perUnitRisk);
  if (qty <= 0) return { ok: false, error: "zero_qty" };

  const notional = qty * entry * multiplier;
  const riskUsed = qty * perUnitRisk;
  return {
    ok: true,
    riskBudget,
    perUnitRisk,
    qty,
    notional,
    riskUsed,
    riskPctOfEquity: (riskUsed / equity) * 100,
    positionPctOfEquity: (notional / equity) * 100,
  };
}

export const POSITION_EXAMPLE: PositionInput = {
  equity: 100_000,
  riskMode: "percent",
  riskPercent: 1,
  riskAmount: 1000,
  entry: 100,
  stop: 95,
  side: "long",
  multiplier: 1,
};
