"use client";

import { useQuery, type Query } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType, Quote } from "@/lib/types";

type QuotePayload = { quote?: Quote | null };

type RefetchInterval =
  | number
  | false
  | ((query: Query<QuotePayload, Error>) => number | false | undefined);

export function useSymbolQuote(
  symbol: string,
  assetType: AssetType,
  opts?: {
    enabled?: boolean;
    refetchInterval?: RefetchInterval;
    initialQuote?: Quote | null;
  },
) {
  const initial = opts?.initialQuote;
  return useQuery({
    queryKey: queryKeys.symbol.quote(assetType, symbol),
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchInterval,
    initialData:
      initial && initial.price > 0 ? { quote: initial } : undefined,
    queryFn: () =>
      fetchJson<QuotePayload>(
        `/api/quotes?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      ),
  });
}
