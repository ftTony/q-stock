import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { OG_IMAGE } from "@/lib/seo/og-image";
import { siteOrigin } from "@/lib/seo/site-url";

function resolveLocale(locale: string): AppLocale {
  return (
    locales.includes(locale as AppLocale) ? locale : defaultLocale
  ) as AppLocale;
}

function absolute(locale: AppLocale, path: string): string {
  const origin = siteOrigin();
  const p = localizedPath(locale, path);
  return p === "/" ? `${origin}/` : `${origin}${p}`;
}

/**
 * Article + BreadcrumbList for /learn/[slug].
 *
 * FAQPage / HowTo are deliberately not emitted for rich-result purposes:
 * Google retired FAQ rich results on 2026-05-07 and HowTo earlier, so the
 * markup earns nothing in the SERP. Both remain valid schema.org types for
 * machine parsing, but the on-page Q&A copy is what actually gets quoted.
 */
export function learnArticleJsonLd(opts: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  categoryLabel?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const loc = resolveLocale(opts.locale);
  const origin = siteOrigin();
  const url = absolute(loc, `/learn/${opts.slug}`);
  const isZh = loc.startsWith("zh");
  const siteName = isZh ? "钱力股 Q-Stock" : "Q-Stock";
  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.title,
    description: opts.description,
    inLanguage: loc,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(opts.publishedAt ? { datePublished: opts.publishedAt } : {}),
    ...(opts.updatedAt ? { dateModified: opts.updatedAt } : {}),
    ...(opts.categoryLabel ? { articleSection: opts.categoryLabel } : {}),
    author: {
      "@type": "Person",
      name: opts.author ?? siteName,
      // /about has no #author section yet — point at the page itself rather
      // than a fragment that resolves to nothing.
      url: absolute(loc, "/about"),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: `${origin}/icon-512.png`,
      },
    },
    image: [`${origin}${OG_IMAGE.path}`],
    isAccessibleForFree: true,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isZh ? "首页" : "Home",
            item: absolute(loc, "/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isZh ? "投资知识" : "Learn",
            item: absolute(loc, "/learn"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: opts.title,
            item: url,
          },
        ],
      },
    ],
  };
}
