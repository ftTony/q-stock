/** Canonical public origin for SEO absolute URLs. */
export function siteOrigin(): string {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
