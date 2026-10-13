export type OptionsStrategy = "long_call" | "long_put";

export type OptionsPayoffInput = {
  strategy: OptionsStrategy;
  spot: number;
  strike: number;
  premium: number;
  multiplier: number;
};

export type OptionsPayoffPoint = {
  underlying: number;
  pnlPerShare: number;
  pnlContract: number;
};

export type OptionsPayoffResult =
  | {
      ok: true;
      breakeven: number;
      maxLoss: number;
      points: OptionsPayoffPoint[];
    }
  | { ok: false; error: "invalid" };

function pnlPerShare(
  strategy: OptionsStrategy,
  underlying: number,
  strike: number,
  premium: number,
) {
  if (strategy === "long_call") {
    return Math.max(underlying - strike, 0) - premium;
  }
  return Math.max(strike - underlying, 0) - premium;
}

export function calcOptionsPayoff(
  input: OptionsPayoffInput,
): OptionsPayoffResult {
  const { strategy, spot, strike, premium, multiplier } = input;

  if (
    !(spot > 0) ||
    !(strike > 0) ||
    !(premium >= 0) ||
    !(multiplier >= 1)
  ) {
    return { ok: false, error: "invalid" };
  }

  const breakeven =
    strategy === "long_call" ? strike + premium : strike - premium;
  const maxLoss = premium * multiplier;

  const lo = Math.max(
    0.01,
    Math.min(spot, strike, Math.max(breakeven, 0.01)) * 0.5,
  );
  const hi = Math.max(spot, strike, Math.abs(breakeven)) * 1.5;
  const steps = 48;
  const points: OptionsPayoffPoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const underlying = lo + ((hi - lo) * i) / steps;
    const perShare = pnlPerShare(strategy, underlying, strike, premium);
    points.push({
      underlying,
      pnlPerShare: perShare,
      pnlContract: perShare * multiplier,
    });
  }

  return { ok: true, breakeven, maxLoss, points };
}

export const OPTIONS_EXAMPLE: OptionsPayoffInput = {
  strategy: "long_call",
  spot: 100,
  strike: 100,
  premium: 5,
  multiplier: 100,
};
