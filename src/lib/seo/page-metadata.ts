import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { siteOrigin } from "@/lib/seo/site-url";
import { ogImages } from "@/lib/seo/og-image";
import { sitemapLocales } from "@/lib/seo/sitemap-locales";

function languageAlternates(
  path: string,
): NonNullable<Metadata["alternates"]>["languages"] {
  const origin = siteOrigin();
  const langs = sitemapLocales();
  const languages: Record<string, string> = {};
  for (const locale of langs) {
    const p = localizedPath(locale, path);
    languages[locale] = p === "/" ? `${origin}/` : `${origin}${p}`;
  }
  const xDefault: AppLocale = langs.includes("zh-CN") ? "zh-CN" : defaultLocale;
  languages["x-default"] =
    path === "/"
      ? `${origin}/`
      : `${origin}${localizedPath(xDefault, path)}`;
  return languages;
}

function resolveLocale(locale: string): AppLocale {
  return (locales.includes(locale as AppLocale)
    ? locale
    : defaultLocale) as AppLocale;
}

function canonicalFor(locale: AppLocale, path: string): string {
  const origin = siteOrigin();
  const pagePath = localizedPath(locale, path);
  return pagePath === "/" ? `${origin}/` : `${origin}${pagePath}`;
}

type PageMetaOpts = {
  /** Absolute title (uses layout template unless absoluteTitle). */
  title?: string;
  description?: string;
  /** When true, title bypasses `%s · brand` template. */
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
  /** Include hreflang map (default true for indexable pages). */
  hreflang?: boolean;
};

/** Per-route metadata with correct canonical (not the homepage). */
export async function buildPageMetadata(
  locale: string,
  path: string,
  opts: PageMetaOpts = {},
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const loc = resolveLocale(locale);
  const canonical = canonicalFor(loc, path);
  const title = opts.title ?? t("titleDefault");
  const description = opts.description ?? t("description");
  const descriptionShort = t("descriptionShort");

  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    robots: opts.robots,
    alternates: {
      canonical,
      ...(opts.hreflang === false
        ? {}
        : { languages: languageAlternates(path) }),
    },
    openGraph: {
      type: "website",
      locale: loc,
      siteName: t("siteName"),
      title,
      description: opts.description ?? descriptionShort,
      url: canonical,
      images: ogImages(title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: opts.description ?? descriptionShort,
      images: ogImages(title),
    },
  };
}

/** Auth / account pages — noindex and out of hreflang clusters. */
export async function buildNoIndexMetadata(
  locale: string,
  path: string,
  title?: string,
): Promise<Metadata> {
  return buildPageMetadata(locale, path, {
    title: title ?? "Private",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    hreflang: false,
  });
}
