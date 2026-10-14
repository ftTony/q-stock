import type { PrismaClient } from "@prisma/client";
import { LEARN_CATEGORIES, type LearnCategory } from "@/lib/learn/types";
import { rebuildLearnSnapshot } from "@/lib/learn/rebuild-snapshot";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALES = ["zh-CN", "en", "zh-TW"] as const;

export type LearnImportInput = {
  slug: string;
  category: string;
  ctaHref?: string | null;
  status?: "draft" | "published";
  sortOrder?: number;
  title: Record<string, string>;
  summary: Record<string, string>;
  paragraphs: Record<string, string[]>;
};

function nonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function localeBundleOk(
  title: Record<string, string>,
  summary: Record<string, string>,
  paragraphs: Record<string, string[]>,
  locale: string,
): boolean {
  return (
    nonEmpty(title[locale]) &&
    nonEmpty(summary[locale]) &&
    Array.isArray(paragraphs[locale]) &&
    paragraphs[locale]!.length > 0 &&
    paragraphs[locale]!.every((p) => nonEmpty(p))
  );
}

export function validateLearnImport(input: LearnImportInput): string | null {
  if (!nonEmpty(input.slug) || !SLUG_RE.test(input.slug)) {
    return `invalid slug: ${input.slug}`;
  }
  if (!LEARN_CATEGORIES.includes(input.category as LearnCategory)) {
    return `invalid category: ${input.category}`;
  }
  const status = input.status ?? "draft";
  if (status !== "draft" && status !== "published") {
    return `invalid status: ${status}`;
  }
  if (!localeBundleOk(input.title, input.summary, input.paragraphs, "zh-CN")) {
    return `${input.slug}: zh-CN title/summary/paragraphs required`;
  }
  if (status === "published") {
    if (!localeBundleOk(input.title, input.summary, input.paragraphs, "en")) {
      return `${input.slug}: en title/summary/paragraphs required to publish`;
    }
  }
  return null;
}

export async function upsertLearnArticles(
  prisma: PrismaClient,
  items: LearnImportInput[],
): Promise<{ upserted: number; published: number; errors: string[] }> {
  const errors: string[] = [];
  let upserted = 0;
  let published = 0;

  for (const item of items) {
    const err = validateLearnImport(item);
    if (err) {
      errors.push(err);
      continue;
    }

    const status = item.status ?? "draft";

    const existing = await prisma.learnArticle.findUnique({
      where: { slug: item.slug },
      select: { publishedAt: true },
    });

    const publishedAt =
      status === "published"
        ? (existing?.publishedAt ?? new Date())
        : null;

    const article = await prisma.learnArticle.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        category: item.category,
        ctaHref: item.ctaHref?.trim() || null,
        status,
        sortOrder: item.sortOrder ?? 0,
        publishedAt,
      },
      update: {
        category: item.category,
        ctaHref: item.ctaHref?.trim() || null,
        status,
        sortOrder: item.sortOrder ?? 0,
        publishedAt,
      },
    });

    for (const locale of LOCALES) {
      if (!localeBundleOk(item.title, item.summary, item.paragraphs, locale)) {
        if (locale === "zh-TW") continue;
        if (locale === "en" && status === "draft") continue;
      }
      if (!nonEmpty(item.title[locale])) continue;

      await prisma.learnArticleLocale.upsert({
        where: {
          articleId_locale: { articleId: article.id, locale },
        },
        create: {
          articleId: article.id,
          locale,
          title: item.title[locale]!.trim(),
          summary: item.summary[locale]!.trim(),
          paragraphs: item.paragraphs[locale] ?? [],
        },
        update: {
          title: item.title[locale]!.trim(),
          summary: item.summary[locale]!.trim(),
          paragraphs: item.paragraphs[locale] ?? [],
        },
      });
    }

    upserted++;
    if (status === "published") published++;
  }

  if (upserted > 0) {
    await rebuildLearnSnapshot(prisma);
  }

  return { upserted, published, errors };
}
