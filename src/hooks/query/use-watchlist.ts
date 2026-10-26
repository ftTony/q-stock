"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType, Quote } from "@/lib/types";

export type WatchlistItem = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote?: Quote | null;
};

type WatchlistResponse = {
  items: WatchlistItem[];
};

export function useWatchlist(opts?: {
  quotes?: boolean;
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  const quotes = opts?.quotes ?? false;
  return useQuery({
    queryKey: queryKeys.watchlist.list(quotes),
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchInterval,
    queryFn: () =>
      fetchJson<WatchlistResponse>(
        `/api/watchlist${quotes ? "?quotes=1" : ""}`,
      ),
  });
}

export function useAddWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { symbol: string; assetType: AssetType }) =>
      fetchJson("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });
}

export function useRemoveWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      target: string | { symbol: string; assetType: AssetType },
    ) => {
      if (typeof target === "string") {
        return fetchJson(`/api/watchlist?id=${encodeURIComponent(target)}`, {
          method: "DELETE",
        });
      }
      return fetchJson(
        `/api/watchlist?symbol=${encodeURIComponent(target.symbol)}&assetType=${encodeURIComponent(target.assetType)}`,
        { method: "DELETE" },
      );
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });
}
