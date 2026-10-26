"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

export type StrategyRow = {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  slug: string | null;
  updatedAt?: string;
};

export type ReplayRow = {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  assetType: string;
  status: string;
  createdAt: string;
  rangeFrom?: string | Date | null;
  rangeTo?: string | Date | null;
  result?: {
    totalReturnPct?: number;
    maxDrawdownPct?: number;
    tradeCount?: number;
    winRate?: number | null;
    buyHoldReturnPct?: number;
  } | null;
};

type StrategiesListResponse = {
  templates: StrategyRow[];
  strategies: StrategyRow[];
};

type ReplaysListResponse = {
  replays: ReplayRow[];
};

export function useStrategiesList(locale: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.strategies.list(locale),
    enabled,
    queryFn: () =>
      fetchJson<StrategiesListResponse>(
        `/api/strategies?locale=${encodeURIComponent(locale)}`,
      ),
  });
}

/** User-owned strategies only (trade panel / plan tags). */
export function useMyStrategies(enabled = true) {
  return useQuery({
    queryKey: ["strategies", "mine"] as const,
    enabled,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<{ strategies: Array<{ id: string; name: string }> }>(
        "/api/strategies?mine=1",
      ),
  });
}

export function useStrategyReplays(enabled = true) {
  return useQuery({
    queryKey: queryKeys.strategies.replays(),
    enabled,
    queryFn: () => fetchJson<ReplaysListResponse>("/api/strategies/replays"),
  });
}

export function useCopyStrategyTemplate(locale: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fromTemplateId: string) =>
      fetchJson<{
        strategy?: {
          id: string;
          name: string;
          description: string | null;
          rules: unknown;
          isTemplate: boolean;
        };
      }>("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromTemplateId }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.strategies.list(locale) });
    },
  });
}

export function useCreateBlankStrategy(locale: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description: string;
      rules: unknown;
    }) =>
      fetchJson<{ strategy?: { id: string } }>("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.strategies.list(locale) });
    },
  });
}

export type StrategyDetail = {
  id: string;
  name: string;
  description: string | null;
  rules: unknown;
  isTemplate: boolean;
  userId: string | null;
};

export function useStrategyDetail(
  strategyId: string,
  locale: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.strategies.detail(strategyId, locale),
    enabled: enabled && Boolean(strategyId),
    queryFn: () =>
      fetchJson<{ strategy: StrategyDetail }>(
        `/api/strategies/${encodeURIComponent(strategyId)}?locale=${encodeURIComponent(locale)}`,
      ),
  });
}

export function useUpdateStrategy(strategyId: string, locale: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description: string;
      rules: unknown;
    }) =>
      fetchJson<{ strategy: StrategyDetail }>(
        `/api/strategies/${encodeURIComponent(strategyId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.strategies.detail(strategyId, locale), data);
      await qc.invalidateQueries({
        queryKey: queryKeys.strategies.list(locale),
      });
    },
  });
}

/** Delete a user-owned strategy (templates are rejected by the API). */
export function useDeleteStrategy(locale: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (strategyId: string) =>
      fetchJson<{ ok: boolean }>(
        `/api/strategies/${encodeURIComponent(strategyId)}`,
        { method: "DELETE" },
      ),
    onSuccess: async (_data, strategyId) => {
      qc.removeQueries({
        queryKey: queryKeys.strategies.detail(strategyId, locale),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.strategies.list(locale),
      });
      await qc.invalidateQueries({ queryKey: ["strategies", "mine"] });
      await qc.invalidateQueries({ queryKey: queryKeys.strategies.replays() });
    },
  });
}

export function useStrategyReplayList(strategyId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.strategies.replays(strategyId),
    enabled: enabled && Boolean(strategyId),
    queryFn: () =>
      fetchJson<{
        replays: unknown[];
        quota?: { used: number; limit: number };
      }>(`/api/strategies/${encodeURIComponent(strategyId)}/replay`),
  });
}

export function useStrategyReplayDetail(
  strategyId: string,
  replayId: string | null,
  opts?: {
    enabled?: boolean;
    refetchInterval?:
      | number
      | false
      | ((
          query: import("@tanstack/react-query").Query<
            {
              replay: unknown;
              quota?: { used: number; limit: number };
            },
            Error
          >,
        ) => number | false | undefined);
  },
) {
  return useQuery({
    queryKey: ["strategies", "replay", strategyId, replayId] as const,
    enabled:
      (opts?.enabled ?? true) && Boolean(strategyId) && Boolean(replayId),
    refetchInterval: opts?.refetchInterval,
    queryFn: () =>
      fetchJson<{
        replay: unknown;
        quota?: { used: number; limit: number };
      }>(
        `/api/strategies/${encodeURIComponent(strategyId)}/replay?replayId=${encodeURIComponent(replayId!)}`,
      ),
  });
}

export function useStartStrategyReplay(strategyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      fetchJson<{
        replay?: unknown;
        quota?: { used: number; limit: number };
        error?: string;
      }>(`/api/strategies/${encodeURIComponent(strategyId)}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.strategies.replays(strategyId),
      });
      await qc.invalidateQueries({ queryKey: queryKeys.strategies.replays() });
    },
  });
}
