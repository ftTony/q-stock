import { computeIndicators } from "@/lib/indicators";
import { getDailyCandles } from "@/lib/market";
import type { AssetType, OhlcvBar } from "@/lib/types";

export type StructureLabel =
  | "higher_highs"
  | "lower_lows"
  | "range"
  | "breakdown"
  | "breakout"
  | "insufficient";

export type CandleFeatures = {
  barCount: number;
  from: string;
  to: string;
  lastClose: number | null;
  change5dPct: number | null;
  change20dPct: number | null;
  recentHigh: number | null;
  recentLow: number | null;
  distToMa25Pct: number | null;
  distToMa99Pct: number | null;
  rsi14: number | null;
  macdHist: number | null;
  macdHistRising: boolean | null;
  volatility20dPct: number | null;
  structure: StructureLabel;
  /** Compact recent closes for model (last 20 pct changes). */
  recentPctChanges: number[];
  /** Last up to 12 OHLCV rows (rounded). */
  recentBars: Array<{
    d: string;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  }>;
};

function round(n: number, digits = 4): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function pctChange(from: number, to: number): number | null {
  if (!(from > 0) || !Number.isFinite(to)) return null;
  return round(((to - from) / from) * 100, 2);
}

function labelStructure(bars: OhlcvBar[]): StructureLabel {
  if (bars.length < 20) return "insufficient";
  const slice = bars.slice(-20);
  const highs = slice.map((b) => b.high);
  const lows = slice.map((b) => b.low);
  const firstHalfHigh = Math.max(...highs.slice(0, 10));
  const secondHalfHigh = Math.max(...highs.slice(10));
  const firstHalfLow = Math.min(...lows.slice(0, 10));
  const secondHalfLow = Math.min(...lows.slice(10));
  const last = slice[slice.length - 1]!;
  const rangeHigh = Math.max(...highs);
  const rangeLow = Math.min(...lows);
  const mid = (rangeHigh + rangeLow) / 2;
  const width = (rangeHigh - rangeLow) / mid;

  if (last.close < firstHalfLow * 0.98) return "breakdown";
  if (last.close > firstHalfHigh * 1.02) return "breakout";
  if (secondHalfHigh > firstHalfHigh && secondHalfLow >= firstHalfLow * 0.995) {
    return "higher_highs";
  }
  if (secondHalfLow < firstHalfLow && secondHalfHigh <= firstHalfHigh * 1.005) {
    return "lower_lows";
  }
  if (width < 0.08) return "range";
  return "range";
}

export function buildCandleFeaturesFromBars(
  bars: OhlcvBar[],
  maxBars = 90,
): CandleFeatures {
  const sliced = bars.slice(-maxBars);
  if (!sliced.length) {
    return {
      barCount: 0,
      from: "",
      to: "",
      lastClose: null,
      change5dPct: null,
      change20dPct: null,
      recentHigh: null,
      recentLow: null,
      distToMa25Pct: null,
      distToMa99Pct: null,
      rsi14: null,
      macdHist: null,
      macdHistRising: null,
      volatility20dPct: null,
      structure: "insufficient",
      recentPctChanges: [],
      recentBars: [],
    };
  }

  const ind = computeIndicators(sliced);
  const last = sliced.length - 1;
  const close = sliced[last]!.close;
  const ma25 = ind.ma25[last];
  const ma99 = ind.ma99[last];
  const rsi14 = ind.rsi[last];
  const hist = ind.macd.hist[last];
  const prevHist = last > 0 ? ind.macd.hist[last - 1] : null;

  const recentPctChanges: number[] = [];
  for (let i = Math.max(1, sliced.length - 20); i < sliced.length; i++) {
    const p = pctChange(sliced[i - 1]!.close, sliced[i]!.close);
    if (p != null) recentPctChanges.push(p);
  }

  let volatility20dPct: number | null = null;
  if (sliced.length >= 21) {
    const rets: number[] = [];
    for (let i = sliced.length - 20; i < sliced.length; i++) {
      const r = pctChange(sliced[i - 1]!.close, sliced[i]!.close);
      if (r != null) rets.push(r);
    }
    if (rets.length) {
      const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance =
        rets.reduce((s, v) => s + (v - mean) ** 2, 0) / rets.length;
      volatility20dPct = round(Math.sqrt(variance), 2);
    }
  }

  const window = sliced.slice(-60);
  const recentHigh = Math.max(...window.map((b) => b.high));
  const recentLow = Math.min(...window.map((b) => b.low));

  return {
    barCount: sliced.length,
    from: new Date(sliced[0]!.time * 1000).toISOString().slice(0, 10),
    to: new Date(sliced[last]!.time * 1000).toISOString().slice(0, 10),
    lastClose: round(close),
    change5dPct:
      sliced.length > 5
        ? pctChange(sliced[last - 5]!.close, close)
        : null,
    change20dPct:
      sliced.length > 20
        ? pctChange(sliced[last - 20]!.close, close)
        : null,
    recentHigh: round(recentHigh),
    recentLow: round(recentLow),
    distToMa25Pct:
      ma25 != null && ma25 > 0 ? pctChange(ma25, close) : null,
    distToMa99Pct:
      ma99 != null && ma99 > 0 ? pctChange(ma99, close) : null,
    rsi14: rsi14 != null ? round(rsi14, 1) : null,
    macdHist: hist != null ? round(hist, 4) : null,
    macdHistRising:
      hist != null && prevHist != null ? hist > prevHist : null,
    volatility20dPct,
    structure: labelStructure(sliced),
    recentPctChanges,
    recentBars: sliced.slice(-12).map((b) => ({
      d: new Date(b.time * 1000).toISOString().slice(0, 10),
      o: round(b.open),
      h: round(b.high),
      l: round(b.low),
      c: round(b.close),
      v: round(b.volume, 0),
    })),
  };
}

export async function fetchCandleFeatures(opts: {
  symbol: string;
  assetType: AssetType;
  days?: number;
}): Promise<CandleFeatures> {
  const days = opts.days ?? 120;
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;
  const bars = await getDailyCandles(
    opts.symbol.toUpperCase(),
    opts.assetType,
    from,
    to,
  ).catch(() => [] as OhlcvBar[]);
  return buildCandleFeaturesFromBars(bars);
}
