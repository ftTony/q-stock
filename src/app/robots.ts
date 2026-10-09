import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/settings",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/*/settings",
          "/*/login",
          "/*/register",
          "/*/forgot-password",
          "/*/reset-password",
        ],
      },
    ],
    // Indexes only — market files may be split into sitemap-stock-N.xml
    sitemap: [`${origin}/sitemap.xml`, `${origin}/sitemaps/sitemap.xml`],
  };
}
