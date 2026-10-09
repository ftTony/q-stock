import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { siteOrigin } from "@/lib/seo/site-url";

/** WebSite + WebPage JSON-LD for the marketing homepage. */
export function marketingHomeJsonLd(locale: string, opts: {
  siteName: string;
  description: string;
}) {
  const origin = siteOrigin();
  const loc = (
    locales.includes(locale as AppLocale) ? locale : defaultLocale
  ) as AppLocale;
  const homePath = localizedPath(loc, "/");
  const url = homePath === "/" ? `${origin}/` : `${origin}${homePath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: opts.siteName,
        description: opts.description,
        inLanguage: locales,
        publisher: {
          "@type": "Organization",
          name: opts.siteName,
          url: `${origin}/`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: opts.siteName,
        description: opts.description,
        isPartOf: { "@id": `${origin}/#website` },
        inLanguage: loc,
      },
    ],
  };
}
