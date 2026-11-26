import { describe, expect, it } from "vitest";
import { getNavTooltipPosition } from "./nav-icon-tooltip";

describe("getNavTooltipPosition", () => {
  const tooltipSize = { width: 80, height: 24 };
  const viewportSize = { width: 400, height: 300 };

  it("places right-side tooltips beside the anchor and vertically centers them", () => {
    expect(
      getNavTooltipPosition(
        { top: 40, left: 20, right: 60, height: 40 },
        tooltipSize,
        viewportSize,
        "right",
      ),
    ).toEqual({ top: 48, left: 68 });
  });

  it("places left-side tooltips beside the anchor and vertically centers them", () => {
    expect(
      getNavTooltipPosition(
        { top: 40, left: 180, right: 220, height: 40 },
        tooltipSize,
        viewportSize,
        "left",
      ),
    ).toEqual({ top: 48, left: 92 });
  });

  it("keeps long tooltips within the horizontal viewport edges", () => {
    expect(
      getNavTooltipPosition(
        { top: 100, left: 370, right: 390, height: 20 },
        { width: 120, height: 24 },
        viewportSize,
        "right",
      ),
    ).toEqual({ top: 98, left: 272 });
  });

  it("keeps tooltips within the vertical viewport edges", () => {
    expect(
      getNavTooltipPosition(
        { top: 0, left: 20, right: 60, height: 20 },
        { width: 80, height: 50 },
        viewportSize,
        "right",
      ),
    ).toEqual({ top: 8, left: 68 });

    expect(
      getNavTooltipPosition(
        { top: 270, left: 20, right: 60, height: 20 },
        { width: 80, height: 50 },
        viewportSize,
        "right",
      ),
    ).toEqual({ top: 242, left: 68 });
  });
});
