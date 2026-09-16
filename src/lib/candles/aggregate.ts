import type { OhlcvBar } from "@/lib/types";

function periodKey(time: number, kind: "Q" | "Y"): string {
  const d = new Date(time * 1000);
  const y = d.getUTCFullYear();
  if (kind === "Y") return String(y);
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `${y}-Q${q}`;
}

/** Aggregate daily (or monthly) bars into quarterly or yearly OHLCV. */
export function aggregateCandles(
  bars: OhlcvBar[],
  kind: "Q" | "Y",
): OhlcvBar[] {
  if (!bars.length) return [];
  const sorted = [...bars].sort((a, b) => a.time - b.time);
  const groups = new Map<string, OhlcvBar[]>();

  for (const bar of sorted) {
    const key = periodKey(bar.time, kind);
    const list = groups.get(key) ?? [];
    list.push(bar);
    groups.set(key, list);
  }

  const result: OhlcvBar[] = [];
  for (const [, group] of groups) {
    const first = group[0];
    const last = group[group.length - 1];
    result.push({
      time: first.time,
      open: first.open,
      high: Math.max(...group.map((g) => g.high)),
      low: Math.min(...group.map((g) => g.low)),
      close: last.close,
      volume: group.reduce((s, g) => s + g.volume, 0),
    });
  }
  return result;
}
