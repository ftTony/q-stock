import type { MetadataRoute } from "next";
import {
  buildSegmentEntries,
  chunkSitemapEntries,
  parseSitemapId,
  SITEMAP_SEGMENTS,
  sitemapMaxUrlsPerFile,
  type SitemapSegmentId,
} from "@/lib/seo/build-sitemap";
import { prisma } from "@/lib/db";

/** ISR: refresh each child sitemap at most once per day. */
export const revalidate = 86400;

/** `/sitemap.xml` index → chunked `/sitemap/{segment}` or `/sitemap/{segment}-{n}`. */
export async function generateSitemaps() {
  const max = sitemapMaxUrlsPerFile();
  const out: { id: string }[] = [];

  for (const segment of SITEMAP_SEGMENTS) {
    const entries = await buildSegmentEntries(segment, { prisma });
    const chunks = chunkSitemapEntries(entries, max);
    if (chunks.length <= 1) {
      out.push({ id: segment });
      continue;
    }
    for (let i = 1; i <= chunks.length; i++) {
      out.push({ id: `${segment}-${i}` });
    }
  }

  return out;
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
