export type {
  StrategyTemplateDef,
  StrategyTemplateMeta,
} from "@/lib/strategy/template-types";
export { STRATEGY_TEMPLATES } from "@/lib/strategy/template-catalog";

import { STRATEGY_TEMPLATES } from "@/lib/strategy/template-catalog";
import type { StrategyTemplateMeta } from "@/lib/strategy/template-types";

export function templateMetaBySlug(
  slug: string | null | undefined,
): StrategyTemplateMeta | null {
  if (!slug) return null;
  return STRATEGY_TEMPLATES.find((t) => t.slug === slug)?.meta ?? null;
}

export function isZhLocale(locale?: string | null): boolean {
  const l = (locale ?? "en").toLowerCase().replace(/_/g, "-");
  return l === "zh-cn" || l === "zh-tw" || l.startsWith("zh");
}

export function localizedTemplateCopy(
  slug: string | null | undefined,
  locale?: string | null,
): { name: string; description: string } | null {
  if (!slug) return null;
  const def = STRATEGY_TEMPLATES.find((t) => t.slug === slug);
  if (!def) return null;
  const zh = isZhLocale(locale);
  return {
    name: zh ? def.nameZh : def.nameEn,
    description: zh ? def.descriptionZh : def.descriptionEn,
  };
}

export const TEMPLATE_SLUG_ORDER = STRATEGY_TEMPLATES.map((t) => t.slug);

export function sortTemplatesBySlugOrder<T extends { slug: string | null }>(
  rows: T[],
): T[] {
  const rank = new Map(TEMPLATE_SLUG_ORDER.map((s, i) => [s, i]));
  return [...rows].sort((a, b) => {
    const ra = a.slug != null ? (rank.get(a.slug) ?? 999) : 999;
    const rb = b.slug != null ? (rank.get(b.slug) ?? 999) : 999;
    return ra - rb;
  });
}
