import { describe, expect, it } from "vitest";
import {
  runReplay,
  type ReplayAssumptions,
  type ReplayBar,
} from "@/lib/strategy/replay-engine";

const baseAssumptions: ReplayAssumptions = {
  fill: "signal_close",
  slipBps: 0,
  initialCash: 10_000,
};

function barsFromCloses(closes: number[]): ReplayBar[] {
  const day = 86_400_000;
  const t0 = Date.UTC(2020, 0, 1);
  return closes.map((c, i) => ({
    t: t0 + i * day,
    o: c,
    h: c,
    l: c,
    c,
    v: 1_000,
  }));
}

describe("runReplay", () => {
  it("is deterministic for the same bars and rules", () => {
    const bars = barsFromCloses([
      100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 109, 108, 107, 106,
      105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90,
    ]);
    const rules = {
      entry: [{ type: "ma_cross", fast: 3, slow: 5, direction: "up" }],
      exit: [{ type: "ma_cross", fast: 3, slow: 5, direction: "down" }],
      sizing: { mode: "fixedNotional", notional: 2000 },
    };
    const a = runReplay(bars, rules, baseAssumptions);
    const b = runReplay(bars, rules, baseAssumptions);
    expect(a).toEqual(b);
    expect(a.equityCurve.length).toBe(bars.length - 1);
  });

  it("buys on N-day high breakout and exits on stop_pct", () => {
    // lookback 3: at index 4, prior highs are 10 → breakout at 12
    // then drop to trigger 10% stop from entry ~12
    const closes = [
      10, 10, 10, 10, 12, 12, 12, 11, 10.5, 10.2, 10, 9.5, 9, 8.5, 8, 8, 8, 8,
      8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    ];
    const bars = barsFromCloses(closes);
    const rules = {
      entry: [{ type: "break_high", lookback: 3 }],
      exit: [{ type: "stop_pct", pct: 10 }],
      sizing: { mode: "fixedQty", qty: 10 },
    };
    const result = runReplay(bars, rules, baseAssumptions);
    expect(result.tradeCount).toBeGreaterThanOrEqual(1);
    const buy = result.trades.find((t) => t.side === "buy");
    const sell = result.trades.find((t) => t.side === "sell");
    expect(buy).toBeDefined();
    expect(sell).toBeDefined();
    expect(buy!.barIndex).toBe(4);
    expect(sell!.price).toBeLessThan(buy!.price);
    expect(result.maxDrawdownPct).toBeGreaterThanOrEqual(0);
  });

  it("exits after hold_bars from entry", () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + (i < 5 ? i : 5));
    // Force breakout entry early, then time exit
    closes[4] = 120;
    for (let i = 5; i < 40; i++) closes[i] = 120;
    const bars = barsFromCloses(closes);
    const rules = {
      entry: [{ type: "break_high", lookback: 3 }],
      exit: [{ type: "hold_bars", bars: 3 }],
      sizing: { mode: "fixedQty", qty: 5 },
    };
    const result = runReplay(bars, rules, baseAssumptions);
    const buy = result.trades.find((t) => t.side === "buy");
    const sell = result.trades.find((t) => t.side === "sell");
    expect(buy).toBeDefined();
    expect(sell).toBeDefined();
    expect(sell!.barIndex - buy!.barIndex).toBe(3);
  });

  it("applies slipBps so buys cost more than mark close", () => {
    const closes = Array.from({ length: 35 }, () => 100);
    closes[5] = 110; // breakout vs flat history
    for (let i = 0; i < 5; i++) closes[i] = 100;
    const bars = barsFromCloses(closes);
    const rules = {
      entry: [{ type: "break_high", lookback: 3 }],
      exit: [{ type: "hold_bars", bars: 2 }],
      sizing: { mode: "fixedQty", qty: 10 },
    };
    const noSlip = runReplay(bars, rules, { ...baseAssumptions, slipBps: 0 });
    const withSlip = runReplay(bars, rules, {
      ...baseAssumptions,
      slipBps: 50,
    });
    const buy0 = noSlip.trades.find((t) => t.side === "buy")!;
    const buy1 = withSlip.trades.find((t) => t.side === "buy")!;
    expect(buy1.price).toBeGreaterThan(buy0.price);
  });

  it("reports buy-and-hold alongside strategy equity", () => {
    const closes = Array.from({ length: 40 }, (_, i) => 50 + i);
    const bars = barsFromCloses(closes);
    // lookback longer than series → never enter; cash flat vs rising B&H
    const rules = {
      entry: [{ type: "break_high", lookback: 50 }],
      exit: [{ type: "hold_bars", bars: 1 }],
      sizing: { mode: "fixedNotional", notional: 1000 },
    };
    const result = runReplay(bars, rules, baseAssumptions);
    expect(result.tradeCount).toBe(0);
    expect(result.finalEquity).toBe(baseAssumptions.initialCash);
    expect(result.buyHoldReturnPct).toBeGreaterThan(0);
    const last = result.equityCurve[result.equityCurve.length - 1]!;
    expect(last.buyHold).toBeGreaterThan(last.equity);
  });

  it("exits on price_level invalidation", () => {
    const closes = [
      100, 100, 100, 100, 115, 114, 113, 112, 111, 100, 99, 98, 97, 96, 95, 94,
      93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79,
    ];
    const bars = barsFromCloses(closes);
    const rules = {
      entry: [{ type: "break_high", lookback: 3 }],
      exit: [{ type: "price_level", op: "lte", price: 100 }],
      sizing: { mode: "fixedQty", qty: 10 },
    };
    const result = runReplay(bars, rules, baseAssumptions);
    const sell = result.trades.find((t) => t.side === "sell");
    expect(sell).toBeDefined();
    expect(sell!.price).toBeLessThanOrEqual(100);
  });
});
