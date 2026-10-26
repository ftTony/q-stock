"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType } from "@/lib/types";
import type { WatchlistItem } from "@/hooks/query/use-watchlist";

export type WatchlistGroup = {
  id: string;
  name: string;
  count?: number;
};

type GroupsResponse = { groups?: WatchlistGroup[] };
type GroupDetailResponse = { items?: WatchlistItem[] };

export function useWatchlistGroups(enabled = true) {
  return useQuery({
    queryKey: queryKeys.watchlist.groups,
    enabled,
    queryFn: () => fetchJson<GroupsResponse>("/api/watchlist/groups"),
  });
}

export function useWatchlistGroupDetail(groupId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.watchlist.group(groupId ?? ""),
    enabled: enabled && Boolean(groupId),
    queryFn: () =>
      fetchJson<GroupDetailResponse>(
        `/api/watchlist/groups/${encodeURIComponent(groupId!)}`,
      ),
  });
}

async function invalidateWatchlist(qc: ReturnType<typeof useQueryClient>) {
  await qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
}

export function useCreateWatchlistGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) =>
      fetchJson<{ group: WatchlistGroup }>("/api/watchlist/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await invalidateWatchlist(qc);
    },
  });
}

export function useUpdateWatchlistGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      symbolIds?: string[];
    }) =>
      fetchJson<{ group: WatchlistGroup }>(
        `/api/watchlist/groups/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ),
    onSuccess: async () => {
      await invalidateWatchlist(qc);
    },
  });
}

export function useDeleteWatchlistGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/watchlist/groups/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await invalidateWatchlist(qc);
    },
  });
}

export function useAddWatchlistGroupItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      ...body
    }: {
      groupId: string;
      symbol?: string;
      assetType?: AssetType;
      itemIds?: string[];
    }) =>
      fetchJson(
        `/api/watchlist/groups/${encodeURIComponent(groupId)}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ),
    onSuccess: async (_data, vars) => {
      await invalidateWatchlist(qc);
      await qc.invalidateQueries({
        queryKey: queryKeys.watchlist.group(vars.groupId),
      });
    },
  });
}

export function useRemoveWatchlistGroupItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      itemIds,
    }: {
      groupId: string;
      itemIds: string[];
    }) =>
      fetchJson(
        `/api/watchlist/groups/${encodeURIComponent(groupId)}/items`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds }),
        },
      ),
    onSuccess: async (_data, vars) => {
      await invalidateWatchlist(qc);
      await qc.invalidateQueries({
        queryKey: queryKeys.watchlist.group(vars.groupId),
      });
    },
  });
}
