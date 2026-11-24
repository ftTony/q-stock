import type { ChartCandleType } from "@/components/charts/candle-chart-settings";

/**
 * Ordered list — solid candle → hollow yang → OHLC → line → heikin → area.
 * Baseline removed: too close to area for the current menu.
 */
export const CHART_TYPE_OPTIONS: ChartCandleType[] = [
  "candle",
  "candle_stroke",
  "ohlc",
  "line",
  "heikin",
  "area",
];

/** i18n keys under `symbol.*` */
export const CHART_TYPE_LABEL_KEY: Record<
  ChartCandleType,
  { full: string; short: string }
> = {
  candle: { full: "chartTypeCandle", short: "chartTypeCandleShort" },
  candle_stroke: {
    full: "chartTypeCandleStroke",
    short: "chartTypeCandleStrokeShort",
  },
  ohlc: { full: "chartTypeOhlc", short: "chartTypeOhlcShort" },
  line: { full: "chartTypeLine", short: "chartTypeLineShort" },
  heikin: { full: "chartTypeHeikin", short: "chartTypeHeikinShort" },
  area: { full: "chartTypeArea", short: "chartTypeAreaShort" },
};
