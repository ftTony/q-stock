import fs from "fs/promises";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import {
  buildSegmentEntries,
  buildSitemapIndexXml,
  chunkSitemapEntries,
  segmentChunkFileName,
  segmentFileName,
  sitemapEntriesToXml,
  SITEMAP_SEGMENTS,
  type SitemapSegmentId,
} from "@/lib/seo/build-sitemap";
import { usTradeDate } from "@/lib/market/session";
import { siteOrigin } from "@/lib/seo/site-url";

function outDir(): string {
  return (
    process.env.SITEMAP_OUT_DIR?.trim() ||
    path.join(process.cwd(), "public", "sitemaps")
  );
}

async function removeStaleSegmentFiles(
  dir: string,
  id: SitemapSegmentId,
  keepNames: Set<string>,
) {
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return;
  }
  const prefix = `sitemap-${id}`;
  for (const name of names) {
    if (!name.startsWith(prefix) || !name.endsWith(".xml")) continue;
    // sitemap-stock.xml / sitemap-stock-1.xml — not sitemap-stockfoo
    const rest = name.slice(prefix.length); // "" | "-1.xml" | ".xml"
    if (rest !== ".xml" && !/^-\d+\.xml$/.test(rest)) continue;
    if (keepNames.has(name)) continue;
    try {
      await fs.unlink(path.join(dir, name));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Write sitemap index + per-market urlsets under `public/sitemaps/`.
 * Large markets are split into `sitemap-{market}-N.xml` chunks.
 * Idempotent per America/New_York calendar day via `.seo-sitemap-day`.
 */
export async function writeDailySitemapFile(opts?: {
  prisma?: PrismaClient;
  now?: Date;
  force?: boolean;
}): Promise<{ wrote: boolean; day: string; files: string[] }> {
  const now = opts?.now ?? new Date();
  const day = usTradeDate(now);
  const root = outDir();
  const marker = path.join(root, ".seo-sitemap-day");
  const files: string[] = [];

  if (!opts?.force) {
    try {
      const prev = await fs.readFile(marker, "utf8");
      if (prev.trim() === day) {
        return { wrote: false, day, files };
      }
    } catch {
      // first run
    }
  }

  await fs.mkdir(root, { recursive: true });
  const dayDir = path.join(root, day);
  await fs.mkdir(dayDir, { recursive: true });

  const childNames: string[] = [];
  let totalUrls = 0;

  for (const id of SITEMAP_SEGMENTS) {
    const entries = await buildSegmentEntries(id, {
      prisma: opts?.prisma,
      now,
    });
    totalUrls += entries.length;
    const chunks = chunkSitemapEntries(entries);
    const keep = new Set<string>();

    for (let i = 0; i < chunks.length; i++) {
      const name = segmentChunkFileName(id, i, chunks.length);
      keep.add(name);
      childNames.push(name);
      const xml = sitemapEntriesToXml(chunks[i]!);
      const latestPath = path.join(root, name);
      const datedPath = path.join(dayDir, name);
      await fs.writeFile(latestPath, xml, "utf8");
      await fs.writeFile(datedPath, xml, "utf8");
      files.push(latestPath, datedPath);
    }

    // Drop monolithic file when split; drop orphan chunk numbers.
    await removeStaleSegmentFiles(root, id, keep);
    await removeStaleSegmentFiles(dayDir, id, keep);

    if (chunks.length > 1) {
      console.info(
        `[seo] split ${segmentFileName(id)} → ${chunks.length} files (${entries.length} urls)`,
      );
    }
  }

  const indexXml = buildSitemapIndexXml(
    childNames.map((n) => `/sitemaps/${n}`),
    now,
  );
  const indexLatest = path.join(root, "sitemap.xml");
  const indexDated = path.join(dayDir, "sitemap.xml");
  await fs.writeFile(indexLatest, indexXml, "utf8");
  await fs.writeFile(indexDated, indexXml, "utf8");
  await fs.writeFile(marker, `${day}\n`, "utf8");
  files.push(indexLatest, indexDated);

  console.info(
    `[seo] wrote sitemap index+markets day=${day} origin=${siteOrigin()} urls=${totalUrls} files=${childNames.length} (${childNames.join(",")})`,
  );
  return { wrote: true, day, files };
}

export function sitemapSegmentIds(): SitemapSegmentId[] {
  return [...SITEMAP_SEGMENTS];
}
