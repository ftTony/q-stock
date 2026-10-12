import type { AppLocale } from "@/i18n/config";

export type LearnCategory = "basics" | "tools" | "mindset" | "reading";

export type LearnArticle = {
  slug: string;
  /** i18n key under learn.categories.* */
  category: LearnCategory;
  /** In-app path for the article CTA (e.g. /markets, /tools/dca). */
  ctaHref?: string;
  title: Partial<Record<AppLocale, string>> & { en: string; "zh-CN": string };
  summary: Partial<Record<AppLocale, string>> & { en: string; "zh-CN": string };
  paragraphs: Partial<Record<AppLocale, string[]>> & {
    en: string[];
    "zh-CN": string[];
  };
};
