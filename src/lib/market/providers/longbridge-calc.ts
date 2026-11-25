import { cachedFetch } from "@/lib/cache";
import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
  loadLb,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

export type SecurityCalcRow = {
  symbol: string;
  /** Normalized app symbol (uppercase). */
  localSymbol: string;
  marketCap?: number;
  turnoverRate?: number;
  amplitude?: number;
  volumeRatio?: number;
  changeSpeed?: number;
  change5d?: number;
  change10d?: number;
  change20d?: number;
  change60d?: number;
  change120d?: number;
  change250d?: number;
  changeYtd?: number;
};

function optDec(
  v: { toNumber(): number } | number | string | null | undefined,
): number | undefined {
  if (v == null) return undefined;
  const n = dec(v);
  return Number.isFinite(n) ? n : undefined;
}

/** LB change ratios may arrive as 0.05 or 5 — normalize to percent points. */
function asPct(
  v: { toNumber(): number } | number | string | null | undefined,
): number | undefined {
  const n = optDec(v);
  if (n == null) return undefined;
  return Math.abs(n) <= 1.5 ? n * 100 : n;
}

/**
 * Batch Longbridge calc indexes for industry rank enrich.
 * Caps symbols; caches briefly to keep the 1GB host calm.
 */
export async function getLongbridgeCalcIndexes(
  symbols: string[],
  assetType: AssetType,
): Promise<SecurityCalcRow[]> {
  if (!hasLongbridgeCreds() || assetType === "crypto") return [];
  const trimmed = [
    ...new Set(
      symbols
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 48),
    ),
  ];
  if (!trimmed.length) return [];

  const lbSymbols = trimmed.map((s) => toLongbridgeSymbol(s, assetType));
  const cacheKey = `lb:calc:v2:${assetType}:${lbSymbols.join(",")}`;

  try {
    return await cachedFetch(cacheKey, 60_000, async () => {
      await loadLb();
      const ctx = await getQuoteCtx();
      // Numeric CalcIndex values — ambient const enum is not erasable under isolatedModules.
      const indexes = [
        5, // YtdChangeRate
        6, // TurnoverRate
        7, // TotalMarketValue
        9, // Amplitude
        10, // VolumeRatio
        14, // FiveDayChangeRate
        15, // TenDayChangeRate
        16, // HalfYearChangeRate
        17, // FiveMinutesChangeRate
      ];
      const rows = await ctx.calcIndexes(lbSymbols, indexes);
      return rows.map((r, idx) => {
        const symbol = String(r.symbol ?? lbSymbols[idx] ?? "");
        const localSymbol = normalizeSymbol(
          trimmed[idx] ?? symbol,
          assetType,
        ).toUpperCase();
        const marketCap = optDec(r.totalMarketValue);
        const turnoverRate = asPct(r.turnoverRate);
        const amplitude = asPct(r.amplitude);
        const volumeRatio = optDec(r.volumeRatio);
        const changeSpeed = asPct(r.fiveMinutesChangeRate);
        const change5d = asPct(r.fiveDayChangeRate);
        const change10d = asPct(r.tenDayChangeRate);
        const change120d = asPct(r.halfYearChangeRate);
        const changeYtd = asPct(r.ytdChangeRate);
        return {
          symbol,
          localSymbol,
          ...(marketCap != null && marketCap > 0 ? { marketCap } : {}),
          ...(turnoverRate != null ? { turnoverRate } : {}),
          ...(amplitude != null ? { amplitude } : {}),
          ...(volumeRatio != null ? { volumeRatio } : {}),
          ...(changeSpeed != null ? { changeSpeed } : {}),
          ...(change5d != null ? { change5d } : {}),
          ...(change10d != null ? { change10d } : {}),
          ...(change120d != null ? { change120d } : {}),
          ...(changeYtd != null ? { changeYtd } : {}),
        } satisfies SecurityCalcRow;
      });
    });
  } catch (err) {
    console.warn(
      "[longbridge-calc]",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

const ENRICH_KEYS = [
  "marketCap",
  "turnoverRate",
  "amplitude",
  "volumeRatio",
  "changeSpeed",
  "change5d",
  "change10d",
  "change20d",
  "change60d",
  "change120d",
  "change250d",
  "changeYtd",
] as const satisfies ReadonlyArray<keyof SecurityCalcRow>;

function mergeRow(
  base: SecurityCalcRow,
  extra: SecurityCalcRow | undefined,
): SecurityCalcRow {
  if (!extra) return base;
  const out: SecurityCalcRow = { ...base };
  for (const k of ENRICH_KEYS) {
    if (out[k] == null && extra[k] != null) {
      out[k] = extra[k];
    }
  }
  return out;
}

/**
 * Merge Longbridge calc + Futu snapshot + candle period returns by localSymbol.
 * Prefer Longbridge when both have a field; fill gaps from the others.
 */
export function mergeCalcRows(
  symbols: string[],
  assetType: AssetType,
  layers: SecurityCalcRow[][],
): SecurityCalcRow[] {
  const byLocal = new Map<string, SecurityCalcRow>();
  for (const layer of layers) {
    for (const row of layer) {
      const key = row.localSymbol.toUpperCase();
      const prev = byLocal.get(key);
      byLocal.set(key, prev ? mergeRow(prev, row) : row);
    }
  }
  return symbols.map((raw) => {
    const localSymbol = normalizeSymbol(raw, assetType).toUpperCase();
    return (
      byLocal.get(localSymbol) ?? {
        symbol: raw,
        localSymbol,
      }
    );
  });
}
