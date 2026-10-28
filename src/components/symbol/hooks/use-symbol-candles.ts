"use client";

import { useSymbolCandlesQuery } from "@/hooks/query/use-symbol-candles-query";
import type { AssetType, CandleResolution, OhlcvBar } from "@/lib/types";

/** Candle series for the symbol chart — backed by React Query. */
export function useSymbolCandles(
  symbol: string,
  assetType: AssetType,
  resolution: CandleResolution,
  opts?: { initialBars?: OhlcvBar[] | null },
) {
  return useSymbolCandlesQuery(symbol, assetType, resolution, opts);
}
