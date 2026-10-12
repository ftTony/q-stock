import { defaultLocale, type AppLocale } from "@/i18n/config";
import { LEARN_ARTICLES_CORE } from "@/lib/learn/articles-core";
import { LEARN_ARTICLES_READING } from "@/lib/learn/articles-reading";
import type { LearnArticle, LearnCategory } from "@/lib/learn/types";

export type { LearnArticle, LearnCategory } from "@/lib/learn/types";

export const LEARN_ARTICLES: LearnArticle[] = [
  ...LEARN_ARTICLES_CORE,
  ...LEARN_ARTICLES_READING,
];

export const LEARN_CATEGORIES: LearnCategory[] = [
  "basics",
  "tools",
  "mindset",
  "reading",
];

export function listLearnArticles() {
  return LEARN_ARTICLES;
}

export function getLearnArticle(slug: string) {
  return LEARN_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function learnText<T extends string | string[]>(
  locale: string,
  map: Partial<Record<AppLocale, T>> & { en: T; "zh-CN": T },
): T {
  const loc = locale as AppLocale;
  if (map[loc] != null) return map[loc] as T;
  if (loc.startsWith("zh") && map["zh-CN"] != null) return map["zh-CN"];
  if (loc === "zh-TW" && map["zh-TW"] != null) return map["zh-TW"] as T;
  return map.en ?? map[defaultLocale as AppLocale] ?? map["zh-CN"];
}
