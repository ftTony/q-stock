/** GA4 measurement ID (`G-XXXXXXXX`). Empty when unset → analytics off. */
export function gaMeasurementId(): string {
  return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();
}

/** Google Search Console HTML-tag verification token (optional). */
export function googleSiteVerification(): string {
  return (process.env.GOOGLE_SITE_VERIFICATION || "").trim();
}
