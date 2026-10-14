import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { siteOrigin } from "@/lib/seo/site-url";

function pageUrl(locale: AppLocale, path: string): string {
  const origin = siteOrigin();
  const locPath = localizedPath(locale, path);
  return locPath === "/" ? `${origin}/` : `${origin}${locPath}`;
}

/** Static WebPage + HowTo JSON-LD (no live quotes). */
export function webPageHowToJsonLd(
  locale: string,
  path: string,
  opts: {
    name: string;
    description: string;
    howToName: string;
    steps: string[];
  },
) {
  const loc = (
    locales.includes(locale as AppLocale) ? locale : defaultLocale
  ) as AppLocale;
  const url = pageUrl(loc, path);
  const origin = siteOrigin();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.name,
        description: opts.description,
        isPartOf: { "@id": `${origin}/#website` },
        inLanguage: loc,
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: opts.howToName,
        description: opts.description,
        inLanguage: loc,
        step: opts.steps.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text,
        })),
      },
    ],
  };
}
