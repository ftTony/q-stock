export type OptionsStrategy =
  | "long_call"
  | "long_put"
  | "short_call"
  | "short_put"
  | "covered_call";

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
      /** Contract PnL; null = theoretically unlimited. */
      maxLoss: number | null;
      maxGain: number | null;
      points: OptionsPayoffPoint[];
    }
  | { ok: false; error: "invalid" };

/** Per-share expiration PnL (before × multiplier). */
export function pnlPerShare(
  strategy: OptionsStrategy,
  underlying: number,
  strike: number,
  premium: number,
  spot: number,
) {
  const callIntrinsic = Math.max(underlying - strike, 0);
  const putIntrinsic = Math.max(strike - underlying, 0);
  switch (strategy) {
    case "long_call":
      return callIntrinsic - premium;
    case "long_put":
      return putIntrinsic - premium;
    case "short_call":
      return premium - callIntrinsic;
    case "short_put":
      return premium - putIntrinsic;
    case "covered_call":
      // Long 1 share @ spot + short 1 call.
      return underlying - spot + premium - callIntrinsic;
  }
}

function metrics(
  strategy: OptionsStrategy,
  spot: number,
  strike: number,
  premium: number,
  multiplier: number,
): { breakeven: number; maxLoss: number | null; maxGain: number | null } {
  switch (strategy) {
    case "long_call":
      return {
        breakeven: strike + premium,
        maxLoss: premium * multiplier,
        maxGain: null,
      };
    case "long_put":
      return {
        breakeven: strike - premium,
        maxLoss: premium * multiplier,
        maxGain: Math.max(0, strike - premium) * multiplier,
      };
    case "short_call":
      return {
        breakeven: strike + premium,
        maxLoss: null,
        maxGain: premium * multiplier,
      };
    case "short_put":
      return {
        breakeven: strike - premium,
        maxLoss: Math.max(0, strike - premium) * multiplier,
        maxGain: premium * multiplier,
      };
    case "covered_call":
      return {
        breakeven: spot - premium,
        maxLoss: Math.max(0, spot - premium) * multiplier,
        maxGain: (strike - spot + premium) * multiplier,
      };
  }
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

  const { breakeven, maxLoss, maxGain } = metrics(
    strategy,
    spot,
    strike,
    premium,
    multiplier,
  );

  const anchors = [spot, strike, Math.max(breakeven, 0.01)];
  if (strategy === "short_put" || strategy === "long_put") {
    anchors.push(0.01);
  }
  const lo = Math.max(0.01, Math.min(...anchors) * 0.5);
  const hi = Math.max(...anchors) * (strategy === "short_call" ? 1.75 : 1.5);
  const steps = 48;
  const points: OptionsPayoffPoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const underlying = lo + ((hi - lo) * i) / steps;
    const perShare = pnlPerShare(
      strategy,
      underlying,
      strike,
      premium,
      spot,
    );
    points.push({
      underlying,
      pnlPerShare: perShare,
      pnlContract: perShare * multiplier,
    });
  }

  return { ok: true, breakeven, maxLoss, maxGain, points };
}

export const OPTIONS_STRATEGIES: OptionsStrategy[] = [
  "long_call",
  "long_put",
  "short_call",
  "short_put",
  "covered_call",
];

export function isShortPremiumStrategy(strategy: OptionsStrategy) {
  return strategy === "short_call" || strategy === "short_put";
}

export const OPTIONS_EXAMPLE: OptionsPayoffInput = {
  strategy: "long_call",
  spot: 100,
  strike: 100,
  premium: 5,
  multiplier: 100,
};
