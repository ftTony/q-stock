import type { PrismaClient } from "@prisma/client";
import { LEARN_ARTICLES_SEED } from "@/lib/learn/articles";
import type { LearnBlock, LearnFaqItem, LearnLink } from "@/lib/learn/types";
import {
  upsertLearnArticles,
  type LearnImportInput,
} from "@/lib/learn/import-articles";

/** Upsert bundled TS articles as published + rebuild snapshot. */
export async function seedLearnArticlesFromTs(prisma: PrismaClient) {
  const items: LearnImportInput[] = LEARN_ARTICLES_SEED.map((a, i) => ({
    slug: a.slug,
    category: a.category,
    ctaHref: a.ctaHref,
    status: "published",
    sortOrder: i,
    title: a.title as Record<string, string>,
    summary: a.summary as Record<string, string>,
    paragraphs: a.paragraphs as Record<string, string[]>,
    // Rich body must survive the DB round-trip: `learn:seed` rebuilds the disk
    // snapshot from the database, so anything left out here is deleted.
    ...(a.sections
      ? { sections: a.sections as Record<string, LearnBlock[]> }
      : {}),
    ...(a.faq ? { faq: a.faq as Record<string, LearnFaqItem[]> } : {}),
    ...(a.links ? { links: a.links as Record<string, LearnLink[]> } : {}),
    ...(a.sourceNote
      ? { sourceNote: a.sourceNote as Record<string, string> }
      : {}),
    ...(a.author ? { author: a.author } : {}),
  }));
  return upsertLearnArticles(prisma, items);
}
