import {
  barsForChartType,
  heikinForwardChunk,
} from "@/components/charts/candle-chart-heikin";
import type { ChartCandleType } from "@/components/charts/candle-chart-settings";
import { toKLineData } from "@/components/charts/candle-chart-styles";
import type { OhlcvBar } from "@/lib/types";

type GetBarsArgs = {
  type: string;
  timestamp?: number | null;
  callback: (
    data: ReturnType<typeof toKLineData>,
    more?: { forward?: boolean; backward?: boolean },
  ) => void;
};

/** KLineChart v10 dataLoader — forward = older (left), backward = newer. */
export function createCandleGetBars(deps: {
  barsRef: { current: OhlcvBar[] };
  hasMoreRef: { current: boolean };
  onLoadMoreRef: {
    current?: (earliestTime: number) => Promise<OhlcvBar[] | void> | void;
  };
  chartTypeRef: { current: ChartCandleType };
}) {
  return async ({ type, timestamp, callback }: GetBarsArgs) => {
    const ctype = deps.chartTypeRef.current;
    if (type === "init" || type === "update") {
      const list = toKLineData(barsForChartType(deps.barsRef.current, ctype));
      callback(list, {
        forward: deps.hasMoreRef.current && list.length > 0,
        backward: false,
      });
      return;
    }
    if (type === "forward") {
      const oldestSec = timestamp
        ? Math.floor(timestamp / 1000)
        : deps.barsRef.current[0]?.time;
      if (!oldestSec || !deps.onLoadMoreRef.current) {
        callback([], { forward: false });
        return;
      }
      try {
        const older = await deps.onLoadMoreRef.current(oldestSec);
        const chunk = Array.isArray(older) ? older : [];
        const display =
          ctype === "heikin"
            ? heikinForwardChunk(chunk, deps.barsRef.current)
            : chunk;
        callback(toKLineData(display), {
          forward: chunk.length > 0 && deps.hasMoreRef.current,
        });
      } catch {
        callback([], { forward: false });
      }
      return;
    }
    if (type === "backward") {
      callback([], { backward: false });
      return;
    }
    callback([]);
  };
}
