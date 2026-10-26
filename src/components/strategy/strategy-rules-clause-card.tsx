"use client";

import type { RuleClause } from "@/lib/strategy/rules";

/** Factory for a new clause with safe defaults. */
export function defaultClause(type: RuleClause["type"]): RuleClause {
  switch (type) {
    case "ma_cross":
      return { type, fast: 10, slow: 20, direction: "up" };
    case "break_high":
      return { type, lookback: 20 };
    case "price_vs_ma":
      return { type, period: 20, op: "gt" };
    case "hold_bars":
      return { type, bars: 20 };
    case "stop_pct":
      return { type, pct: 5 };
    case "take_profit_pct":
      return { type, pct: 10 };
    case "price_level":
      return { type, op: "lte", price: 100 };
  }
}

/** @deprecated Inline clause row — use canvas block cards instead. */
export function StrategyRulesClauseCard() {
  return null;
}
