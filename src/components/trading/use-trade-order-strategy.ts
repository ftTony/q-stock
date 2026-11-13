"use client";

import { useEffect, useState } from "react";

/**
 * Order strategy tag seeded from Plan binding.
 * Changing the order tag never writes back to Plan.
 */
export function useTradeOrderStrategy(
  planStrategyId: string,
  planStrategyName: string | null,
  strategies: Array<{ id: string; name: string }>,
  symbol: string,
  assetType: string,
) {
  const [orderStrategyId, setOrderStrategyId] = useState(planStrategyId);
  const [orderStrategyName, setOrderStrategyName] = useState<string | null>(
    planStrategyName,
  );

  /** Reseed when symbol switches or Plan binding id changes — not on name-only. */
  useEffect(() => {
    setOrderStrategyId(planStrategyId);
    setOrderStrategyName(planStrategyName);
    // planStrategyName: take latest when rebinding id / symbol
    // eslint-disable-next-line react-hooks/exhaustive-deps -- name-only must not clobber overrides
  }, [symbol, assetType, planStrategyId]);

  /** If still on the plan tag, refresh readable name when Plan resolves it. */
  useEffect(() => {
    setOrderStrategyId((id) => {
      if (id === planStrategyId) setOrderStrategyName(planStrategyName);
      return id;
    });
  }, [planStrategyName, planStrategyId]);

  const setOrderStrategy = (id: string) => {
    setOrderStrategyId(id);
    setOrderStrategyName(strategies.find((s) => s.id === id)?.name ?? null);
  };

  const strategyDisplayName =
    strategies.find((s) => s.id === orderStrategyId)?.name ??
    (orderStrategyId === planStrategyId ? planStrategyName : null) ??
    orderStrategyName;

  return {
    orderStrategyId,
    setOrderStrategy,
    strategyDisplayName,
  };
}
