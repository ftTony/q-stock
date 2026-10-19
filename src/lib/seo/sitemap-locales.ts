import { locales, type AppLocale } from "@/i18n/config";

/**
 * Locales that get distinct `<loc>` + hreflang in the sitemap.
 * Default zh-CN + en — shipping all UI locales (10) × symbols blew past
 * Google crawl budget (~6–7k "Discovered – not indexed").
 *
 * Override: `SITEMAP_LOCALES=zh-CN,en,zh-TW`
 */
export function sitemapLocales(): AppLocale[] {
  const allowed = new Set<string>(locales);
  const raw = process.env.SITEMAP_LOCALES?.trim();
  const parsed = (raw || "zh-CN,en")
    .split(",")
    .map((s) => s.trim())
    .filter((l): l is AppLocale => allowed.has(l));
  return parsed.length > 0 ? parsed : (["zh-CN", "en"] as AppLocale[]);
}

/** True if a ticker is safe to put in a public sitemap URL. */
export function isSitemapTicker(market: string, symbol: string): boolean {
  const s = symbol.trim().toUpperCase();
  if (!s || s.length > 24) return false;
  if (market === "crypto") {
    // Reject CJK / junk (e.g. 牛来) and ultra-short noise.
    return /^[A-Z0-9]{2,20}$/.test(s);
  }
  if (market === "cn") {
    return /^(?:(?:SH|SZ|BJ)?\d{6}|\d{6}\.(?:SH|SZ|BJ))$/.test(s) || /^\d{6}$/.test(s);
  }
  if (market === "hk") {
    return /^\d{1,5}$/.test(s);
  }
  // US / indices: letters, digits, dots, hyphens (AAPL, BRK.B, ^GSPC-style rare)
  return /^[A-Z0-9][A-Z0-9.\-]{0,14}$/.test(s);
}
