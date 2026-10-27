import { describe, expect, it } from "vitest";
import { resolveCandleType } from "@/components/charts/candle-chart-settings";
import { toKlineCandleType } from "@/components/charts/candle-chart-styles";

describe("resolveCandleType", () => {
  it("defaults timeline to area and others to candle", () => {
    expect(resolveCandleType({}, "T")).toBe("area");
    expect(resolveCandleType({}, "D")).toBe("candle");
    expect(resolveCandleType({}, "5")).toBe("candle");
  });

  it("honors explicit user choice across resolutions", () => {
    expect(resolveCandleType({ chartType: "candle" }, "T")).toBe("candle");
    expect(resolveCandleType({ chartType: "area" }, "D")).toBe("area");
  });
});

describe("toKlineCandleType", () => {
  it("maps product types to klinecharts styles", () => {
    expect(toKlineCandleType("candle")).toBe("candle_solid");
    expect(toKlineCandleType("area")).toBe("area");
  });
});
