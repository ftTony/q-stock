import { getLearnArticle, learnText } from "@/lib/learn/articles";
import { getLearnSeriesForSlug } from "@/lib/learn/series";
import type { LearnArticleListItem } from "@/lib/learn/types";

export type LearnRelatedCard = {
  slug: string;
  title: string;
  categoryLabel: string;
};

/**
 * Related rail: series neighbors → hand-picked /learn links → same category.
 * Skips the current slug; caps at `limit` (default 4).
 */
export function pickRelatedLearnArticles(opts: {
  slug: string;
  locale: string;
  cards: LearnArticleListItem[];
  categoryLabel: (category: string) => string;
  limit?: number;
}): LearnRelatedCard[] {
  const limit = opts.limit ?? 4;
  const seen = new Set<string>([opts.slug]);
  const out: LearnRelatedCard[] = [];

  const push = (slug: string) => {
    if (seen.has(slug) || out.length >= limit) return;
    const card = opts.cards.find((c) => c.slug === slug);
    if (!card) return;
    seen.add(slug);
    out.push({
      slug,
      title: learnText(opts.locale, card.title),
      categoryLabel: opts.categoryLabel(card.category),
    });
  };

  const series = getLearnSeriesForSlug(opts.slug);
  if (series) {
    const idx = series.slugs.indexOf(opts.slug);
    if (idx >= 0) {
      if (idx > 0) push(series.slugs[idx - 1]!);
      if (idx < series.slugs.length - 1) push(series.slugs[idx + 1]!);
      for (const s of series.slugs) {
        if (out.length >= limit) break;
        push(s);
      }
    }
  }

  const article = getLearnArticle(opts.slug);
  const handLinks =
    article?.links?.[opts.locale as "en" | "zh-CN"] ??
    article?.links?.["zh-CN"] ??
    article?.links?.en ??
    [];
  for (const link of handLinks) {
    if (out.length >= limit) break;
    const m = link.href.match(/^\/learn\/([^/?#]+)/);
    if (m?.[1]) push(decodeURIComponent(m[1]));
  }

  const category = article?.category;
  if (category) {
    for (const card of opts.cards) {
      if (out.length >= limit) break;
      if (card.category === category) push(card.slug);
    }
  }

  if (out.length < limit) {
    for (const card of opts.cards) {
      if (out.length >= limit) break;
      push(card.slug);
    }
  }

  return out;
}
