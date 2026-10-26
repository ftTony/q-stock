"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

export type HealthPayload = {
  providers?: Record<string, boolean>;
  providerPriority?: string[];
};

export function useHealth(enabled = true) {
  return useQuery({
    queryKey: queryKeys.health,
    enabled,
    staleTime: 60_000,
    queryFn: () => fetchJson<HealthPayload>("/api/health"),
  });
}
