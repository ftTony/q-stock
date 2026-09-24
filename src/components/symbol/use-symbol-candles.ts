"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AssetType, CandleResolution, OhlcvBar } from "@/lib/types";

export function useSymbolCandles(
  symbol: string,
  assetType: AssetType,
  resolution: CandleResolution,
) {
  const [bars, setBars] = useState<OhlcvBar[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMoreCandles, setLoadingMoreCandles] = useState(false);
  const [hasMoreCandles, setHasMoreCandles] = useState(true);
  const loadMoreLock = useRef(false);

  const loadCandles = useCallback(async () => {
    setLoadingChart(true);
    setHasMoreCandles(true);
    loadMoreLock.current = false;
    try {
      const res = await fetch(
        `/api/candles?symbol=${symbol}&assetType=${assetType}&resolution=${resolution}`,
      );
      const data = await res.json();
      if (res.ok) {
        const next = (data.bars ?? []) as OhlcvBar[];
        setBars(next);
        setHasMoreCandles(next.length > 0);
      }
    } finally {
      setLoadingChart(false);
    }
  }, [symbol, assetType, resolution]);

  const loadMoreCandles = useCallback(
    async (earliestTime: number): Promise<OhlcvBar[]> => {
      if (loadMoreLock.current || !hasMoreCandles || !earliestTime) return [];
      loadMoreLock.current = true;
      setLoadingMoreCandles(true);
      try {
        const chunkDays =
          resolution === "D" ? 280 : resolution === "Q" ? 1200 : 2500;
        const to = earliestTime - 86400;
        const from = to - chunkDays * 86400;
        if (to <= 0 || from >= to) {
          setHasMoreCandles(false);
          return [];
        }
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&resolution=${resolution}&from=${from}&to=${to}&indicators=0`,
        );
        const data = await res.json();
        if (!res.ok) {
          setHasMoreCandles(false);
          return [];
        }
        const older = (data.bars ?? []) as OhlcvBar[];
        if (!older.length) {
          setHasMoreCandles(false);
          return [];
        }
        setBars((prev) => {
          const byTime = new Map<number, OhlcvBar>();
          for (const b of older) byTime.set(b.time, b);
          for (const b of prev) byTime.set(b.time, b);
          const merged = [...byTime.values()].sort((a, b) => a.time - b.time);
          if (older.length < 5) setHasMoreCandles(false);
          return merged;
        });
        return older;
      } finally {
        setLoadingMoreCandles(false);
        setTimeout(() => {
          loadMoreLock.current = false;
        }, 400);
      }
    },
    [symbol, assetType, resolution, hasMoreCandles],
  );

  useEffect(() => {
    void loadCandles();
  }, [loadCandles]);

  return {
    bars,
    loadingChart,
    loadingMoreCandles,
    hasMoreCandles,
    loadMoreCandles,
  };
}
