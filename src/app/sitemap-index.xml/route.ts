import {
  buildSeedIndexXml,
  readSitemapFile,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Sitemap index (also exposed as `/sitemap.xml` via next.config rewrite).
 * Prefer Worker-written `public/sitemaps/sitemap.xml`; seed-only fallback.
 */
export async function GET() {
  const cached = await readSitemapFile("sitemap.xml");
  if (cached) return sitemapXmlResponse(cached);

  const xml = await buildSeedIndexXml();
  return sitemapXmlResponse(xml);
}
