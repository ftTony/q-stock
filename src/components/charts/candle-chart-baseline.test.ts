import { describe, expect, it } from "vitest";
import {
  buildBaselineFillPolygons,
  resolveBaselinePrice,
} from "@/components/charts/candle-chart-baseline";

describe("resolveBaselinePrice", () => {
  it("uses previousClose when positive", () => {
    expect(resolveBaselinePrice({ previousClose: 12.5 })).toBe(12.5);
  });

  it("returns null when missing or non-positive", () => {
    expect(resolveBaselinePrice(null)).toBeNull();
    expect(resolveBaselinePrice({})).toBeNull();
    expect(resolveBaselinePrice({ previousClose: 0 })).toBeNull();
    expect(resolveBaselinePrice({ previousClose: -1 })).toBeNull();
  });
});

describe("buildBaselineFillPolygons", () => {
  it("returns empty for fewer than 2 points", () => {
    expect(buildBaselineFillPolygons([{ x: 0, y: 10 }], 20)).toEqual({
      above: [],
      below: [],
    });
  });

  it("fills above baseline when all points are above (smaller y = higher price)", () => {
    // y decreases upward on canvas; baselineY=50, closes at y=30 (above)
    const { above, below } = buildBaselineFillPolygons(
      [
        { x: 0, y: 30 },
        { x: 10, y: 30 },
        { x: 20, y: 30 },
      ],
      50,
    );
    expect(below).toHaveLength(0);
    expect(above).toHaveLength(1);
    expect(above[0]!.length).toBeGreaterThanOrEqual(4);
  });

  it("splits into above and below when the path crosses the baseline", () => {
    const { above, below } = buildBaselineFillPolygons(
      [
        { x: 0, y: 20 },
        { x: 10, y: 20 },
        { x: 20, y: 80 },
        { x: 30, y: 80 },
      ],
      50,
    );
    expect(above.length).toBeGreaterThanOrEqual(1);
    expect(below.length).toBeGreaterThanOrEqual(1);
  });
});
