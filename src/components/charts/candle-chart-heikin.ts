import type { ChartCandleType } from "@/components/charts/candle-chart-settings";
import type { OhlcvBar } from "@/lib/types";

/**
 * Heikin-Ashi transform (display only). Volume / time stay real.
 * HA_Close = (O+H+L+C)/4
 * HA_Open  = (prev HA_Open + prev HA_Close)/2 ; first bar (O+C)/2
 * HA_High  = max(H, HA_Open, HA_Close)
 * HA_Low   = min(L, HA_Open, HA_Close)
 */
export function toHeikinAshiBars(bars: OhlcvBar[]): OhlcvBar[] {
  if (!bars.length) return [];
  const out: OhlcvBar[] = new Array(bars.length);
  let prevHaOpen = 0;
  let prevHaClose = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const haOpen =
      i === 0 ? (b.open + b.close) / 2 : (prevHaOpen + prevHaClose) / 2;
    const haHigh = Math.max(b.high, haOpen, haClose);
    const haLow = Math.min(b.low, haOpen, haClose);
    out[i] = {
      time: b.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: b.volume,
    };
    prevHaOpen = haOpen;
    prevHaClose = haClose;
  }
  return out;
}

/** Bars as shown on the pane (HA rewrite when type is heikin). */
export function barsForChartType(
  bars: OhlcvBar[],
  chartType: ChartCandleType,
): OhlcvBar[] {
  return chartType === "heikin" ? toHeikinAshiBars(bars) : bars;
}

/**
 * Forward (older) page must transform against the full series so the
 * HA open chain stays continuous at the chunk boundary.
 */
export function heikinForwardChunk(
  olderChunk: OhlcvBar[],
  existingBars: OhlcvBar[],
): OhlcvBar[] {
  if (!olderChunk.length) return [];
  const combined = [...olderChunk, ...existingBars];
  return toHeikinAshiBars(combined).slice(0, olderChunk.length);
}
