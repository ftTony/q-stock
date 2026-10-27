"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import type { WarrantKind, WarrantRow } from "@/lib/market/providers/longbridge-warrants";
import type { AssetType } from "@/lib/types";

type WarrantsPayload = {
  unavailable?: boolean;
  code?: string;
  detail?: string;
  rows?: WarrantRow[];
};

export function useMarketWarrants(opts: {
  symbol: string;
  assetType: AssetType;
  types: WarrantKind[];
  enabled?: boolean;
}) {
  const { symbol, assetType, types, enabled = true } = opts;
  const typeKey = [...types].sort().join(",");
  return useQuery({
    queryKey: ["market", "warrants", assetType, symbol, typeKey] as const,
    enabled: enabled && assetType === "hk" && types.length > 0,
    staleTime: 60_000,
    queryFn: () => {
      const qs = new URLSearchParams({
        symbol,
        assetType,
        types: typeKey,
      });
      return fetchJson<WarrantsPayload>(`/api/market/warrants?${qs}`);
    },
  });
}
