/**
 * 生成 /lab 页面示例回放的数字（src/lib/marketing/lab-sample.ts 的唯一样本来由）。
 *
 * 用法：
 *   npx tsx scripts/lab-sample-replay.ts                    # 默认沪深300 / MA10-20 / 风险2%
 *   OUT=/tmp/lab.json SYMBOL=000300.SH FROM=2023-08-01 TO=2026-10-31 \
 *     VARIANT=risk npx tsx scripts/lab-sample-replay.ts
 *
 * 改完区间或参数后，把输出的指标与 EQUITY 曲线同步到 lab-sample.ts，
 * 页面上「可复现」的承诺才成立。
 */
import { getDailyCandles } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { runReplay } from "@/lib/strategy/replay-engine";
import { DEFAULT_STRATEGY_RULES } from "@/lib/strategy/default-rules";

const ASSET = (process.env.ASSET ?? "cn") as "cn" | "hk" | "stock" | "crypto";
const SYMBOL = process.env.SYMBOL ?? "000300.SH";
const FROM = process.env.FROM ?? "2023-01-01";
const TO = process.env.TO ?? "2025-06-30";

async function main() {
  const fromSec = Math.floor(new Date(`${FROM}T00:00:00Z`).getTime() / 1000);
  const toSec = Math.floor(new Date(`${TO}T00:00:00Z`).getTime() / 1000);
  const candles = await withUserMarket(null, () =>
    getDailyCandles(SYMBOL, ASSET, fromSec, toSec),
  );
  console.log("bars:", candles.length, "first:", candles[0]?.time, "last:", candles.at(-1)?.time);
  if (candles.length < 30) throw new Error("not enough bars");

  const trimmed = candles.slice(-800);
  const bars = trimmed.map((c) => ({
    t: c.time * (c.time < 1e12 ? 1000 : 1),
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
    v: c.volume,
  }));

  const variant = process.env.VARIANT ?? "ma";
  const rules =
    variant === "risk"
      ? {
          version: 1 as const,
          market: ASSET,
          entry: [{ type: "ma_cross" as const, fast: 10, slow: 20, direction: "up" as const }],
          exit: [{ type: "ma_cross" as const, fast: 10, slow: 20, direction: "down" as const }],
          sizing: { mode: "riskPercent" as const, riskPercent: 2, maxPositionPct: 100 },
        }
      : variant === "breakout"
        ? {
            version: 1 as const,
            market: ASSET,
            entry: [{ type: "break_high" as const, lookback: 20 }],
            exit: [{ type: "stop_pct" as const, pct: 8 }],
            sizing: { mode: "riskPercent" as const, riskPercent: 2, maxPositionPct: 100 },
          }
        : {
            version: 1 as const,
            market: ASSET,
            entry: [{ type: "ma_cross" as const, fast: 10, slow: 20, direction: "up" as const }],
            exit: [{ type: "ma_cross" as const, fast: 10, slow: 20, direction: "down" as const }],
            sizing: { mode: "fixedNotional" as const, notional: 5000, maxPositionPct: 100 },
          };

  const res = runReplay(bars, rules, {
    fill: "signal_close",
    slipBps: 5,
    initialCash: 100000,
  });

  console.log(
    JSON.stringify(
      {
        symbol: SYMBOL,
        asset: ASSET,
        from: FROM,
        to: TO,
        bars: bars.length,
        firstDate: new Date(bars[0]!.t).toISOString().slice(0, 10),
        lastDate: new Date(bars.at(-1)!.t).toISOString().slice(0, 10),
        metrics: {
          totalReturnPct: res.totalReturnPct,
          maxDrawdownPct: res.maxDrawdownPct,
          buyHoldReturnPct: res.buyHoldReturnPct,
          winRate: res.winRate,
          tradeCount: res.tradeCount,
          sharpeRatio: res.sharpeRatio,
          calmarRatio: res.calmarRatio,
          avgWinLossRatio: res.avgWinLossRatio,
        },
        equity: res.equityCurve.length,
      },
      null,
      2,
    ),
  );

  const N = 48;
  const curve = res.equityCurve;
  const picks: number[] = [];
  for (let i = 0; i < N; i++) {
    picks.push(Math.round((i * (curve.length - 1)) / (N - 1)));
  }
  const pts = picks
    .map((idx) => curve[idx]!)
    .map((p) => ({
      d: new Date(p.t).toISOString().slice(0, 10),
      e: Math.round(p.equity),
      b: Math.round(p.buyHold),
    }));
  console.log("EQUITY:" + JSON.stringify(pts));
  if (process.env.OUT) {
    const fs = await import("node:fs");
    fs.writeFileSync(
      process.env.OUT,
      JSON.stringify({ symbol: SYMBOL, asset: ASSET, variant: process.env.VARIANT ?? "ma",
        from: new Date(bars[0]!.t).toISOString().slice(0, 10),
        to: new Date(bars.at(-1)!.t).toISOString().slice(0, 10),
        bars: bars.length,
        totalReturnPct: res.totalReturnPct, maxDrawdownPct: res.maxDrawdownPct,
        buyHoldReturnPct: res.buyHoldReturnPct, winRate: res.winRate, tradeCount: res.tradeCount,
        sharpeRatio: res.sharpeRatio, avgWinLossRatio: res.avgWinLossRatio, calmarRatio: res.calmarRatio, equity: pts }, null, 1),
    );
  }
}

main().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
