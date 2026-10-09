import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo/site-url";

const PRIVATE = [
  "/api/",
  "/settings",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/watchlist",
  "/portfolio",
  "/alerts",
  "/auth/",
  "/*/settings",
  "/*/login",
  "/*/register",
  "/*/forgot-password",
  "/*/reset-password",
  "/*/watchlist",
  "/*/portfolio",
  "/*/alerts",
  "/*/auth/",
];

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: [`${origin}/sitemap.xml`, `${origin}/sitemaps/sitemap.xml`],
  };
}
