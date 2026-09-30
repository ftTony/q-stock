import { cachedFetch } from "@/lib/cache";
import {
  fuyaoIndexSnapshot,
  fuyaoThsIndexList,
  hasFuyaoCreds,
} from "@/lib/market/providers/fuyao-client";
import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";

const SNAPSHOT_CHUNK = 80;

async function snapshotAll(
  thscodes: string[],
): Promise<Map<string, Awaited<ReturnType<typeof fuyaoIndexSnapshot>>[number]>> {
  const byCode = new Map<
    string,
    Awaited<ReturnType<typeof fuyaoIndexSnapshot>>[number]
  >();
  for (let i = 0; i < thscodes.length; i += SNAPSHOT_CHUNK) {
    const part = thscodes.slice(i, i + SNAPSHOT_CHUNK);
    try {
      const rows = await fuyaoIndexSnapshot(part);
      for (const row of rows) {
        if (row.thscode) byCode.set(row.thscode.toUpperCase(), row);
      }
    } catch (err) {
      console.warn(
        "[fuyao-industry] snapshot chunk failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }
  return byCode;
}

/**
 * A-share industry heatmap via Fuyao THS industry catalog + index snapshot.
 */
export async function getFuyaoIndustryHeatmap(
  limit = 40,
): Promise<IndustryHeatCell[]> {
  if (!hasFuyaoCreds()) return [];

  const key = `fuyao:industry:v1:${limit}`;
  return cachedFetch(key, 120_000, async () => {
    const list = await fuyaoThsIndexList("industry");
    const plates = list.filter((r) => r.thscode && r.name);
    if (!plates.length) return [];

    const snaps = await snapshotAll(plates.map((p) => p.thscode!));
    const cells: IndustryHeatCell[] = [];
    for (const p of plates) {
      const code = p.thscode!.toUpperCase();
      const snap = snaps.get(code);
      if (!snap) continue;
      const last = Number(snap.last_price ?? 0);
      if (!(last > 0)) continue;
      const pct =
        snap.price_change_ratio_pct != null
          ? Number(snap.price_change_ratio_pct)
          : 0;
      const turnover = Number(snap.turnover ?? 0);
      const volume = Number(snap.volume ?? 0);
      const weight = turnover > 0 ? turnover : volume > 0 ? volume : 1;
      cells.push({
        id: code,
        name: (p.name || code).trim(),
        percentChange: pct,
        weight,
        ...(volume > 0 ? { volume } : {}),
        stocks: [],
      });
    }

    // Prefer larger boards by weight, then keep strongest movers visible.
    cells.sort(
      (a, b) =>
        Math.abs(b.percentChange) * Math.log10(b.weight + 10) -
        Math.abs(a.percentChange) * Math.log10(a.weight + 10),
    );
    return cells.slice(0, Math.max(10, limit));
  });
}
