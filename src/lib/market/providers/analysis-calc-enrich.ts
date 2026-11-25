import { getPeriodReturnsFromCandles } from "@/lib/market/providers/analysis-period-returns";
import { getFutuCalcSnapshots } from "@/lib/market/providers/futu-calc-snapshot";
import {
  getLongbridgeCalcIndexes,
  mergeCalcRows,
  type SecurityCalcRow,
} from "@/lib/market/providers/longbridge-calc";
import type { AssetType } from "@/lib/types";

const PERIOD_BUDGET_MS = 5_000;

function withBudget<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

/**
 * Analysis board calc enrich: Longbridge indexes + Futu snapshot + capped
 * candle period returns. Soft-fails per layer so one broker cannot blank the row.
 * Period candles run under a short budget so the request path stays light.
 */
export async function getAnalysisCalcEnrich(
  symbols: string[],
  assetType: AssetType,
): Promise<SecurityCalcRow[]> {
  const trimmed = [
    ...new Set(
      symbols
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 48),
    ),
  ];
  if (!trimmed.length || assetType === "crypto") return [];

  const soft = <T,>(
    label: string,
    p: Promise<T>,
    fallback: T,
  ): Promise<T> =>
    p.catch((err) => {
      console.warn(
        `[analysis-calc] ${label}`,
        err instanceof Error ? err.message : err,
      );
      return fallback;
    });

  const [lb, futu] = await Promise.all([
    soft("lb", getLongbridgeCalcIndexes(trimmed, assetType), []),
    soft("futu", getFutuCalcSnapshots(trimmed, assetType), []),
  ]);

  // Candle fan-out is optional: fill cache over a few requests without wedging.
  const periods = await soft(
    "periods",
    withBudget(
      getPeriodReturnsFromCandles(trimmed, assetType),
      PERIOD_BUDGET_MS,
      [] as SecurityCalcRow[],
    ),
    [],
  );

  return mergeCalcRows(trimmed, assetType, [lb, futu, periods]);
}
