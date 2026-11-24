import { describe, expect, it } from "vitest";
import {
  isChartCandleType,
  resolveCandleType,
} from "@/components/charts/candle-chart-settings";
import { toKlineCandleType } from "@/components/charts/candle-chart-styles";
import { CHART_TYPE_OPTIONS } from "@/components/charts/candle-chart-type-options";

describe("resolveCandleType", () => {
  it("defaults timeline to area and others to candle", () => {
    expect(resolveCandleType({}, "T")).toBe("area");
    expect(resolveCandleType({}, "D")).toBe("candle");
    expect(resolveCandleType({}, "5")).toBe("candle");
  });

  it("honors explicit user choice across resolutions", () => {
    expect(resolveCandleType({ chartType: "candle" }, "T")).toBe("candle");
    expect(resolveCandleType({ chartType: "candle_stroke" }, "D")).toBe(
      "candle_stroke",
    );
    expect(resolveCandleType({ chartType: "area" }, "D")).toBe("area");
    expect(resolveCandleType({ chartType: "ohlc" }, "T")).toBe("ohlc");
    expect(resolveCandleType({ chartType: "line" }, "D")).toBe("line");
    expect(resolveCandleType({ chartType: "heikin" }, "T")).toBe("heikin");
  });

  it("ignores removed baseline preference", () => {
    expect(
      resolveCandleType(
        { chartType: "baseline" as never },
        "D",
      ),
    ).toBe("candle");
  });
});

describe("toKlineCandleType", () => {
  it("maps product types to klinecharts styles", () => {
    expect(toKlineCandleType("candle")).toBe("candle_solid");
    expect(toKlineCandleType("candle_stroke")).toBe("candle_up_stroke");
    expect(toKlineCandleType("ohlc")).toBe("ohlc");
    expect(toKlineCandleType("line")).toBe("area");
    expect(toKlineCandleType("heikin")).toBe("candle_solid");
    expect(toKlineCandleType("area")).toBe("area");
  });
});

describe("CHART_TYPE_OPTIONS", () => {
  it("lists solid → hollow → ohlc → line → heikin → area (no baseline)", () => {
    expect(CHART_TYPE_OPTIONS).toEqual([
      "candle",
      "candle_stroke",
      "ohlc",
      "line",
      "heikin",
      "area",
    ]);
    for (const type of CHART_TYPE_OPTIONS) {
      expect(isChartCandleType(type)).toBe(true);
    }
    expect(isChartCandleType("baseline")).toBe(false);
  });
});
