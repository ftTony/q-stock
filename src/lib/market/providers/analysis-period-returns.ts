import { cachedFetch } from "@/lib/cache";
import { getDailyCandles } from "@/lib/market";
import type { SecurityCalcRow } from "@/lib/market/providers/longbridge-calc";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType, OhlcvBar } from "@/lib/types";

const PERIODS = [
  { key: "change5d" as const, days: 5 },
  { key: "change10d" as const, days: 10 },
  { key: "change20d" as const, days: 20 },
  { key: "change60d" as const, days: 60 },
  { key: "change120d" as const, days: 120 },
  { key: "change250d" as const, days: 250 },
];

function ytdPct(bars: OhlcvBar[]): number | undefined {
  if (bars.length < 2) return undefined;
  const last = bars[bars.length - 1]!;
  const y = new Date(last.time * 1000).getUTCFullYear();
  // Prefer last bar of prior year; else first bar of this year.
  const priorYearLast = [...bars]
    .reverse()
    .find((b) => new Date(b.time * 1000).getUTCFullYear() < y);
  const anchor =
    priorYearLast ??
    bars.find((b) => new Date(b.time * 1000).getUTCFullYear() === y);
  if (!anchor || !(anchor.close > 0) || !Number.isFinite(last.close)) {
    return undefined;
  }
  return ((last.close - anchor.close) / anchor.close) * 100;
}

/** Soft caps for 1GB hosts — never fan out unbounded candle fetches. */
const MAX_SYMBOLS = 12;
const CONCURRENCY = 2;
const LOOKBACK_MS = 400 * 24 * 60 * 60 * 1000;

function pctFromBars(bars: OhlcvBar[], tradingDays: number): number | undefined {
  if (bars.length < tradingDays + 1) return undefined;
  const last = bars[bars.length - 1]!;
  const base = bars[bars.length - 1 - tradingDays]!;
  if (!(base.close > 0) || !Number.isFinite(last.close)) return undefined;
  return ((last.close - base.close) / base.close) * 100;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!);
    }
  }
  const n = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

/**
 * Fill 20/60/120/250d change % from daily candles when broker calc lacks them.
 */
export async function getPeriodReturnsFromCandles(
  symbols: string[],
  assetType: AssetType,
): Promise<SecurityCalcRow[]> {
  if (assetType === "crypto") return [];
  const trimmed = [
    ...new Set(
      symbols
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_SYMBOLS),
    ),
  ];
  if (!trimmed.length) return [];

  const now = Date.now();
  const from = Math.floor((now - LOOKBACK_MS) / 1000);
  const to = Math.floor(now / 1000);

  return mapPool(trimmed, CONCURRENCY, async (raw) => {
    const localSymbol = normalizeSymbol(raw, assetType).toUpperCase();
    const cacheKey = `analysis:period:v2:${assetType}:${localSymbol}`;
    try {
      return await cachedFetch(cacheKey, 15 * 60_000, async () => {
        const bars = await getDailyCandles(raw, assetType, from, to);
        const sorted = [...bars].sort((a, b) => a.time - b.time);
        const row: SecurityCalcRow = { symbol: raw, localSymbol };
        for (const { key, days } of PERIODS) {
          const pct = pctFromBars(sorted, days);
          if (pct != null) row[key] = pct;
        }
        const ytd = ytdPct(sorted);
        if (ytd != null) row.changeYtd = ytd;
        return row;
      });
    } catch (err) {
      console.warn(
        "[analysis-period-returns]",
        localSymbol,
        err instanceof Error ? err.message : err,
      );
      return { symbol: raw, localSymbol };
    }
  });
}
