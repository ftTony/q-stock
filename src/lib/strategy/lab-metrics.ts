import {
  downsampleEquity,
} from "@/lib/strategy/load-replay-bars";
import type { ReplayResult } from "@/lib/strategy/replay-engine";

export type LabMetrics = {
  totalReturnPct: number;
  maxDrawdownPct: number;
  buyHoldReturnPct: number;
  winRate: number | null;
  tradeCount: number;
};

export function pickMetrics(result: ReplayResult): LabMetrics {
  return {
    totalReturnPct: result.totalReturnPct,
    maxDrawdownPct: result.maxDrawdownPct,
    buyHoldReturnPct: result.buyHoldReturnPct,
    winRate: result.winRate,
    tradeCount: result.tradeCount,
  };
}

export function slimEquity(result: ReplayResult) {
  return downsampleEquity(
    result.equityCurve.map((p) => ({
      t: p.t,
      equity: p.equity,
      buyHold: p.buyHold,
    })),
  );
}
