"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mergeWatchlistQuotes } from "@/components/symbol/watchlist/merge-watchlist-quote";
import {
  useWatchlist,
  type WatchlistItem,
} from "@/hooks/query/use-watchlist";
import { useQuoteChannels } from "@/hooks/use-quote-socket";
import type { ServerMessage, StreamChannel } from "@/lib/market/stream/protocol";
import { queryKeys } from "@/lib/query/keys";

/** Align with `/api/watchlist` quote fan-out cap. */
export const WATCHLIST_QUOTE_PUSH_CAP = 80;

/**
 * Watchlist rows + quote-ws merge.
 * HTTP poll: 60s when broker push is live, else 45s (or off when `live` is false).
 */
export function useWatchlistWithLiveQuotes(live: boolean) {
  const qc = useQueryClient();
  const [pollMs, setPollMs] = useState<number | false>(45_000);

  const watchlist = useWatchlist({
    quotes: true,
    enabled: live,
    refetchInterval: live ? pollMs : false,
  });

  const items = watchlist.data?.items ?? [];

  const channels = useMemo((): StreamChannel[] => {
    if (!live || items.length === 0) return [];
    return items.slice(0, WATCHLIST_QUOTE_PUSH_CAP).map((row) => ({
      type: "symbol" as const,
      assetType: row.assetType,
      symbol: row.symbol,
    }));
  }, [items, live]);

  // Batch WS ticks into a single cache write per frame (throttled to ~100ms).
  // Without this, a snapshot of N symbols triggers N setQueryData calls and N
  // full watchlist renders; the buffer collapses them into one.
  const pendingRef = useRef<Map<string, Parameters<typeof mergeWatchlistQuotes>[1][number]>>(
    new Map(),
  );
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFlushRef = useRef(0);

  const flushPending = useCallback(() => {
    rafRef.current = null;
    flushTimerRef.current = null;
    const batch = pendingRef.current;
    if (batch.size === 0) return;
    pendingRef.current = new Map();
    lastFlushRef.current = performance.now();
    const quotes = Array.from(batch.values());
    qc.setQueryData(
      queryKeys.watchlist.list(true),
      (prev: { items: WatchlistItem[] } | undefined) =>
        mergeWatchlistQuotes(prev, quotes),
    );
  }, [qc]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current != null || rafRef.current != null) return;
    const wait = Math.max(0, 100 - (performance.now() - lastFlushRef.current));
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      rafRef.current = requestAnimationFrame(flushPending);
    }, wait);
  }, [flushPending]);

  // Cancel pending work if the hook unmounts (e.g. watchlist panel closed).
  useEffect(
    () => () => {
      if (flushTimerRef.current != null) clearTimeout(flushTimerRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      pendingRef.current.clear();
    },
    [],
  );

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      const queue = (quote: Parameters<typeof mergeWatchlistQuotes>[1][number]) => {
        if (!(quote.price > 0)) return;
        // Last tick per symbol wins within the batch.
        pendingRef.current.set(`${quote.assetType}:${quote.symbol}`, quote);
        scheduleFlush();
      };
      if (msg.op === "quote") {
        queue(msg.quote);
        return;
      }
      if (msg.op === "snapshot" && msg.quotes?.length) {
        for (const q of msg.quotes) queue(q);
      }
    },
    [scheduleFlush],
  );

  const { enabled, connected, degraded, push } = useQuoteChannels(
    live ? channels : null,
    onMessage,
  );

  const pushOk = live && enabled && connected && push && !degraded;

  useEffect(() => {
    if (!live) {
      setPollMs(false);
      return;
    }
    setPollMs(pushOk ? 60_000 : 45_000);
  }, [live, pushOk]);

  return watchlist;
}
