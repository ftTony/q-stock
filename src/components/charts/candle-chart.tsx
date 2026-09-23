"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type HistogramData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { OhlcvBar } from "@/lib/types";
import type { IndicatorBundle } from "@/lib/indicators";
import { usePreference } from "@/components/providers/preference-provider";

export type IndicatorFlags = {
  ma: boolean;
  ema: boolean;
  boll: boolean;
  rsi: boolean;
  macd: boolean;
};

function toCandle(bars: OhlcvBar[]): CandlestickData<Time>[] {
  return bars.map((b) => ({
    time: b.time as Time,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
  }));
}

function lineFrom(
  bars: OhlcvBar[],
  values: (number | null)[],
): LineData<Time>[] {
  const out: LineData<Time>[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (values[i] === null || values[i] === undefined) continue;
    out.push({ time: bars[i].time as Time, value: values[i]! });
  }
  return out;
}

export function CandleChart({
  bars,
  indicators,
  flags,
}: {
  bars: OhlcvBar[];
  indicators?: IndicatorBundle;
  flags: IndicatorFlags;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { changeColorScheme } = usePreference();

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const styles = getComputedStyle(document.documentElement);
    const up = styles.getPropertyValue("--up").trim() || "#e11d48";
    const down = styles.getPropertyValue("--down").trim() || "#16a34a";
    const fg = styles.getPropertyValue("--muted").trim() || "#64748b";
    const bg = styles.getPropertyValue("--surface").trim() || "#ffffff";

    const showSub = flags.rsi || flags.macd;
    const chart: IChartApi = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: fg,
      },
      grid: {
        vertLines: { color: "rgba(100,116,139,0.15)" },
        horzLines: { color: "rgba(100,116,139,0.15)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: up,
      downColor: down,
      borderUpColor: up,
      borderDownColor: down,
      wickUpColor: up,
      wickDownColor: down,
    });
    candleSeries.setData(toCandle(bars));

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      bars.map((b) => ({
        time: b.time as Time,
        value: b.volume,
        color: b.close >= b.open ? `${up}66` : `${down}66`,
      })) as HistogramData<Time>[],
    );

    const overlays: ISeriesApi<"Line">[] = [];
    if (indicators && flags.ma) {
      for (const [vals, color] of [
        [indicators.ma7, "#f59e0b"],
        [indicators.ma25, "#3b82f6"],
        [indicators.ma99, "#a855f7"],
      ] as const) {
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          priceLineVisible: false,
        });
        s.setData(lineFrom(bars, vals));
        overlays.push(s);
      }
    }
    if (indicators && flags.ema) {
      for (const [vals, color] of [
        [indicators.ema12, "#06b6d4"],
        [indicators.ema26, "#f97316"],
      ] as const) {
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          priceLineVisible: false,
        });
        s.setData(lineFrom(bars, vals));
        overlays.push(s);
      }
    }
    if (indicators && flags.boll) {
      for (const [vals, color] of [
        [indicators.boll.upper, "#94a3b8"],
        [indicators.boll.mid, "#64748b"],
        [indicators.boll.lower, "#94a3b8"],
      ] as const) {
        const s = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
        });
        s.setData(lineFrom(bars, vals));
        overlays.push(s);
      }
    }

    if (indicators && flags.rsi) {
      const rsiSeries = chart.addSeries(LineSeries, {
        color: "#eab308",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceLineVisible: false,
      });
      chart.priceScale("rsi").applyOptions({
        scaleMargins: { top: showSub ? 0.7 : 0.1, bottom: 0 },
      });
      rsiSeries.setData(lineFrom(bars, indicators.rsi));
    }

    if (indicators && flags.macd) {
      const macdSeries = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 1,
        priceScaleId: "macd",
        priceLineVisible: false,
      });
      const signalSeries = chart.addSeries(LineSeries, {
        color: "#fb7185",
        lineWidth: 1,
        priceScaleId: "macd",
        priceLineVisible: false,
      });
      const histSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: "macd",
      });
      chart.priceScale("macd").applyOptions({
        scaleMargins: { top: 0.75, bottom: 0 },
      });
      macdSeries.setData(lineFrom(bars, indicators.macd.macd));
      signalSeries.setData(lineFrom(bars, indicators.macd.signal));
      histSeries.setData(
        lineFrom(bars, indicators.macd.hist).map((d) => ({
          ...d,
          color: (d.value ?? 0) >= 0 ? `${up}99` : `${down}99`,
        })) as HistogramData<Time>[],
      );
    }

    void overlays;
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [bars, indicators, flags, changeColorScheme]);

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] sm:h-[440px]"
    />
  );
}
