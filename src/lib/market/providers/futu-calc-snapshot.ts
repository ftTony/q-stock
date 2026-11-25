import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type { SecurityCalcRow } from "@/lib/market/providers/longbridge-calc";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

const SNAPSHOT_CHUNK = 24;

type SnapRow = {
  code?: string;
  last_price?: number | string;
  prev_close_price?: number | string;
  high_price?: number | string;
  low_price?: number | string;
  turnover_rate?: number | string;
  amplitude?: number | string;
  volume_ratio?: number | string;
  total_market_val?: number | string;
  close_price_5min?: number | string;
};

function finite(v: number | string | null | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function positive(v: number | string | null | undefined): number | undefined {
  const n = finite(v);
  return n != null && n > 0 ? n : undefined;
}

/**
 * Futu quote snapshot → analysis calc enrich (turnover / 量比 / 振幅 / 涨跌速率).
 * Used when Longbridge calc is missing or incomplete.
 */
export async function getFutuCalcSnapshots(
  symbols: string[],
  assetType: AssetType,
): Promise<SecurityCalcRow[]> {
  if (!isFutuConfigured() || assetType === "crypto") return [];
  const trimmed = [
    ...new Set(
      symbols
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 48),
    ),
  ];
  if (!trimmed.length) return [];

  const codes = trimmed.map((s) => toFutuSymbol(s, assetType));
  const cacheKey = `futu:calc-snap:v1:${assetType}:${codes.join(",")}`;

  return cachedFetch(cacheKey, 60_000, async () => {
    const byCode = new Map<string, SnapRow>();
    for (let i = 0; i < codes.length; i += SNAPSHOT_CHUNK) {
      const chunk = codes.slice(i, i + SNAPSHOT_CHUNK);
      try {
        const { data } = await futuRequest<{ snapshot_list?: SnapRow[] }>(
          "POST",
          "/api/v1.0/quote/snapshot",
          { body: { code_list: chunk } },
        );
        for (const row of data.snapshot_list ?? []) {
          if (row.code) byCode.set(row.code, row);
        }
      } catch (err) {
        console.warn(
          "[futu-calc-snapshot] failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    return trimmed.map((raw, idx) => {
      const code = codes[idx]!;
      const snap = byCode.get(code);
      const localSymbol = normalizeSymbol(raw, assetType).toUpperCase();
      const price = positive(snap?.last_price);
      const prev = positive(snap?.prev_close_price);
      const fiveMin = positive(snap?.close_price_5min);
      const high = positive(snap?.high_price);
      const low = positive(snap?.low_price);
      const turnoverRate = finite(snap?.turnover_rate);
      const volumeRatio = finite(snap?.volume_ratio);
      const marketCap = positive(snap?.total_market_val);
      let amplitude = finite(snap?.amplitude);
      if (amplitude == null && prev && high && low && high !== low) {
        amplitude = ((high - low) / prev) * 100;
      }
      const changeSpeed =
        price != null && fiveMin != null
          ? ((price - fiveMin) / fiveMin) * 100
          : undefined;
      return {
        symbol: code,
        localSymbol,
        ...(marketCap != null ? { marketCap } : {}),
        ...(turnoverRate != null ? { turnoverRate } : {}),
        ...(amplitude != null ? { amplitude } : {}),
        ...(volumeRatio != null ? { volumeRatio } : {}),
        ...(changeSpeed != null ? { changeSpeed } : {}),
      } satisfies SecurityCalcRow;
    });
  });
}
