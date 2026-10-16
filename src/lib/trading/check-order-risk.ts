import type { PaperRiskSettingsDto } from "@/lib/trading/paper-risk-settings";

export type RiskCheckInput = {
  settings: PaperRiskSettingsDto;
  /** Cash + mark-to-market positions before this order. */
  equity: number;
  /** Current gross long notional (all symbols). */
  grossNotional: number;
  /** Current notional for the order symbol. */
  symbolNotional: number;
  /** Additional buy notional of this order (0 for sells). */
  orderNotional: number;
  /** Day P/L % vs dayStartEquity; null if unknown. */
  dayPnlPct: number | null;
  side: "buy" | "sell";
  emotionTagCount: number;
};

export type RiskCheckResult =
  | { ok: true; softWarnings: string[] }
  | { ok: false; code: string; message: string; softWarnings: string[] };

/**
 * Account-level paper risk gates. Sells / reduce always pass size caps.
 * softOnly → violations become softWarnings and ok stays true.
 */
export function checkOrderRisk(input: RiskCheckInput): RiskCheckResult {
  const softWarnings: string[] = [];
  const { settings, side } = input;

  if (settings.requireEmotionCheck && input.emotionTagCount === 0) {
    const msg = "Emotion self-check required before submit";
    if (settings.softOnly) softWarnings.push(msg);
    else
      return {
        ok: false,
        code: "RISK_EMOTION",
        message: msg,
        softWarnings,
      };
  }

  if (side !== "buy") {
    return { ok: true, softWarnings };
  }

  if (
    input.dayPnlPct != null &&
    input.dayPnlPct <= -Math.abs(settings.maxDailyLossPct)
  ) {
    const msg = "Daily loss circuit tripped — new buys paused";
    if (settings.softOnly) softWarnings.push(msg);
    else
      return {
        ok: false,
        code: "RISK_DAILY_LOSS",
        message: msg,
        softWarnings,
      };
  }

  const equity = input.equity > 0 ? input.equity : 0;
  if (equity <= 0) return { ok: true, softWarnings };

  const nextSymbol = input.symbolNotional + input.orderNotional;
  const symbolPct = (nextSymbol / equity) * 100;
  if (symbolPct > settings.maxPositionPctPerSymbol + 1e-6) {
    const msg = `Single-name cap ${settings.maxPositionPctPerSymbol}%`;
    if (settings.softOnly) softWarnings.push(msg);
    else
      return {
        ok: false,
        code: "RISK_SYMBOL_CAP",
        message: msg,
        softWarnings,
      };
  }

  const nextGross = input.grossNotional + input.orderNotional;
  const grossPct = (nextGross / equity) * 100;
  if (grossPct > settings.maxGrossExposurePct + 1e-6) {
    const msg = `Gross exposure cap ${settings.maxGrossExposurePct}%`;
    if (settings.softOnly) softWarnings.push(msg);
    else
      return {
        ok: false,
        code: "RISK_EXPOSURE",
        message: msg,
        softWarnings,
      };
  }

  if (
    settings.maxOrderNotionalPct != null &&
    (input.orderNotional / equity) * 100 >
      settings.maxOrderNotionalPct + 1e-6
  ) {
    const msg = `Order size cap ${settings.maxOrderNotionalPct}% of equity`;
    softWarnings.push(msg);
    if (!settings.softOnly) {
      return {
        ok: false,
        code: "RISK_ORDER_SIZE",
        message: msg,
        softWarnings,
      };
    }
  }

  return { ok: true, softWarnings };
}
