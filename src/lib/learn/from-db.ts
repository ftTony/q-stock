import type { LearnArticle as DbArticle, LearnArticleLocale } from "@prisma/client";
import type { AppLocale } from "@/i18n/config";
import type {
  LearnArticle,
  LearnBlock,
  LearnCategory,
  LearnFaqItem,
  LearnLink,
} from "@/lib/learn/types";

type Row = DbArticle & { locales: LearnArticleLocale[] };

/**
 * `LearnArticleLocale.paragraphs` is a Json column. Legacy rows store a plain
 * string[]; rich articles store `{ v: 2, paragraphs, sections, faq, ... }`.
 * Both shapes must round-trip, otherwise rebuilding the snapshot from the DB
 * silently strips headings, tables and FAQ from every article.
 */
type RichBody = {
  v?: number;
  paragraphs?: unknown;
  sections?: unknown;
  faq?: unknown;
  links?: unknown;
  sourceNote?: unknown;
  author?: unknown;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function asBlocks(value: unknown): LearnBlock[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as LearnBlock[];
}

function asFaq(value: unknown): LearnFaqItem[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as LearnFaqItem[];
}

function asLinks(value: unknown): LearnLink[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as LearnLink[];
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readBody(json: unknown): {
  paragraphs: string[];
  sections?: LearnBlock[];
  faq?: LearnFaqItem[];
  links?: LearnLink[];
  sourceNote?: string;
  author?: string;
} {
  if (Array.isArray(json)) return { paragraphs: asStringArray(json) };
  if (json && typeof json === "object") {
    const body = json as RichBody;
    const paragraphs = asStringArray(body.paragraphs);
    const sections = asBlocks(body.sections);
    return {
      // Rich articles keep a short prose fallback; derive one if absent.
      paragraphs:
        paragraphs.length > 0
          ? paragraphs
          : (sections ?? [])
              .filter((b): b is { type: "p"; text: string } => b.type === "p")
              .map((b) => b.text),
      sections,
      faq: asFaq(body.faq),
      links: asLinks(body.links),
      sourceNote: asText(body.sourceNote),
      author: asText(body.author),
    };
  }
  return { paragraphs: [] };
}

/** Map DB row (+ locales) → in-app LearnArticle. Skips incomplete bilingual rows. */
export function dbRowToLearnArticle(row: Row): LearnArticle | null {
  const title: Partial<Record<AppLocale, string>> = {};
  const summary: Partial<Record<AppLocale, string>> = {};
  const paragraphs: Partial<Record<AppLocale, string[]>> = {};
  const sections: Partial<Record<AppLocale, LearnBlock[]>> = {};
  const faq: Partial<Record<AppLocale, LearnFaqItem[]>> = {};
  const links: Partial<Record<AppLocale, LearnLink[]>> = {};
  const sourceNote: Partial<Record<AppLocale, string>> = {};
  let author: string | undefined;

  for (const loc of row.locales) {
    const locale = loc.locale as AppLocale;
    const body = readBody(loc.paragraphs);
    title[locale] = loc.title;
    summary[locale] = loc.summary;
    paragraphs[locale] = body.paragraphs;
    if (body.sections) sections[locale] = body.sections;
    if (body.faq) faq[locale] = body.faq;
    if (body.links) links[locale] = body.links;
    if (body.sourceNote) sourceNote[locale] = body.sourceNote;
    if (!author && body.author) author = body.author;
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
    ...(Object.keys(sections).length
      ? { sections: sections as LearnArticle["sections"] }
      : {}),
    ...(Object.keys(faq).length ? { faq: faq as LearnArticle["faq"] } : {}),
    ...(Object.keys(links).length
      ? { links: links as LearnArticle["links"] }
      : {}),
    ...(Object.keys(sourceNote).length
      ? { sourceNote: sourceNote as LearnArticle["sourceNote"] }
      : {}),
    ...(author ? { author } : {}),
    ...(row.publishedAt
      ? { publishedAt: row.publishedAt.toISOString().slice(0, 10) }
      : {}),
    ...(row.updatedAt
      ? { updatedAt: row.updatedAt.toISOString().slice(0, 10) }
      : {}),
  };
}
