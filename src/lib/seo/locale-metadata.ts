import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

/**
 * Locale layout defaults only: title template + site description.
 * Do NOT set canonical/hreflang here — child pages must own their path
 * (otherwise every route inherits the homepage canonical).
 */
export async function buildLocaleMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const loc = (locales.includes(locale as AppLocale)
    ? locale
    : defaultLocale) as AppLocale;

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
    openGraph: {
      type: "website",
      locale: loc,
      siteName: t("siteName"),
      title: titleDefault,
      description: descriptionShort,
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
