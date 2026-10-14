import type { PrismaClient } from "@prisma/client";
import { LEARN_ARTICLES_SEED } from "@/lib/learn/articles";
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
  }));
  return upsertLearnArticles(prisma, items);
}
