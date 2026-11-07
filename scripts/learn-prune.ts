import { PrismaClient } from "@prisma/client";
import { rebuildLearnSnapshot } from "../src/lib/learn/rebuild-snapshot";
import { MERGED_LEARN_SLUGS } from "../src/lib/learn/merged-slugs";

/**
 * Removes consolidated learn articles from the DB, then rebuilds the disk
 * snapshot. `learn:seed` is upsert-only, so without this step the deleted
 * pages would come straight back the next time the snapshot is rebuilt.
 *
 *   npx tsx scripts/learn-prune.ts --dry
 *   npx tsx scripts/learn-prune.ts
 */
const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes("--dry");
  const slugs = Object.keys(MERGED_LEARN_SLUGS);

  const existing = await prisma.learnArticle.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, _count: { select: { locales: true } } },
    orderBy: { slug: "asc" },
  });

  console.info(`[learn-prune] matched ${existing.length}/${slugs.length}`);
  for (const row of existing) {
    console.info(
      `  - ${row.slug} (${row.status}, ${row._count.locales} locales) → ${MERGED_LEARN_SLUGS[row.slug]}`,
    );
  }

  const missing = slugs.filter((s) => !existing.some((r) => r.slug === s));
  if (missing.length) console.info(`  missing in DB: ${missing.join(", ")}`);

  if (dryRun) {
    console.info("[learn-prune] dry run — nothing deleted");
    return;
  }

  const deleted = await prisma.learnArticle.deleteMany({
    where: { slug: { in: slugs } },
  });
  console.info(`[learn-prune] deleted ${deleted.count} articles`);

  const snapshot = await rebuildLearnSnapshot(prisma);
  console.info(`[learn-prune] snapshot rebuilt with ${snapshot.count} articles`);
}

main()
  .catch((err) => {
    console.error("[learn-prune] failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
