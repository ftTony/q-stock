import type { AppLocale } from "@/i18n/config";

export type LearnCategory = "basics" | "tools" | "mindset" | "reading";

export const LEARN_CATEGORIES: LearnCategory[] = [
  "basics",
  "tools",
  "mindset",
  "reading",
];

export type LearnLocaleMap<T> = Partial<Record<AppLocale, T>> & {
  en: T;
  "zh-CN": T;
};

export type LearnArticle = {
  slug: string;
  /** i18n key under learn.categories.* */
  category: LearnCategory;
  /** In-app path for the article CTA (e.g. /markets, /tools/dca). */
  ctaHref?: string;
  title: LearnLocaleMap<string>;
  summary: LearnLocaleMap<string>;
  paragraphs: LearnLocaleMap<string[]>;
};

/** List card / sitemap — no full body. */
export type LearnArticleListItem = Omit<LearnArticle, "paragraphs">;

export type LearnArticleStatus = "draft" | "published";
