"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType } from "@/lib/types";

export type AlertRow = {
  id: string;
  symbol: string;
  assetType: AssetType;
  condition: "gte" | "lte";
  triggerPrice: number;
  status: "active" | "triggered" | "disabled";
};

type AlertsResponse = { alerts: AlertRow[] };

export function useAlerts(opts?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: queryKeys.alerts.list,
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchInterval,
    queryFn: () => fetchJson<AlertsResponse>("/api/alerts"),
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      symbol: string;
      assetType: AssetType;
      condition: "gte" | "lte";
      triggerPrice: number;
    }) =>
      fetchJson("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

export function usePatchAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; status?: string }) =>
      fetchJson("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/alerts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}
