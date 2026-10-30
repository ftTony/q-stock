import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";

type ChartLike = {
  createIndicator: (
    value: string | { name: string; calcParams?: number[]; paneId?: string },
    isStack?: boolean,
  ) => string | null;
  removeIndicator: (filter: { id: string }) => void;
};

/** Create / remove overlay indicators to match toolbar flags. */
export function syncCandleIndicators(
  chart: ChartLike,
  flags: IndicatorFlags,
  ids: Record<string, string | null>,
) {
  const ensure = (key: string, create: () => string | null) => {
    if (ids[key]) return;
    ids[key] = create();
  };
  const remove = (key: string) => {
    if (!ids[key]) return;
    chart.removeIndicator({ id: ids[key]! });
    ids[key] = null;
  };

  if (flags.ma) {
    ensure("ma", () =>
      chart.createIndicator(
        { name: "MA", calcParams: [7, 25, 99], paneId: "candle_pane" },
        true,
      ),
    );
  } else remove("ma");

  if (flags.ema) {
    ensure("ema", () =>
      chart.createIndicator(
        { name: "EMA", calcParams: [12, 26], paneId: "candle_pane" },
        true,
      ),
    );
  } else remove("ema");

  if (flags.boll) {
    ensure("boll", () =>
      chart.createIndicator({ name: "BOLL", paneId: "candle_pane" }, true),
    );
  } else remove("boll");

  if (flags.rsi) {
    ensure("rsi", () => chart.createIndicator("RSI"));
  } else remove("rsi");

  if (flags.macd) {
    ensure("macd", () => chart.createIndicator("MACD"));
  } else remove("macd");

  if (!ids.vol) {
    ids.vol = chart.createIndicator("VOL");
  }
}
