import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { siteOrigin } from "@/lib/seo/site-url";

function languageAlternates(path = "/"): Metadata["alternates"] {
  const origin = siteOrigin();
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const p = localizedPath(locale, path);
    languages[locale] = p === "/" ? `${origin}/` : `${origin}${p}`;
  }
  languages["x-default"] =
    path === "/" ? `${origin}/` : `${origin}${localizedPath(defaultLocale, path)}`;
  return { languages };
}

/** Locale-aware site metadata for `[locale]/layout`. */
export async function buildLocaleMetadata(
  locale: string,
  path = "/",
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const origin = siteOrigin();
  const loc = (locales.includes(locale as AppLocale)
    ? locale
    : defaultLocale) as AppLocale;
  const pagePath = localizedPath(loc, path);
  const canonical = pagePath === "/" ? `${origin}/` : `${origin}${pagePath}`;

  const titleDefault = t("titleDefault");
  const description = t("description");
  const descriptionShort = t("descriptionShort");
  const keywordsRaw = t.raw("keywords");
  const keywords = Array.isArray(keywordsRaw)
    ? (keywordsRaw as string[])
    : String(keywordsRaw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  return {
    title: {
      default: titleDefault,
      template: t("titleTemplate"),
    },
    description,
    applicationName: t("applicationName"),
    keywords,
    authors: [{ name: t("author") }],
    alternates: {
      canonical,
      ...languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: loc,
      siteName: t("siteName"),
      title: titleDefault,
      description: descriptionShort,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: descriptionShort,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: t("applicationName"),
    },
  };
}
