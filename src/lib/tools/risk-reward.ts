export type RiskRewardSide = "long" | "short";

export type RiskRewardInput = {
  side: RiskRewardSide;
  entry: number;
  stop: number;
  target: number;
  /** Optional assumed win rate 0–100 for expectancy sketch. */
  winRatePercent: number;
};

export type RiskRewardResult =
  | {
      ok: true;
      riskPerUnit: number;
      rewardPerUnit: number;
      /** Reward / risk (e.g. 2 → 1:2). */
      ratio: number;
      riskPct: number;
      rewardPct: number;
      /** Breakeven win rate % so expected value is zero. */
      breakevenWinRate: number;
      /** Expectancy per unit at assumed win rate (currency of prices). */
      expectancy: number | null;
    }
  | {
      ok: false;
      error: "invalid" | "stop_side" | "target_side" | "zero_risk";
    };

export function calcRiskReward(input: RiskRewardInput): RiskRewardResult {
  const { side, entry, stop, target, winRatePercent } = input;

  if (!(entry > 0) || !(stop > 0) || !(target > 0)) {
    return { ok: false, error: "invalid" };
  }
  if (
    !(winRatePercent >= 0) ||
    winRatePercent > 100 ||
    !Number.isFinite(winRatePercent)
  ) {
    return { ok: false, error: "invalid" };
  }

  if (side === "long") {
    if (!(stop < entry)) return { ok: false, error: "stop_side" };
    if (!(target > entry)) return { ok: false, error: "target_side" };
  } else {
    if (!(stop > entry)) return { ok: false, error: "stop_side" };
    if (!(target < entry)) return { ok: false, error: "target_side" };
  }

  const riskPerUnit = Math.abs(entry - stop);
  const rewardPerUnit = Math.abs(target - entry);
  if (!(riskPerUnit > 0)) return { ok: false, error: "zero_risk" };

  const ratio = rewardPerUnit / riskPerUnit;
  const riskPct = (riskPerUnit / entry) * 100;
  const rewardPct = (rewardPerUnit / entry) * 100;
  const breakevenWinRate = (1 / (1 + ratio)) * 100;

  const p = winRatePercent / 100;
  const expectancy = p * rewardPerUnit - (1 - p) * riskPerUnit;

  return {
    ok: true,
    riskPerUnit,
    rewardPerUnit,
    ratio,
    riskPct,
    rewardPct,
    breakevenWinRate,
    expectancy,
  };
}

export const RISK_REWARD_EXAMPLE: RiskRewardInput = {
  side: "long",
  entry: 100,
  stop: 95,
  target: 110,
  winRatePercent: 40,
};
