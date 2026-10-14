import fs from "fs";
import path from "path";
import type { LearnArticle, LearnArticleListItem } from "@/lib/learn/types";

export function learnDataDir(): string {
  return (
    process.env.LEARN_DATA_DIR?.trim() ||
    path.join(process.cwd(), "data", "learn")
  );
}

function indexPath(): string {
  return path.join(learnDataDir(), "index.json");
}

function slugPath(slug: string): string {
  return path.join(learnDataDir(), "by-slug", `${slug}.json`);
}

type IndexFile = {
  generatedAt: string;
  articles: LearnArticleListItem[];
};

export function readLearnIndex(): LearnArticleListItem[] | null {
  try {
    const raw = fs.readFileSync(indexPath(), "utf8");
    const parsed = JSON.parse(raw) as IndexFile;
    if (!Array.isArray(parsed.articles)) return null;
    return parsed.articles;
  } catch {
    return null;
  }
}

export function readLearnArticleFile(slug: string): LearnArticle | null {
  try {
    const raw = fs.readFileSync(slugPath(slug), "utf8");
    const parsed = JSON.parse(raw) as LearnArticle;
    if (!parsed?.slug || !parsed.paragraphs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLearnSnapshot(articles: LearnArticle[]): void {
  const root = learnDataDir();
  const bySlug = path.join(root, "by-slug");
  fs.mkdirSync(bySlug, { recursive: true });

  const list: LearnArticleListItem[] = articles.map((a) => ({
    slug: a.slug,
    category: a.category,
    ctaHref: a.ctaHref,
    title: a.title,
    summary: a.summary,
  }));

  const index: IndexFile = {
    generatedAt: new Date().toISOString(),
    articles: list,
  };
  fs.writeFileSync(indexPath(), `${JSON.stringify(index, null, 2)}\n`, "utf8");

  const keep = new Set(articles.map((a) => a.slug));
  for (const a of articles) {
    fs.writeFileSync(
      slugPath(a.slug),
      `${JSON.stringify(a, null, 2)}\n`,
      "utf8",
    );
  }

  // Drop orphan slug files
  try {
    for (const name of fs.readdirSync(bySlug)) {
      if (!name.endsWith(".json")) continue;
      const slug = name.slice(0, -".json".length);
      if (!keep.has(slug)) {
        fs.unlinkSync(path.join(bySlug, name));
      }
    }
  } catch {
    /* ignore */
  }
}
