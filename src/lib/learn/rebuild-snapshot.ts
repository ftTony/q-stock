import type { PrismaClient } from "@prisma/client";
import { dbRowToLearnArticle } from "@/lib/learn/from-db";
import { writeLearnSnapshot } from "@/lib/learn/snapshot";
import type { LearnArticle } from "@/lib/learn/types";

/** Load published bilingual articles from DB and write disk snapshot. */
export async function rebuildLearnSnapshot(
  prisma: PrismaClient,
): Promise<{ count: number }> {
  const rows = await prisma.learnArticle.findMany({
    where: { status: "published" },
    include: { locales: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { slug: "asc" }],
    take: 5000,
  });

  const articles: LearnArticle[] = [];
  for (const row of rows) {
    const mapped = dbRowToLearnArticle(row);
    if (mapped) articles.push(mapped);
  }

  writeLearnSnapshot(articles);
  return { count: articles.length };
}
