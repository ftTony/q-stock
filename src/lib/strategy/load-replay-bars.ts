import { getDailyCandles } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import type { ReplayBar } from "@/lib/strategy/replay-engine";
import type { AssetType } from "@/lib/types";

export const REPLAY_MAX_BARS = 800;

export async function loadReplayBars(opts: {
  userId: string;
  symbol: string;
  assetType: AssetType;
  rangeFrom: Date;
  rangeTo: Date;
  maxBars?: number;
}): Promise<ReplayBar[]> {
  const maxBars = opts.maxBars ?? REPLAY_MAX_BARS;
  const fromSec = Math.floor(opts.rangeFrom.getTime() / 1000);
  const toSec = Math.floor(opts.rangeTo.getTime() / 1000);
  const candles = await withUserMarket(opts.userId, () =>
    getDailyCandles(opts.symbol, opts.assetType, fromSec, toSec),
  );
  const sliced = candles.slice(-maxBars);
  if (sliced.length < 30) {
    throw new Error("Not enough daily bars for replay (need ≥30)");
  }
  return sliced.map((c) => ({
    t: c.time * (c.time < 1e12 ? 1000 : 1),
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
    v: c.volume,
  }));
}

/** Downsample equity points for charts / share payloads (1GB host). */
export function downsampleEquity<T>(points: T[], maxPoints = 120): T[] {
  if (points.length <= maxPoints) return points;
  const out: T[] = [];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.round(i * step)]!);
  }
  return out;
}
