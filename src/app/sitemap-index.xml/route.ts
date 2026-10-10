import { NextResponse } from "next/server";
import {
  buildSitemapIndexXml,
  listSitemapChunkIds,
} from "@/lib/seo/build-sitemap";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sitemap index (also exposed as `/sitemap.xml` via next.config rewrite). */
export async function GET() {
  const ids = await listSitemapChunkIds({ prisma });
  const childPaths = ids.map((id) => `/sitemap/${id}.xml`);
  const xml = buildSitemapIndexXml(childPaths);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
