import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["longbridge"],
  // Next `generateSitemaps()` leaves `/sitemap.xml` broken; serve our index instead.
  async rewrites() {
    return [{ source: "/sitemap.xml", destination: "/sitemap-index.xml" }];
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
