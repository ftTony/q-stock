import type { Strategy, StrategyReplay } from "@prisma/client";

export function serializeStrategy(s: Strategy) {
  return {
    id: s.id,
    userId: s.userId,
    slug: s.slug,
    name: s.name,
    description: s.description,
    rules: s.rules,
    isTemplate: s.isTemplate,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serializeReplay(r: StrategyReplay) {
  return {
    id: r.id,
    userId: r.userId,
    strategyId: r.strategyId,
    symbol: r.symbol,
    assetType: r.assetType,
    rangeFrom: r.rangeFrom,
    rangeTo: r.rangeTo,
    assumptions: r.assumptions,
    status: r.status,
    result: r.result,
    error: r.error,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
