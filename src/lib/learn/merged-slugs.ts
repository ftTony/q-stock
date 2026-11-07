/**
 * Learn articles merged on 2026-11-07: 16 thin pages (289–953 chars) collapsed
 * into 4 with real depth. Shared by `next.config.ts` (301s) and
 * `scripts/learn-prune.ts` (DB cleanup) so the two can never drift apart.
 */
export const MERGED_LEARN_SLUGS: Record<string, string> = {
  // Five candle patterns → one article
  "candle-engulfing": "candle-reversal-patterns",
  "candle-hammer-hanging-man": "candle-reversal-patterns",
  "candle-morning-evening-star": "candle-reversal-patterns",
  "candle-piercing-dark-cloud": "candle-reversal-patterns",
  "candle-tweezer-top-bottom": "candle-reversal-patterns",

  // MA + MACD → trend/momentum
  "indicator-moving-averages": "indicator-trend-momentum",
  "indicator-macd": "indicator-trend-momentum",

  // RSI + Bollinger + ATR → volatility toolkit
  "indicator-rsi": "indicator-volatility-toolkit",
  "indicator-bollinger-bands": "indicator-volatility-toolkit",
  "indicator-atr": "indicator-volatility-toolkit",

  // Six lab templates → one article
  "strategy-ma-cross": "strategy-lab-six-templates",
  "strategy-break-stop": "strategy-lab-six-templates",
  "strategy-dca-fixed": "strategy-lab-six-templates",
  "strategy-invalidation": "strategy-lab-six-templates",
  "strategy-time-exit": "strategy-lab-six-templates",
  "strategy-risk-sized": "strategy-lab-six-templates",
};

export const MERGED_LEARN_TARGETS = [
  ...new Set(Object.values(MERGED_LEARN_SLUGS)),
];
