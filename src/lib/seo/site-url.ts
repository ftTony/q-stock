/** Public site used when a local APP_URL is baked in at `next build`. */
const PRODUCTION_ORIGIN = "https://www.q-stock.cn";

/** Dynamic key — Next must not inline `process.env.APP_URL` at compile time. */
function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
  } catch {
    return /localhost|127\.0\.0\.1/.test(origin);
  }
}

/** Canonical public origin for SEO absolute URLs (sitemap, robots, metadata). */
export function siteOrigin(): string {
  const raw = (
    readEnv("APP_URL") ||
    readEnv("AUTH_URL") ||
    readEnv("NEXTAUTH_URL") ||
    ""
  ).replace(/\/+$/, "");

  // Local `next build` (NODE_ENV=production) often has APP_URL=localhost.
  // Uploaded artifacts must still emit the public domain.
  if (!raw || isLoopbackOrigin(raw)) {
    if (process.env.NODE_ENV === "production") return PRODUCTION_ORIGIN;
    return raw || "http://localhost:3000";
  }
  return raw;
}
