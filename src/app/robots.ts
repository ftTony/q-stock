import type { MetadataRoute } from "next";
import { seoPublicOrigin } from "@/lib/seo/site-url";

/** Runtime env (APP_URL); avoid baking localhost at `next build`. */
export const dynamic = "force-dynamic";

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
  const origin = seoPublicOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
