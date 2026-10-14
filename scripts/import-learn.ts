import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import {
  upsertLearnArticles,
  type LearnImportInput,
} from "../src/lib/learn/import-articles";
import { seedLearnArticlesFromTs } from "../src/lib/learn/seed-from-ts";

const prisma = new PrismaClient();

function loadItems(filePath: string): LearnImportInput[] {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf8");
  const parsed = JSON.parse(raw) as LearnImportInput[] | { articles: LearnImportInput[] };
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.articles)) return parsed.articles;
  throw new Error("JSON must be an array or { articles: [] }");
}

async function main() {
  const arg = process.argv[2];
  if (!arg || arg === "--seed") {
    const result = await seedLearnArticlesFromTs(prisma);
    console.info("[learn] seeded from TS", result);
    return;
  }

  const items = loadItems(arg);
  const result = await upsertLearnArticles(prisma, items);
  console.info("[learn] import", result);
  if (result.errors.length) {
    for (const e of result.errors) console.error("[learn]", e);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
