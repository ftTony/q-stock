import { describe, expect, it, vi } from "vitest";
import { claimByIds } from "@/lib/jobs/claim";

describe("claimByIds", () => {
  it("returns only ids that won the claim race", async () => {
    const claimOne = vi.fn(async (id: string) => id !== "b");
    const claimed = await claimByIds(
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      claimOne,
    );
    expect(claimed).toEqual(["a", "c"]);
    expect(claimOne).toHaveBeenCalledTimes(3);
  });

  it("returns empty when all claims lose", async () => {
    const claimed = await claimByIds([{ id: "x" }], async () => false);
    expect(claimed).toEqual([]);
  });
});
