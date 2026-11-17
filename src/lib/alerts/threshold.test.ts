import { describe, expect, it } from "vitest";
import {
  isAlertThresholdHit,
  nextPriceAlertAction,
  sameUtcDay,
} from "@/lib/alerts/threshold";

describe("isAlertThresholdHit", () => {
  it("checks gte / lte", () => {
    expect(isAlertThresholdHit("gte", 10, 10)).toBe(true);
    expect(isAlertThresholdHit("gte", 9.9, 10)).toBe(false);
    expect(isAlertThresholdHit("lte", 10, 10)).toBe(true);
    expect(isAlertThresholdHit("lte", 10.1, 10)).toBe(false);
  });
});

describe("sameUtcDay", () => {
  it("compares UTC calendar days", () => {
    expect(
      sameUtcDay(
        new Date("2026-11-17T01:00:00.000Z"),
        new Date("2026-11-17T23:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      sameUtcDay(
        new Date("2026-11-17T23:00:00.000Z"),
        new Date("2026-11-18T00:30:00.000Z"),
      ),
    ).toBe(false);
  });
});

describe("nextPriceAlertAction", () => {
  const day1 = new Date("2026-11-17T12:00:00.000Z");
  const day2 = new Date("2026-11-18T12:00:00.000Z");

  it("always: fire once per breach, rearm after recovery", () => {
    expect(nextPriceAlertAction("active", true, "always")).toBe("fire");
    expect(nextPriceAlertAction("triggered", true, "always", day1, day1)).toBe(
      "hold",
    );
    expect(nextPriceAlertAction("triggered", false, "always", day1, day1)).toBe(
      "rearm",
    );
  });

  it("once: never rearm or refire after triggered", () => {
    expect(nextPriceAlertAction("triggered", false, "once", day1, day2)).toBe(
      "hold",
    );
    expect(nextPriceAlertAction("triggered", true, "once", day1, day2)).toBe(
      "hold",
    );
  });

  it("daily: refire on a new UTC day while still breached", () => {
    expect(
      nextPriceAlertAction("triggered", true, "daily", day1, day1),
    ).toBe("hold");
    expect(
      nextPriceAlertAction("triggered", true, "daily", day1, day2),
    ).toBe("fire");
    expect(
      nextPriceAlertAction("triggered", false, "daily", day1, day2),
    ).toBe("rearm");
  });
});
