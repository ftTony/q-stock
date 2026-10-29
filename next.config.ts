import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Set SKIP_TYPECHECK=1 in Docker/CI after a separate `tsc` step to save build time. */
const skipTypecheck = process.env.SKIP_TYPECHECK === "1";

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
  ],
};

export default withNextIntl(nextConfig);
