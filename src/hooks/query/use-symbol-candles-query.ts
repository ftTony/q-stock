"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import {
  isIntradayResolution,
  type AssetType,
  type CandleResolution,
  type OhlcvBar,
} from "@/lib/types";

/** Soft cap after merges — keeps 1GB host from growing unbounded in-memory. */
const MAX_BARS_INTRADAY = 900;
const MAX_BARS_DAILY = 2200;

type CandlesPayload = {
  bars?: OhlcvBar[];
  hasMore?: boolean;
};

export function useSymbolCandlesQuery(
  symbol: string,
  assetType: AssetType,
  resolution: CandleResolution,
  opts?: { initialBars?: OhlcvBar[] | null },
) {
  const qc = useQueryClient();
  const key = queryKeys.symbol.candles(assetType, symbol, resolution);
  const loadMoreLock = useRef(false);
  const [loadingMoreCandles, setLoadingMoreCandles] = useState(false);
  const [hasMoreCandles, setHasMoreCandles] = useState(true);
  const initialBars =
    resolution === "D" && opts?.initialBars?.length
      ? opts.initialBars
      : undefined;

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await fetchJson<CandlesPayload>(
        `/api/candles?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&resolution=${resolution}`,
      );
      const next = data.bars ?? [];
      setHasMoreCandles(next.length > 0 && data.hasMore !== false);
      return next;
    },
    initialData: initialBars,
    // Daily+ bars change slowly; intraday stays on global 30s default.
    staleTime: isIntradayResolution(resolution) ? 30_000 : 90_000,
  });

  const loadMoreCandles = useCallback(
    async (earliestTime: number): Promise<OhlcvBar[]> => {
      if (loadMoreLock.current || !hasMoreCandles || !earliestTime) return [];
      loadMoreLock.current = true;
      setLoadingMoreCandles(true);
      try {
        const intra = isIntradayResolution(resolution);
        let to: number;
        let from: number;
        if (intra) {
          const chunkSec =
            resolution === "5" ? 2 * 86400 : resolution === "1" ? 86400 : 86400;
          to = earliestTime - 60;
          from = to - chunkSec;
        } else {
          const chunkDays =
            resolution === "D" ? 280 : resolution === "Q" ? 1200 : 2500;
          to = earliestTime - 86400;
          from = to - chunkDays * 86400;
        }
        if (to <= 0 || from >= to) {
          setHasMoreCandles(false);
          return [];
        }
        const data = await fetchJson<CandlesPayload>(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&resolution=${resolution}&from=${from}&to=${to}&indicators=0`,
        );
        const older = data.bars ?? [];
        if (!older.length) {
          setHasMoreCandles(false);
          return [];
        }
        const maxBars = intra ? MAX_BARS_INTRADAY : MAX_BARS_DAILY;
        qc.setQueryData<OhlcvBar[]>(key, (prev = []) => {
          const byTime = new Map<number, OhlcvBar>();
          for (const b of older) byTime.set(b.time, b);
          for (const b of prev) byTime.set(b.time, b);
          const merged = [...byTime.values()].sort((a, b) => a.time - b.time);
          if (
            older.length < 5 ||
            data.hasMore === false ||
            merged.length >= maxBars
          ) {
            setHasMoreCandles(false);
          }
          return merged;
        });
        return older;
      } catch {
        setHasMoreCandles(false);
        return [];
      } finally {
        setLoadingMoreCandles(false);
        setTimeout(() => {
          loadMoreLock.current = false;
        }, 400);
      }
    },
    [symbol, assetType, resolution, hasMoreCandles, qc, key],
  );

  const bars = query.data ?? [];
  return {
    bars,
    // Overlay while fetching a period with no bars yet (avoids empty remount flash).
    loadingChart: query.isFetching && bars.length === 0,
    loadingMoreCandles,
    hasMoreCandles,
    loadMoreCandles,
  };
}
