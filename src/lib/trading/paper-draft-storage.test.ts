import { describe, expect, it } from "vitest";
import { draftFromReplayTrades } from "@/lib/trading/paper-draft-storage";

describe("draftFromReplayTrades", () => {
  it("returns null for empty trades", () => {
    expect(draftFromReplayTrades([])).toBeNull();
  });

  it("prefers the last priced trade as a limit draft", () => {
    const draft = draftFromReplayTrades([
      { side: "buy", price: 10, qty: 5 },
      { side: "sell", price: 12, qty: 5 },
    ]);
    expect(draft).toEqual({
      side: "sell",
      type: "limit",
      price: 12,
      qtyHint: 5,
      invalidationNote: "From rule replay — review before submit",
    });
  });
});
