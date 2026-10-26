import { describe, expect, it } from "vitest";
import { deviationFlags } from "@/lib/review/deviation";

describe("deviationFlags", () => {
  it("flags missing tag and invalidation", () => {
    expect(deviationFlags({})).toEqual(["noTag", "noInvalidation"]);
  });

  it("includes user emotion tags only", () => {
    expect(
      deviationFlags({
        strategyId: "s1",
        invalidationNote: "stop 100",
        emotionTags: ["fomo", "calm"],
      }),
    ).toEqual(["fomo"]);
  });
});
