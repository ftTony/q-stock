import type { MetadataRoute } from "next";
import {
  buildSegmentEntries,
  chunkSitemapEntries,
  listSitemapChunkIds,
  parseSitemapId,
  SITEMAP_SEGMENTS,
  type SitemapSegmentId,
} from "@/lib/seo/build-sitemap";
import { prisma } from "@/lib/db";

/** Runtime APP_URL — do not bake localhost from `next build`. */
export const dynamic = "force-dynamic";

/** Children at `/sitemap/{id}.xml`. Root index: rewrite → `/sitemap-index.xml`. */
export async function generateSitemaps() {
  const ids = await listSitemapChunkIds({ prisma });
  return ids.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const raw = await props.id;
  const { segment, chunkIndex } = parseSitemapId(raw);
  const id = (
    SITEMAP_SEGMENTS.includes(segment) ? segment : "static"
  ) as SitemapSegmentId;

  const entries = await buildSegmentEntries(id, { prisma });
  const chunks = chunkSitemapEntries(entries);
  const slice =
    chunkIndex != null ? (chunks[chunkIndex] ?? []) : (chunks[0] ?? []);

  return slice.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    ...(e.languages ? { alternates: { languages: e.languages } } : {}),
  }));
}
