import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  buildSegmentEntries,
  buildSitemapIndexXml,
  chunkSitemapEntries,
  listSitemapChunkIds,
  parseSitemapId,
  SITEMAP_SEGMENTS,
  sitemapEntriesToXml,
  type SitemapSegmentId,
} from "@/lib/seo/build-sitemap";
import { rewriteSitemapLoopbackOrigins } from "@/lib/seo/site-url";

/** Directory for daily sitemap XML (shared with Worker via Compose volume). */
export function sitemapOutDir(): string {
  return (
    process.env.SITEMAP_OUT_DIR?.trim() ||
    path.join(process.cwd(), "public", "sitemaps")
  );
}

/** Map Next `/sitemap/{id}.xml` id → on-disk file (`stock` → `sitemap-stock.xml`). */
export function sitemapFileNameForId(rawId: string): string {
  const id = rawId.trim().replace(/\.xml$/i, "");
  return `sitemap-${id}.xml`;
}

export async function readSitemapFile(
  fileName: string,
): Promise<string | null> {
  try {
    const raw = await fs.readFile(path.join(sitemapOutDir(), fileName), "utf8");
    return rewriteSitemapLoopbackOrigins(raw);
  } catch {
    return null;
  }
}

const CACHE =
  "public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400";

export function sitemapXmlResponse(xml: string): NextResponse {
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE,
    },
  });
}

/** Seed-only index (no Prisma / market APIs) when Worker files are missing. */
export async function buildSeedIndexXml(): Promise<string> {
  const ids = await listSitemapChunkIds();
  return buildSitemapIndexXml(ids.map((id) => `/sitemap/${id}.xml`));
}

/** Seed-only urlset for one chunk id (e.g. `stock`, `stock-2`). */
export async function buildSeedSegmentXml(rawId: string): Promise<string> {
  const { segment, chunkIndex } = parseSitemapId(rawId);
  const id = (
    SITEMAP_SEGMENTS.includes(segment) ? segment : "static"
  ) as SitemapSegmentId;
  const entries = await buildSegmentEntries(id);
  const chunks = chunkSitemapEntries(entries);
  const slice =
    chunkIndex != null ? (chunks[chunkIndex] ?? []) : (chunks[0] ?? []);
  return sitemapEntriesToXml(slice);
}
