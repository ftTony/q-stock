import { describe, expect, it } from "vitest";
import {
  barsForChartType,
  heikinForwardChunk,
  toHeikinAshiBars,
} from "@/components/charts/candle-chart-heikin";
import type { OhlcvBar } from "@/lib/types";

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume = 100,
): OhlcvBar {
  return { time, open, high, low, close, volume };
}

describe("toHeikinAshiBars", () => {
  it("returns empty for empty input", () => {
    expect(toHeikinAshiBars([])).toEqual([]);
  });

  it("computes HA open/close/high/low from real OHLC", () => {
    const input = [
      bar(1, 10, 12, 9, 11),
      bar(2, 11, 14, 10, 13),
      bar(3, 13, 13.5, 11, 12),
    ];
    const out = toHeikinAshiBars(input);

    // First: HA open = (O+C)/2, HA close = (O+H+L+C)/4
    expect(out[0].open).toBeCloseTo((10 + 11) / 2);
    expect(out[0].close).toBeCloseTo((10 + 12 + 9 + 11) / 4);
    expect(out[0].high).toBeCloseTo(
      Math.max(12, out[0].open, out[0].close),
    );
    expect(out[0].low).toBeCloseTo(Math.min(9, out[0].open, out[0].close));
    expect(out[0].volume).toBe(100);
    expect(out[0].time).toBe(1);

    // Second: HA open = (prevHA open + prevHA close) / 2
    expect(out[1].open).toBeCloseTo((out[0].open + out[0].close) / 2);
    expect(out[1].close).toBeCloseTo((11 + 14 + 10 + 13) / 4);
    expect(out[1].high).toBeCloseTo(
      Math.max(14, out[1].open, out[1].close),
    );
    expect(out[1].low).toBeCloseTo(
      Math.min(10, out[1].open, out[1].close),
    );

    expect(out[2].open).toBeCloseTo((out[1].open + out[1].close) / 2);
    expect(out[2].close).toBeCloseTo((13 + 13.5 + 11 + 12) / 4);
  });

  it("does not mutate the input bars", () => {
    const input = [bar(1, 10, 12, 9, 11)];
    const snapshot = structuredClone(input);
    toHeikinAshiBars(input);
    expect(input).toEqual(snapshot);
  });
});

describe("barsForChartType", () => {
  it("only rewrites when type is heikin", () => {
    const input = [bar(1, 10, 12, 9, 11)];
    expect(barsForChartType(input, "candle")).toBe(input);
    expect(barsForChartType(input, "heikin")[0]!.close).toBeCloseTo(
      (10 + 12 + 9 + 11) / 4,
    );
  });
});

describe("heikinForwardChunk", () => {
  it("keeps HA open continuous against existing series", () => {
    const existing = [bar(2, 11, 14, 10, 13), bar(3, 13, 13.5, 11, 12)];
    const older = [bar(1, 10, 12, 9, 11)];
    const full = toHeikinAshiBars([...older, ...existing]);
    const chunk = heikinForwardChunk(older, existing);
    expect(chunk).toHaveLength(1);
    expect(chunk[0]!.open).toBeCloseTo(full[0]!.open);
    expect(chunk[0]!.close).toBeCloseTo(full[0]!.close);
  });
});
