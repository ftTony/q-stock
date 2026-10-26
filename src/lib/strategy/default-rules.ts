import type { StrategyRules } from "@/lib/strategy/rules";

/** Minimal long-only rules for "New strategy" drafts. */
export const DEFAULT_STRATEGY_RULES: StrategyRules = {
  version: 1,
  market: "stock",
  entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
  exit: [{ type: "ma_cross", fast: 10, slow: 20, direction: "down" }],
  sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
};
