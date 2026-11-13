import { locales, type AppLocale } from "@/i18n/config";

/**
 * Locales that get distinct `<loc>` entries + hreflang alternates.
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

/**
 * Locales that get their own `<loc>` in the sitemap (i.e. the URLs we ask
 * Google to crawl *first*). The other `sitemapLocales()` stay reachable through
 * `hreflang` alternates and remain indexable — they are simply not advertised
 * as separate sitemap entries.
 *
 * Default: zh-CN only. Listing `/zh-CN/...` and `/...` for every page doubled
 * the URL count (~1,010 locs for ~505 pages) and split an already tiny crawl
 * budget across two near-identical documents per page.
 *
 * Override: `SITEMAP_PRIMARY_LOCALES=zh-CN,en`
 */
export function sitemapPrimaryLocales(): AppLocale[] {
  const allowed = new Set<string>(locales);
  const raw = process.env.SITEMAP_PRIMARY_LOCALES?.trim();
  const parsed = (raw || "zh-CN")
    .split(",")
    .map((s) => s.trim())
    .filter((l): l is AppLocale => allowed.has(l));
  const subset = parsed.length > 0 ? parsed : (["zh-CN"] as AppLocale[]);
  // Never advertise a locale that is not part of the hreflang set.
  const withAlternates = subset.filter((l) => sitemapLocales().includes(l));
  return withAlternates.length > 0 ? withAlternates : [sitemapLocales()[0]!];
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
