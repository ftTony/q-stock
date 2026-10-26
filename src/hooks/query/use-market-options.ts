"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import type { AssetType } from "@/lib/types";

type OptionsMeta = {
  unavailable?: boolean;
  code?: string;
  detail?: string;
  expiries?: string[];
};

type OptionsChain = OptionsMeta & {
  calls?: unknown[];
  puts?: unknown[];
};

export function useMarketOptionsMeta(
  symbol: string,
  assetType: AssetType,
  enabled = true,
) {
  return useQuery({
    queryKey: ["market", "options-meta", assetType, symbol] as const,
    enabled,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<OptionsMeta>(
        `/api/market/options?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      ),
  });
}

export function useMarketOptionsChain(opts: {
  symbol: string;
  assetType: AssetType;
  expiry: string | null;
  spot: number;
  enabled?: boolean;
}) {
  const { symbol, assetType, expiry, spot, enabled = true } = opts;
  return useQuery({
    queryKey: ["market", "options", assetType, symbol, expiry, spot] as const,
    enabled: enabled && Boolean(expiry),
    staleTime: 30_000,
    queryFn: () => {
      const qs = new URLSearchParams({
        symbol,
        assetType,
        expiry: expiry!,
        spot: String(spot),
      });
      return fetchJson<OptionsChain>(`/api/market/options?${qs}`);
    },
  });
}
