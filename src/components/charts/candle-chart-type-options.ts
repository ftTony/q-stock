import type { ChartCandleType } from "@/components/charts/candle-chart-settings";

/** Ordered list — append here when adding P1/P2 types. */
export const CHART_TYPE_OPTIONS: ChartCandleType[] = ["candle", "area"];

/** i18n keys under `symbol.*` */
export const CHART_TYPE_LABEL_KEY: Record<
  ChartCandleType,
  { full: string; short: string }
> = {
  candle: { full: "chartTypeCandle", short: "chartTypeCandleShort" },
  area: { full: "chartTypeArea", short: "chartTypeAreaShort" },
};
