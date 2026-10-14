import {
  buildSeedSegmentXml,
  readSitemapFile,
  sitemapFileNameForId,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Child sitemap (`/sitemap/{id}` and `/sitemap/{id}.xml` via rewrite).
 * Prefer on-disk `sitemap-{id}.xml` from Worker; seed-only if missing.
 * Daily index usually points crawlers at `/sitemaps/*.xml` (static).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await ctx.params;
  const id = decodeURIComponent(raw).replace(/\.xml$/i, "");
  const fileName = sitemapFileNameForId(id);

  const cached = await readSitemapFile(fileName);
  if (cached) return sitemapXmlResponse(cached);

  const xml = await buildSeedSegmentXml(id);
  return sitemapXmlResponse(xml);
}
