import type { LearnLink, LearnLocaleMap } from "@/lib/learn/types";
import { LEARN_SEO_OVERRIDES } from "@/lib/learn/article-seo-overrides-data";

function linkCount(map?: LearnLocaleMap<LearnLink[]>): number {
  if (!map) return 0;
  return Math.max(map.en?.length ?? 0, map["zh-CN"]?.length ?? 0);
}

/** Merge SEO overrides onto a loaded article (links fill gaps; title/summary replace when set). */
export function applyLearnSeoOverrides<T extends {
  slug: string;
  links?: LearnLocaleMap<LearnLink[]>;
  summary: LearnLocaleMap<string>;
  title: LearnLocaleMap<string>;
}>(article: T): T {
  const patch = LEARN_SEO_OVERRIDES[article.slug];
  if (!patch) return article;
  const preferPatchLinks =
    !!patch.links && linkCount(patch.links) > linkCount(article.links);
  return {
    ...article,
    title: patch.title ?? article.title,
    summary: patch.summary ?? article.summary,
    links: preferPatchLinks ? patch.links : (article.links ?? patch.links),
  };
}

export { LEARN_SEO_OVERRIDES } from "@/lib/learn/article-seo-overrides-data";
