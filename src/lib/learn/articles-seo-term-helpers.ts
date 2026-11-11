import type { LearnArticle, LearnBlock, LearnFaqItem, LearnLink } from "@/lib/learn/types";

export const TERM_PUBLISHED = "2026-11-11";

export function termBlocks(
  en: LearnBlock[],
  zh: LearnBlock[],
): NonNullable<LearnArticle["sections"]> {
  return { en, "zh-CN": zh };
}

export function termFaq(
  en: LearnFaqItem[],
  zh: LearnFaqItem[],
): NonNullable<LearnArticle["faq"]> {
  return { en, "zh-CN": zh };
}

export function termLinks(
  en: LearnLink[],
  zh: LearnLink[],
): NonNullable<LearnArticle["links"]> {
  return { en, "zh-CN": zh };
}

export function buildTermArticle(opts: {
  slug: string;
  ctaHref: string;
  titleEn: string;
  titleZh: string;
  summaryEn: string;
  summaryZh: string;
  sections: NonNullable<LearnArticle["sections"]>;
  faq: NonNullable<LearnArticle["faq"]>;
  links: NonNullable<LearnArticle["links"]>;
}): LearnArticle {
  return {
    slug: opts.slug,
    category: "basics",
    ctaHref: opts.ctaHref,
    publishedAt: TERM_PUBLISHED,
    title: { en: opts.titleEn, "zh-CN": opts.titleZh },
    summary: { en: opts.summaryEn, "zh-CN": opts.summaryZh },
    paragraphs: {
      en: [opts.summaryEn],
      "zh-CN": [opts.summaryZh],
    },
    sections: opts.sections,
    faq: opts.faq,
    links: opts.links,
    sourceNote: {
      en: "Educational glossary. Not investment advice.",
      "zh-CN": "词条仅供学习，不构成投资建议。",
    },
  };
}
