"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";
import type { ServiceCredsStatus } from "@/lib/user/service-creds-types";

export function useMarketCredentials(enabled = true) {
  return useQuery({
    queryKey: queryKeys.credentials.market,
    enabled,
    queryFn: () =>
      fetchJson<MarketCredsStatus>("/api/user/market-credentials"),
  });
}

export function useServiceCredentials(enabled = true) {
  return useQuery({
    queryKey: queryKeys.credentials.service("all"),
    enabled,
    queryFn: () =>
      fetchJson<ServiceCredsStatus>("/api/user/service-credentials"),
  });
}

export function useSaveMarketCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      fetchJson<MarketCredsStatus>("/api/user/market-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.credentials.market, data);
      await qc.invalidateQueries({ queryKey: queryKeys.credentials.market });
    },
  });
}

export function useDeleteMarketCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) =>
      fetchJson<MarketCredsStatus>(
        `/api/user/market-credentials?provider=${encodeURIComponent(provider)}`,
        { method: "DELETE" },
      ),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.credentials.market, data);
      await qc.invalidateQueries({ queryKey: queryKeys.credentials.market });
    },
  });
}

export function useSaveServiceCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      fetchJson<ServiceCredsStatus>("/api/user/service-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.credentials.service("all"), data);
      await qc.invalidateQueries({
        queryKey: queryKeys.credentials.service("all"),
      });
    },
  });
}

export function useDeleteServiceCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) =>
      fetchJson<ServiceCredsStatus>(
        `/api/user/service-credentials?provider=${encodeURIComponent(provider)}`,
        { method: "DELETE" },
      ),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.credentials.service("all"), data);
      await qc.invalidateQueries({
        queryKey: queryKeys.credentials.service("all"),
      });
    },
  });
}
