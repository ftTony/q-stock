"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mergeWatchlistQuote } from "@/components/symbol/watchlist/merge-watchlist-quote";
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

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      const apply = (quote: Parameters<typeof mergeWatchlistQuote>[1]) => {
        qc.setQueryData(
          queryKeys.watchlist.list(true),
          (prev: { items: WatchlistItem[] } | undefined) =>
            mergeWatchlistQuote(prev, quote),
        );
      };
      if (msg.op === "quote" && msg.quote.price > 0) {
        apply(msg.quote);
        return;
      }
      if (msg.op === "snapshot" && msg.quotes?.length) {
        for (const q of msg.quotes) {
          if (q.price > 0) apply(q);
        }
      }
    },
    [qc],
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
