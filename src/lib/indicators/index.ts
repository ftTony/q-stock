import type { OhlcvBar } from "@/lib/types";

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      const seed = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
      prev = seed;
      out.push(seed);
    } else {
      prev = values[i] * k + prev * (1 - k);
      out.push(prev);
    }
  }
  return out;
}

export function bollinger(
  values: number[],
  period = 20,
  mult = 2,
): {
  mid: (number | null)[];
  upper: (number | null)[];
  lower: (number | null)[];
} {
  const mid = sma(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (mid[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const mean = mid[i]!;
    const variance =
      slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    upper.push(mean + mult * std);
    lower.push(mean - mult * std);
  }
  return { mid, upper, lower };
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length <= period) return out;

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function macd(
  values: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): {
  macd: (number | null)[];
  signal: (number | null)[];
  hist: (number | null)[];
} {
  const fastEma = ema(values, fast);
  const slowEma = ema(values, slow);
  const macdLine: (number | null)[] = values.map((_, i) => {
    if (fastEma[i] === null || slowEma[i] === null) return null;
    return fastEma[i]! - slowEma[i]!;
  });

  const macdNums = macdLine.map((v) => v ?? 0);
  const firstValid = macdLine.findIndex((v) => v !== null);
  const signal: (number | null)[] = Array(values.length).fill(null);
  const hist: (number | null)[] = Array(values.length).fill(null);

  if (firstValid >= 0) {
    const compact = macdLine.slice(firstValid) as number[];
    const sigCompact = ema(compact, signalPeriod);
    for (let i = 0; i < sigCompact.length; i++) {
      const idx = firstValid + i;
      signal[idx] = sigCompact[i];
      if (macdLine[idx] !== null && sigCompact[i] !== null) {
        hist[idx] = macdLine[idx]! - sigCompact[i]!;
      }
    }
  }

  void macdNums;
  return { macd: macdLine, signal, hist };
}

export interface IndicatorBundle {
  ma7: (number | null)[];
  ma25: (number | null)[];
  ma99: (number | null)[];
  ema12: (number | null)[];
  ema26: (number | null)[];
  boll: ReturnType<typeof bollinger>;
  rsi: (number | null)[];
  macd: ReturnType<typeof macd>;
}

export function computeIndicators(bars: OhlcvBar[]): IndicatorBundle {
  const closes = bars.map((b) => b.close);
  return {
    ma7: sma(closes, 7),
    ma25: sma(closes, 25),
    ma99: sma(closes, 99),
    ema12: ema(closes, 12),
    ema26: ema(closes, 26),
    boll: bollinger(closes, 20, 2),
    rsi: rsi(closes, 14),
    macd: macd(closes),
  };
}
