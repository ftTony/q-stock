"use client";

import { useQuery, type Query } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Quote } from "@/lib/types";

export type RankQuote = Quote & { name?: string };

export type BoardsPayload = {
  boards: {
    hot: RankQuote[];
    gainers: RankQuote[];
    losers: RankQuote[];
  };
};

export type NewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

export type SentimentPayload = {
  market?: {
    buzz_score?: number;
    sentiment_score?: number;
    bullish_pct?: number;
    bearish_pct?: number;
    trend?: string | null;
    available?: boolean;
    message?: string;
  } | null;
};

export type IndicesPayload = {
  indices?: Array<{
    id: string;
    symbol: string;
    nameKey: string;
    assetType: string;
    price: number | null;
    change: number | null;
    percentChange: number | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    previousClose?: number | null;
  }>;
};

type RefetchInterval<T> =
  | number
  | false
  | ((query: Query<T, Error>) => number | false | undefined);

export function useMarketNews(assetType: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.market.news(assetType),
    enabled,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<{ news?: NewsItem[] }>(
        `/api/news?assetType=${encodeURIComponent(assetType)}`,
      ),
  });
}

export function useMarketSentiment(assetType: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.market.sentiment(assetType),
    enabled,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<SentimentPayload>(
        `/api/sentiment?assetType=${encodeURIComponent(assetType)}`,
      ),
  });
}

export function useMarketBoards(
  assetType: string,
  opts?: {
    enabled?: boolean;
    refetchInterval?: RefetchInterval<BoardsPayload>;
  },
) {
  return useQuery({
    queryKey: queryKeys.market.boards(assetType),
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
    refetchInterval: opts?.refetchInterval,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<BoardsPayload> => {
      if (assetType === "crypto") {
        const data = await fetchJson<{ quotes?: RankQuote[] }>(
          `/api/quotes?popular=1&assetType=crypto`,
        );
        return {
          boards: {
            hot: data.quotes ?? [],
            gainers: [],
            losers: [],
          },
        };
      }
      const data = await fetchJson<{
        boards?: {
          hot?: RankQuote[];
          gainers?: RankQuote[];
          losers?: RankQuote[];
        };
      }>(
        `/api/ranks?assetType=${encodeURIComponent(assetType)}&board=all&limit=7`,
      );
      return {
        boards: {
          hot: data.boards?.hot ?? [],
          gainers: data.boards?.gainers ?? [],
          losers: data.boards?.losers ?? [],
        },
      };
    },
  });
}

export function useMarketIndices(
  assetType: string,
  opts?: {
    enabled?: boolean;
    refetchInterval?: RefetchInterval<IndicesPayload>;
  },
) {
  return useQuery({
    queryKey: queryKeys.market.indices(assetType),
    enabled: opts?.enabled ?? true,
    staleTime: 15_000,
    refetchInterval: opts?.refetchInterval,
    queryFn: () =>
      fetchJson<IndicesPayload>(
        `/api/indices?assetType=${encodeURIComponent(assetType)}`,
      ),
  });
}

export function useIndustryRanks(
  assetType: string,
  opts?: { limit?: number; enabled?: boolean },
) {
  const limit = opts?.limit ?? 40;
  return useQuery({
    queryKey: [...queryKeys.market.industryRanks(assetType), limit] as const,
    enabled: opts?.enabled ?? true,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson(
        `/api/industry-ranks?assetType=${encodeURIComponent(assetType)}&limit=${limit}`,
      ),
  });
}
