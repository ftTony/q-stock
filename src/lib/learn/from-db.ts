import type { LearnArticle as DbArticle, LearnArticleLocale } from "@prisma/client";
import type { AppLocale } from "@/i18n/config";
import type { LearnArticle, LearnCategory } from "@/lib/learn/types";

type Row = DbArticle & { locales: LearnArticleLocale[] };

function asParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

/** Map DB row (+ locales) → in-app LearnArticle. Skips incomplete bilingual rows. */
export function dbRowToLearnArticle(row: Row): LearnArticle | null {
  const title: Partial<Record<AppLocale, string>> = {};
  const summary: Partial<Record<AppLocale, string>> = {};
  const paragraphs: Partial<Record<AppLocale, string[]>> = {};

  for (const loc of row.locales) {
    const locale = loc.locale as AppLocale;
    title[locale] = loc.title;
    summary[locale] = loc.summary;
    paragraphs[locale] = asParagraphs(loc.paragraphs);
  }

  if (!title["zh-CN"] || !title.en) return null;
  if (!summary["zh-CN"] || !summary.en) return null;
  if (!paragraphs["zh-CN"]?.length || !paragraphs.en?.length) return null;

  return {
    slug: row.slug,
    category: row.category as LearnCategory,
    ctaHref: row.ctaHref ?? undefined,
    title: title as LearnArticle["title"],
    summary: summary as LearnArticle["summary"],
    paragraphs: paragraphs as LearnArticle["paragraphs"],
  };
}
