import { describe, expect, it } from "vitest";
import { filterUsRegularSessionBars } from "@/lib/market/session";

/** Build a unix-sec timestamp in America/New_York wall clock. */
function etUnix(ymd: string, hm: string): number {
  // Interpret as ET via explicit offset (EST = UTC-5; tests use winter dates).
  return Math.floor(new Date(`${ymd}T${hm}:00-05:00`).getTime() / 1000);
}

describe("filterUsRegularSessionBars", () => {
  it("keeps 09:30–15:59 ET weekdays and drops pre/post", () => {
    const pre = { time: etUnix("2026-01-12", "09:00") };
    const open = { time: etUnix("2026-01-12", "09:30") };
    const mid = { time: etUnix("2026-01-12", "12:00") };
    const last = { time: etUnix("2026-01-12", "15:59") };
    const post = { time: etUnix("2026-01-12", "16:00") };
    const out = filterUsRegularSessionBars([pre, open, mid, last, post]);
    expect(out.map((b) => b.time)).toEqual([open.time, mid.time, last.time]);
  });
});
