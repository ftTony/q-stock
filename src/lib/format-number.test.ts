import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatNumber,
  formatTime,
  marketTimeZoneLabel,
  MARKET_TIME_ZONES,
} from "@/lib/format-number";

describe("formatNumber", () => {
  it("defaults to en-US grouping", () => {
    expect(formatNumber(1234.5, { maximumFractionDigits: 1 })).toBe("1,234.5");
  });

  it("accepts an explicit locale", () => {
    const de = formatNumber(1234.5, {
      locale: "de-DE",
      maximumFractionDigits: 1,
    });
    expect(de).toMatch(/1.?234/);
  });
});

describe("formatTime", () => {
  const noonUtc = Date.UTC(2026, 0, 15, 12, 0, 0);

  it("defaults to UTC for SSR stability", () => {
    expect(formatTime(noonUtc)).toBe("12:00:00");
  });

  it("maps assetType to market zones", () => {
    expect(MARKET_TIME_ZONES.stock).toBe("America/New_York");
    expect(MARKET_TIME_ZONES.cn).toBe("Asia/Shanghai");
    const et = formatTime(noonUtc, { assetType: "stock" });
    // 12:00 UTC → 07:00 ET (standard) or 08:00 EDT — January is EST
    expect(et).toBe("07:00:00");
    expect(marketTimeZoneLabel("cn")).toBe("CST");
  });
});

describe("formatDate", () => {
  it("formats UTC calendar date stably", () => {
    expect(formatDate(Date.UTC(2026, 0, 15))).toBe("01/15/2026");
  });
});
