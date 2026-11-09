import { describe, expect, it } from "vitest";
import { checkOrderRisk } from "@/lib/trading/check-order-risk";
import type { PaperRiskSettingsDto } from "@/lib/trading/paper-risk-settings";
import { summarizeOrderRisk } from "@/lib/trading/risk-math";

const baseSettings: PaperRiskSettingsDto = {
  maxPositionPctPerSymbol: 20,
  maxGrossExposurePct: 80,
  maxDailyLossPct: 5,
  maxOrderNotionalPct: 10,
  softOnly: false,
  requireEmotionCheck: false,
};

describe("checkOrderRisk", () => {
  it("allows sells even when caps would fail", () => {
    const result = checkOrderRisk({
      settings: baseSettings,
      equity: 100_000,
      grossNotional: 90_000,
      symbolNotional: 25_000,
      orderNotional: 0,
      dayPnlPct: -10,
      side: "sell",
      emotionTagCount: 0,
    });
    expect(result.ok).toBe(true);
  });

  it("hard-blocks daily loss on buys", () => {
    const result = checkOrderRisk({
      settings: baseSettings,
      equity: 95_000,
      grossNotional: 10_000,
      symbolNotional: 0,
      orderNotional: 1_000,
      dayPnlPct: -5.1,
      side: "buy",
      emotionTagCount: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("RISK_DAILY_LOSS");
  });

  it("hard-blocks single-name cap", () => {
    const result = checkOrderRisk({
      settings: baseSettings,
      equity: 100_000,
      grossNotional: 10_000,
      symbolNotional: 18_000,
      orderNotional: 5_000,
      dayPnlPct: 0,
      side: "buy",
      emotionTagCount: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("RISK_SYMBOL_CAP");
  });

  it("softOnly turns caps into warnings", () => {
    const result = checkOrderRisk({
      settings: { ...baseSettings, softOnly: true },
      equity: 100_000,
      grossNotional: 10_000,
      symbolNotional: 18_000,
      orderNotional: 5_000,
      dayPnlPct: -6,
      side: "buy",
      emotionTagCount: 0,
    });
    expect(result.ok).toBe(true);
    expect(result.softWarnings.length).toBeGreaterThan(0);
  });

  it("requires emotion tags when configured", () => {
    const result = checkOrderRisk({
      settings: { ...baseSettings, requireEmotionCheck: true },
      equity: 100_000,
      grossNotional: 0,
      symbolNotional: 0,
      orderNotional: 1_000,
      dayPnlPct: 0,
      side: "buy",
      emotionTagCount: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("RISK_EMOTION");
  });
});

describe("summarizeOrderRisk", () => {
  it("computes position and stop risk", () => {
    const s = summarizeOrderRisk({
      equity: 100_000,
      qty: 100,
      entry: 50,
      stop: 45,
    });
    expect(s.notional).toBe(5_000);
    expect(s.positionPct).toBeCloseTo(5);
    expect(s.hasStop).toBe(true);
    expect(s.riskAmount).toBe(500);
    expect(s.riskPct).toBeCloseTo(0.5);
  });

  it("omits risk amount without stop", () => {
    const s = summarizeOrderRisk({
      equity: 100_000,
      qty: 10,
      entry: 100,
      stop: null,
    });
    expect(s.hasStop).toBe(false);
    expect(s.riskAmount).toBeNull();
  });
});
