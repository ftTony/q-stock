import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { locales } from "./src/i18n/config";
import { MERGED_LEARN_SLUGS } from "./src/lib/learn/merged-slugs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Set SKIP_TYPECHECK=1 in Docker/CI after a separate `tsc` step to save build time. */
const skipTypecheck = process.env.SKIP_TYPECHECK === "1";

/**
 * Learn pages merged on 2026-11-07 (16 thin pages → 4). Old URLs must 301 to
 * the consolidated article or the accumulated link equity is simply lost.
 * English is the default locale and carries no prefix (`localePrefix: as-needed`).
 */
function mergedLearnRedirects() {
  return Object.entries(MERGED_LEARN_SLUGS).flatMap(([from, to]) => [
    { source: `/learn/${from}`, destination: `/learn/${to}`, permanent: true },
    ...locales
      .filter((locale) => locale !== "en")
      .map((locale) => ({
        source: `/${locale}/learn/${from}`,
        destination: `/${locale}/learn/${to}`,
        permanent: true,
      })),
  ]);
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["longbridge"],
  // Lint already runs in CI (`npm run lint`); skip duplicate ESLint during `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: skipTypecheck,
  },
  experimental: {
    // Tree-shake heavy barrels faster / smaller client graphs.
    optimizePackageImports: [
      "date-fns",
      "zod",
      "@tanstack/react-query",
      "next-intl",
    ],
  },
  async redirects() {
    return mergedLearnRedirects();
  },
  // Sitemap: index + children via lightweight routes (disk-first, not MetadataRoute).
  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
      { source: "/sitemap/:id.xml", destination: "/sitemap/:id" },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.finnhub.io" },
      { protocol: "https", hostname: "static.finnhub.io" },
      { protocol: "https", hostname: "**.futunn.com" },
      { protocol: "https", hostname: "**.longbridge.com" },
      { protocol: "https", hostname: "**.lbkrs.com" },
      { protocol: "https", hostname: "**.binance.com" },
      { protocol: "https", hostname: "**.binance.vision" },
    ],
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      source: "/manifest.webmanifest",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Content-Type", value: "application/manifest+json" },
      ],
    },
    /**
     * Symbol pages carry no per-user data on the server (quote + candles
     * hydrate on the client), so they can be served from the edge. Without an
     * explicit s-maxage, Cloudflare answered `cf-cache-status: DYNAMIC` and
     * every crawler hit queued on the 1 vCPU origin at 5–15s TTFB.
     */
    {
      source: "/symbol/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=300, stale-while-revalidate=86400",
        },
      ],
    },
    {
      source: "/:locale/symbol/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=300, stale-while-revalidate=86400",
        },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
