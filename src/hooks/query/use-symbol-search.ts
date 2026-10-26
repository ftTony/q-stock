"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import type { AssetType } from "@/lib/types";

type SearchResult = {
  symbol: string;
  description: string;
  assetType: AssetType;
};

type SearchResponse = { results: SearchResult[] };

export function useSymbolSearch(
  q: string,
  assetType: AssetType,
  enabled = true,
) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ["search", trimmed, assetType] as const,
    enabled: enabled && trimmed.length > 0,
    staleTime: 30_000,
    queryFn: () =>
      fetchJson<SearchResponse>(
        `/api/search?q=${encodeURIComponent(trimmed)}&assetType=${assetType}`,
      ),
  });
}
