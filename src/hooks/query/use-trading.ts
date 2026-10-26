"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

export function useTradingAccount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trading.account,
    enabled,
    queryFn: () => fetchJson("/api/trading/account"),
  });
}

export function useTradingPositions(
  opts?: { quotes?: boolean; enabled?: boolean },
) {
  const quotes = opts?.quotes ?? false;
  return useQuery({
    queryKey: [...queryKeys.trading.positions, quotes] as const,
    enabled: opts?.enabled ?? true,
    queryFn: () =>
      fetchJson(
        `/api/trading/positions${quotes ? "?quotes=1" : ""}`,
      ),
  });
}

export function useTradingOrders(
  opts?: {
    status?: string;
    symbol?: string;
    assetType?: string;
    enabled?: boolean;
  },
) {
  const status = opts?.status;
  const symbol = opts?.symbol;
  const assetType = opts?.assetType;
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (symbol) params.set("symbol", symbol);
  if (assetType) params.set("assetType", assetType);
  const qs = params.toString();
  return useQuery({
    queryKey: [
      ...queryKeys.trading.orders,
      status ?? "all",
      symbol ?? "",
      assetType ?? "",
    ] as const,
    enabled: opts?.enabled ?? true,
    queryFn: () =>
      fetchJson(qs ? `/api/trading/orders?${qs}` : "/api/trading/orders"),
  });
}

export function usePaperRiskSettings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trading.risk,
    enabled,
    queryFn: () => fetchJson("/api/trading/risk-settings"),
  });
}

export function useSavePaperRiskSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      fetchJson("/api/trading/risk-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.risk });
    },
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      fetchJson("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.all });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/trading/orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.all });
    },
  });
}

export function useResetPaperAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/trading/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.all });
    },
  });
}

/** Invalidate all trading-related caches after place/cancel/reset. */
export function useInvalidateTrading() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.trading.all });
}
