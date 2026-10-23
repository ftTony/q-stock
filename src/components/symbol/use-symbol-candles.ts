"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isIntradayResolution,
  type AssetType,
  type CandleResolution,
  type OhlcvBar,
} from "@/lib/types";

/** Soft cap after merges — keeps 1GB host from growing unbounded in-memory. */
const MAX_BARS_INTRADAY = 900;
const MAX_BARS_DAILY = 2200;

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
        setHasMoreCandles(next.length > 0 && data.hasMore !== false);
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
        const intra = isIntradayResolution(resolution);
        let to: number;
        let from: number;
        if (intra) {
          // Previous session / day of minute bars (small chunks for 1GB host).
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
        const maxBars = intra ? MAX_BARS_INTRADAY : MAX_BARS_DAILY;
        setBars((prev) => {
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
