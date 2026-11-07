import { defaultLocale, type AppLocale } from "@/i18n/config";
import { LEARN_ARTICLES_CORE } from "@/lib/learn/articles-core";
import { LEARN_ARTICLES_SEO_CROSS_MARKET } from "@/lib/learn/articles-seo-cross-market";
import { LEARN_ARTICLES_SEO_DERIVATIVES } from "@/lib/learn/articles-seo-derivatives";
import { LEARN_ARTICLES_SEO_FUNDAMENTALS } from "@/lib/learn/articles-seo-fundamentals";
import { LEARN_ARTICLES_SEO_METHODS } from "@/lib/learn/articles-seo-methods";
import { LEARN_ARTICLES_SEO_PLANNING } from "@/lib/learn/articles-seo-planning";
import { LEARN_ARTICLES_SEO_STRATEGY } from "@/lib/learn/articles-seo-strategy";
import { LEARN_ARTICLES_SEO_TAX } from "@/lib/learn/articles-seo-tax";
import { LEARN_ARTICLES_READING } from "@/lib/learn/articles-reading";
import {
  readLearnArticleFile,
  readLearnIndex,
} from "@/lib/learn/snapshot";
import {
  LEARN_CATEGORIES,
  type LearnArticle,
  type LearnArticleListItem,
  type LearnCategory,
  type LearnLocaleMap,
} from "@/lib/learn/types";

export type {
  LearnArticle,
  LearnArticleListItem,
  LearnCategory,
} from "@/lib/learn/types";
export { LEARN_CATEGORIES };

/** Bundled seed — used when disk snapshot is missing. */
export const LEARN_ARTICLES_SEED: LearnArticle[] = [
  ...LEARN_ARTICLES_CORE,
  ...LEARN_ARTICLES_READING,
  ...LEARN_ARTICLES_SEO_CROSS_MARKET,
  ...LEARN_ARTICLES_SEO_METHODS,
  ...LEARN_ARTICLES_SEO_STRATEGY,
  ...LEARN_ARTICLES_SEO_FUNDAMENTALS,
  ...LEARN_ARTICLES_SEO_DERIVATIVES,
  ...LEARN_ARTICLES_SEO_PLANNING,
  ...LEARN_ARTICLES_SEO_TAX,
];

/** @deprecated Prefer listLearnArticleCards / getLearnArticle. */
export const LEARN_ARTICLES = LEARN_ARTICLES_SEED;

function seedAsCards(): LearnArticleListItem[] {
  return LEARN_ARTICLES_SEED.map((a) => ({
    slug: a.slug,
    category: a.category,
    ctaHref: a.ctaHref,
    title: a.title,
    summary: a.summary,
  }));
}

/** Lightweight list for /learn cards and related links (no full body). */
export function listLearnArticleCards(): LearnArticleListItem[] {
  const index = readLearnIndex();
  if (index?.length) return index;
  return seedAsCards();
}

export function listLearnSlugs(): string[] {
  return listLearnArticleCards().map((a) => a.slug);
}

/** Full articles — prefer disk; falls back to seed. Avoid on hot list paths. */
export function listLearnArticles(): LearnArticle[] {
  const cards = listLearnArticleCards();
  if (!readLearnIndex()?.length) return LEARN_ARTICLES_SEED;

  const out: LearnArticle[] = [];
  for (const item of cards) {
    const full = readLearnArticleFile(item.slug);
    if (full) out.push(full);
  }
  return out.length ? out : LEARN_ARTICLES_SEED;
}

export function getLearnArticle(slug: string): LearnArticle | null {
  const fromDisk = readLearnArticleFile(slug);
  if (fromDisk) return fromDisk;
  return LEARN_ARTICLES_SEED.find((a) => a.slug === slug) ?? null;
}

/**
 * Resolve localized copy.
 * Order: exact locale → zh-TW → zh-CN → en → defaultLocale.
 */
export function learnText<T>(locale: string, map: LearnLocaleMap<T>): T {
  const loc = locale as AppLocale;
  const direct = map[loc];
  if (direct != null) return direct;
  if (loc === "zh-TW" && map["zh-TW"] != null) return map["zh-TW"] as T;
  if (loc.startsWith("zh") && map["zh-CN"] != null) return map["zh-CN"] as T;
  if (map.en != null) return map.en;
  if (map["zh-CN"] != null) return map["zh-CN"] as T;
  return map[defaultLocale as AppLocale] as T;
}
