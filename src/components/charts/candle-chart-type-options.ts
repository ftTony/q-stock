import type { ChartCandleType } from "@/components/charts/candle-chart-settings";

/**
 * Ordered list — solid → hollow → OHLC → column → line → heikin → area.
 */
export const CHART_TYPE_OPTIONS: ChartCandleType[] = [
  "candle",
  "candle_stroke",
  "ohlc",
  "column",
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
  column: { full: "chartTypeColumn", short: "chartTypeColumnShort" },
  line: { full: "chartTypeLine", short: "chartTypeLineShort" },
  heikin: { full: "chartTypeHeikin", short: "chartTypeHeikinShort" },
  area: { full: "chartTypeArea", short: "chartTypeAreaShort" },
};
