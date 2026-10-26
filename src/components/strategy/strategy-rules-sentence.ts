import type { RuleClause, StrategyRules } from "@/lib/strategy/rules";

/** next-intl translator for strategies.* keys used in block sentences. */
type TFn = (key: string) => string;

/** Natural-language body for a rule clause (HTML-free segments). */
export function clauseSentenceParts(
  clause: RuleClause,
  t: TFn,
): Array<{ text: string; accent?: boolean }> {
  switch (clause.type) {
    case "ma_cross":
      return [
        { text: t("blockSentMa1") },
        { text: `MA${clause.fast}`, accent: true },
        {
          text:
            clause.direction === "up" ? t("ruleUp") : t("ruleDown"),
          accent: true,
        },
        { text: `MA${clause.slow}`, accent: true },
      ];
    case "break_high":
      return [
        { text: t("blockSentBreak1") },
        { text: String(clause.lookback), accent: true },
        { text: t("blockSentBreak2") },
      ];
    case "price_vs_ma":
      return [
        { text: t("blockSentPriceMa1") },
        { text: clause.op === "gt" ? ">" : "<", accent: true },
        { text: `MA${clause.period}`, accent: true },
      ];
    case "hold_bars":
      return [
        { text: t("blockSentHold1") },
        { text: String(clause.bars), accent: true },
        { text: t("blockSentHold2") },
      ];
    case "stop_pct":
      return [
        { text: t("blockSentStop1") },
        { text: `${clause.pct}%`, accent: true },
        { text: t("blockSentStop2") },
      ];
    case "take_profit_pct":
      return [
        { text: t("blockSentTake1") },
        { text: `${clause.pct}%`, accent: true },
        { text: t("blockSentTake2") },
      ];
    case "price_level":
      return [
        { text: t("blockSentLevel1") },
        { text: clause.op === "lte" ? "≤" : "≥", accent: true },
        { text: String(clause.price), accent: true },
      ];
  }
}

export function sizingSentenceParts(
  sizing: StrategyRules["sizing"],
  t: TFn,
): Array<{ text: string; accent?: boolean }> {
  if (sizing.mode === "fixedNotional") {
    return [
      { text: t("blockSentSizeNotional1") },
      { text: String(sizing.notional ?? 5000), accent: true },
      { text: t("blockSentSizeCap") },
      { text: `${sizing.maxPositionPct ?? 20}%`, accent: true },
    ];
  }
  if (sizing.mode === "riskPercent") {
    return [
      { text: t("blockSentSizeRisk1") },
      { text: `${sizing.riskPercent ?? 1}%`, accent: true },
      { text: t("blockSentSizeCap") },
      { text: `${sizing.maxPositionPct ?? 20}%`, accent: true },
    ];
  }
  return [
    { text: t("blockSentSizeQty1") },
    { text: String(sizing.qty ?? 10), accent: true },
    { text: t("blockSentSizeCap") },
    { text: `${sizing.maxPositionPct ?? 20}%`, accent: true },
  ];
}
