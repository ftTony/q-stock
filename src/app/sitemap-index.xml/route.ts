import {
  buildSeedIndexXml,
  readSitemapFile,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Legacy Worker output pointed the index at the physical files under
 * `/sitemaps/*.xml`. Those 404 whenever the volume and the WEB image disagree
 * on chunk names (prod: index said `sitemap-stock-1.xml`, volume held
 * `sitemap-stock.xml`). Rewrite to the route form, which has a seed fallback,
 * so an on-disk index written before this change is still safe to serve.
 */
function toRouteForm(xml: string): string {
  return xml.replace(
    /(<loc>[^<]*?)\/sitemaps\/sitemap-([a-z0-9-]+)\.xml(<\/loc>)/g,
    "$1/sitemap/$2.xml$3",
  );
}

/**
 * Sitemap index (also exposed as `/sitemap.xml` via next.config rewrite).
 * Prefer Worker-written `public/sitemaps/sitemap.xml`; seed-only fallback.
 */
export async function GET() {
  const cached = await readSitemapFile("sitemap.xml");
  if (cached) return sitemapXmlResponse(toRouteForm(cached));

  const xml = await buildSeedIndexXml();
  return sitemapXmlResponse(xml);
}
