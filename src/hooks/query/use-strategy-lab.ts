"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { ReplayApiError } from "@/lib/strategy/replay-errors";

async function postLab<T extends object>(
  url: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & ReplayApiError;
  if (!res.ok) {
    const err = new Error(
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`,
    ) as Error & { payload: ReplayApiError };
    err.payload = {
      code: data.code,
      error: data.error,
      used: data.used,
      limit: data.limit,
    };
    throw err;
  }
  return data;
}

export type LabTunable = {
  id: string;
  label: string;
  current: number;
  presets: number[];
};

export type LabQuota = { used: number; limit: number };

export type LabReport = {
  id: string;
  kind: string;
  status: string;
  shareToken?: string | null;
  error?: string | null;
  result?: {
    legs?: unknown[];
    rows?: unknown[];
  };
};

type LabReportResponse = { report?: LabReport };

export function useStrategyParamGrid(strategyId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.strategies.paramGrid(strategyId),
    enabled: enabled && Boolean(strategyId),
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<{ params?: LabTunable[] }>(
        `/api/strategies/${encodeURIComponent(strategyId)}/param-grid`,
      ),
  });
}

export function useLabReport(reportId: string | null) {
  return useQuery({
    queryKey: queryKeys.strategies.labReport(reportId ?? ""),
    enabled: Boolean(reportId),
    refetchInterval: (query) => {
      const status = query.state.data?.report?.status;
      if (status === "done" || status === "failed") return false;
      return 2_000;
    },
    queryFn: () =>
      fetchJson<LabReportResponse>(
        `/api/strategies/lab-reports/${encodeURIComponent(reportId!)}`,
      ),
  });
}

export function useShareLabReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      revoke,
    }: {
      reportId: string;
      revoke: boolean;
    }) =>
      fetchJson<LabReportResponse>(
        `/api/strategies/lab-reports/${encodeURIComponent(reportId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revoke }),
        },
      ),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.strategies.labReport(vars.reportId),
      });
    },
  });
}

type LabRunBody = {
  symbol: string;
  assetType: string;
  rangeFrom: string;
  rangeTo: string;
};

type LabRunResult = {
  report?: LabReport;
  quota?: LabQuota;
  error?: string;
  code?: string;
};

export function useRunStrategyCompare() {
  return useMutation({
    mutationFn: (body: LabRunBody & {
      strategyIdA: string;
      strategyIdB: string;
    }) => postLab<LabRunResult>("/api/strategies/compare", body),
  });
}

export function useRunStrategyParamGrid(strategyId: string) {
  return useMutation({
    mutationFn: (
      body: LabRunBody & { paramId: string; values: number[] },
    ) =>
      postLab<LabRunResult>(
        `/api/strategies/${encodeURIComponent(strategyId)}/param-grid`,
        body,
      ),
  });
}

export function useRunStrategyBasket() {
  return useMutation({
    mutationFn: (
      body: Omit<LabRunBody, "symbol"> & {
        strategyId: string;
        symbols: string[];
      },
    ) => postLab<LabRunResult>("/api/strategies/basket", body),
  });
}

export function useShareReplay() {
  return useMutation({
    mutationFn: ({
      replayId,
      revoke,
    }: {
      replayId: string;
      revoke: boolean;
    }) =>
      fetchJson<{
        replay?: { shareToken?: string | null };
        error?: string;
      }>(`/api/strategies/replays/${encodeURIComponent(replayId)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revoke }),
      }),
  });
}

export type ReplayAiReview = {
  processSummary: string;
  whatStoodOut: string[];
  overfittingRisks: string[];
  nextChecklist: string[];
  disclaimer: string;
  error?: string;
};

export function useReplayAiReview() {
  return useMutation({
    mutationFn: ({
      replayId,
      locale,
    }: {
      replayId: string;
      locale: string;
    }) =>
      fetchJson<ReplayAiReview>(
        `/api/strategies/replays/${encodeURIComponent(replayId)}/ai-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        },
      ),
  });
}
