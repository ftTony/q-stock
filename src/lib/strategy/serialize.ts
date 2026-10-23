import type { Strategy, StrategyReplay } from "@prisma/client";
import { STRATEGY_TEMPLATES } from "@/lib/strategy/templates";

export function serializeStrategy(s: Strategy, locale?: string) {
  let name = s.name;
  let description = s.description;
  if (s.isTemplate && s.slug) {
    const def = STRATEGY_TEMPLATES.find((t) => t.slug === s.slug);
    if (def) {
      const en = !(locale ?? "en").toLowerCase().startsWith("zh");
      name = en ? def.nameEn : def.nameZh;
      description = en ? def.descriptionEn : def.descriptionZh;
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
