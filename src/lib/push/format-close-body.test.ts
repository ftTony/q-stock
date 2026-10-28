import { describe, expect, it } from "vitest";
import { formatClosePushBody } from "@/lib/push/format-close-body";

describe("formatClosePushBody", () => {
  it("formats prices and percent changes", () => {
    const body = formatClosePushBody([
      { symbol: "AAPL", assetType: "stock", price: 178.25, percentChange: 1.24 },
      { symbol: "TSLA", assetType: "stock", price: 240.1, percentChange: -0.85 },
    ]);
    expect(body).toContain("AAPL 178.25 +1.24%");
    expect(body).toContain("TSLA 240.10 -0.85%");
  });

  it("truncates with more count", () => {
    const rows = Array.from({ length: 8 }, (_, i) => ({
      symbol: `S${i}`,
      assetType: "stock" as const,
      price: 10 + i,
      percentChange: 0,
    }));
    const body = formatClosePushBody(rows, 3);
    expect(body).toContain("+5");
    expect(body.split(" · ").length).toBe(4);
  });
});
