"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTradePinGate } from "@/components/trading/trade-pin-gate";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

/** Paper account / book — short stale keeps dock snappy without refetch storms. */
const TRADING_STALE_MS = 15_000;

export type AccountType = "cash" | "margin";

export function useTradingAccount(enabled = true, accountType: AccountType = "cash") {
  return useQuery({
    queryKey: [...queryKeys.trading.account, accountType] as const,
    enabled,
    staleTime: TRADING_STALE_MS,
    queryFn: () => fetchJson(`/api/trading/account?accountType=${accountType}`),
  });
}

export function useTradingPositions(
  opts?: { quotes?: boolean; enabled?: boolean; accountType?: AccountType },
) {
  const quotes = opts?.quotes ?? false;
  const accountType = opts?.accountType ?? "cash";
  return useQuery({
    queryKey: [...queryKeys.trading.positions, quotes, accountType] as const,
    enabled: opts?.enabled ?? true,
    staleTime: TRADING_STALE_MS,
    queryFn: () => {
      const params = new URLSearchParams({ accountType });
      if (quotes) params.set("quotes", "1");
      return fetchJson(`/api/trading/positions?${params}`);
    },
  });
}

export function useTradingOrders(
  opts?: {
    status?: string;
    symbol?: string;
    assetType?: string;
    accountType?: AccountType;
    enabled?: boolean;
  },
) {
  const status = opts?.status;
  const symbol = opts?.symbol;
  const assetType = opts?.assetType;
  const accountType = opts?.accountType ?? "cash";
  const params = new URLSearchParams({ accountType });
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
      accountType,
    ] as const,
    enabled: opts?.enabled ?? true,
    staleTime: TRADING_STALE_MS,
    queryFn: () =>
      fetchJson(qs ? `/api/trading/orders?${qs}` : "/api/trading/orders"),
  });
}

export function usePaperRiskSettings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trading.risk,
    enabled,
    staleTime: 60_000,
    queryFn: () => fetchJson("/api/trading/risk-settings"),
  });
}

export function useSavePaperRiskSettings() {
  const qc = useQueryClient();
  const { withPinGate } = useTradePinGate();
  return useMutation({
    mutationFn: (body: unknown) =>
      withPinGate((pin) =>
        fetchJson("/api/trading/risk-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-trade-pin": pin },
          body: JSON.stringify(body),
        }),
      ),
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

export type TradePasswordStatus = { enabled: boolean };

/** Whether the current user has configured a trade password. */
export function useTradePasswordStatus(enabled = true) {
  return useQuery({
    queryKey: queryKeys.trading.tradePassword,
    enabled,
    staleTime: 60_000,
    queryFn: () => fetchJson<TradePasswordStatus>("/api/trading/trade-password"),
  });
}

export function useSetTradePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { pin: string; currentPin?: string | null }) =>
      fetchJson<TradePasswordStatus>("/api/trading/trade-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.trading.tradePassword,
      });
    },
  });
}

export function useDisableTradePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pin: string) =>
      fetchJson<TradePasswordStatus>("/api/trading/trade-password", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.trading.tradePassword,
      });
    },
  });
}

/** Verify the login password (step 1 of the forgot-trade-PIN flow). */
export function useVerifyLoginPassword() {
  return useMutation({
    mutationFn: (loginPassword: string) =>
      fetchJson<{ ok: boolean }>("/api/trading/trade-password/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginPassword }),
      }),
  });
}

/** Reset a forgotten trade PIN by verifying the login password. */
export function useResetTradePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { loginPassword: string; pin: string }) =>
      fetchJson<TradePasswordStatus>("/api/trading/trade-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.trading.tradePassword,
      });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  const { withPinGate } = useTradePinGate();
  return useMutation({
    mutationFn: (id: string) =>
      withPinGate((pin) =>
        fetchJson(`/api/trading/orders?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { "x-trade-pin": pin },
        }),
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.all });
    },
  });
}

export function useModifyOrder() {
  const qc = useQueryClient();
  const { withPinGate } = useTradePinGate();
  return useMutation({
    mutationFn: (body: {
      id: string;
      qty: number;
      limitPrice?: number | null;
      stopPrice?: number | null;
    }) =>
      withPinGate((pin) =>
        fetchJson("/api/trading/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-trade-pin": pin },
          body: JSON.stringify(body),
        }),
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.trading.all });
    },
  });
}

export function useResetPaperAccount() {
  const qc = useQueryClient();
  const { withPinGate } = useTradePinGate();
  return useMutation({
    mutationFn: (accountType: AccountType = "cash") =>
      withPinGate((pin) =>
        fetchJson("/api/trading/account", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-trade-pin": pin },
          body: JSON.stringify({ action: "reset", accountType }),
        }),
      ),
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
