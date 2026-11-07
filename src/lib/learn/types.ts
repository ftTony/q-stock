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

/**
 * Rich body block. `sections` supersedes the legacy `paragraphs` string array:
 * paragraphs can only express prose + auto-detected numbered steps, which gives
 * crawlers no heading hierarchy and nowhere to anchor long-tail queries.
 */
export type LearnBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "note"; text: string };

export type LearnFaqItem = { q: string; a: string };

export type LearnLink = { label: string; href: string };

export type LearnArticle = {
  slug: string;
  /** i18n key under learn.categories.* */
  category: LearnCategory;
  /** In-app path for the article CTA (e.g. /markets, /tools/dca). */
  ctaHref?: string;
  title: LearnLocaleMap<string>;
  summary: LearnLocaleMap<string>;
  /** Legacy body: first paragraph is the lead, numbered lines become step cards. */
  paragraphs: LearnLocaleMap<string[]>;
  /** Preferred body when present. */
  sections?: LearnLocaleMap<LearnBlock[]>;
  faq?: LearnLocaleMap<LearnFaqItem[]>;
  /** Hand-picked internal links (tools / symbols / sibling articles). */
  links?: LearnLocaleMap<LearnLink[]>;
  /** Data scope + methodology note shown before the footer. */
  sourceNote?: LearnLocaleMap<string>;
  /** ISO date. Drives Article JSON-LD and sitemap `<lastmod>`. */
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
};

/** List card / sitemap — no heavy body fields. */
export type LearnArticleListItem = Omit<
  LearnArticle,
  "paragraphs" | "sections" | "faq" | "links" | "sourceNote"
>;

export type LearnArticleStatus = "draft" | "published";
