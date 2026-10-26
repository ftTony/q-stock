"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

type AiQuota = {
  used?: number;
  limit?: number;
  remaining?: number;
};

export function useAiQuota(enabled = true) {
  return useQuery({
    queryKey: queryKeys.ai.quota,
    enabled,
    staleTime: 60_000,
    queryFn: () => fetchJson<AiQuota>("/api/ai/quota"),
  });
}
