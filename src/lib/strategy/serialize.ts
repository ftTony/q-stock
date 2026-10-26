import type { Strategy, StrategyReplay } from "@prisma/client";
import { localizedTemplateCopy } from "@/lib/strategy/templates";

export function serializeStrategy(s: Strategy, locale?: string) {
  let name = s.name;
  let description = s.description;
  if (s.isTemplate && s.slug) {
    const copy = localizedTemplateCopy(s.slug, locale);
    if (copy) {
      name = copy.name;
      description = copy.description;
    }
  }
  return {
    id: s.id,
    userId: s.userId,
    slug: s.slug,
    name,
    description,
    rules: s.rules,
    isTemplate: s.isTemplate,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serializeReplay(r: StrategyReplay, opts?: { public?: boolean }) {
  const base = {
    id: r.id,
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
    shared: Boolean(r.shareToken),
  };
  if (opts?.public) {
    return base;
  }
  return {
    ...base,
    userId: r.userId,
    shareToken: r.shareToken,
  };
}

export function serializeLabReport(
  r: {
    id: string;
    userId: string;
    kind: string;
    cost: number;
    request: unknown;
    status: string;
    result: unknown;
    error: string | null;
    shareToken: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  opts?: { public?: boolean },
) {
  const base = {
    id: r.id,
    kind: r.kind,
    cost: r.cost,
    request: r.request,
    status: r.status,
    result: r.result,
    error: r.error,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    shared: Boolean(r.shareToken),
  };
  if (opts?.public) {
    return base;
  }
  return {
    ...base,
    userId: r.userId,
    shareToken: r.shareToken,
  };
}
