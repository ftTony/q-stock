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
 * FAQPage is emitted when `faq` is present for machine parsing / assistants.
 * Google retired FAQ rich results for most sites (2026-05), so this is not for
 * SERP stars — on-page Q&A copy remains the primary quote surface.
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
  faq?: ReadonlyArray<{ q: string; a: string }>;
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

  const graph: Record<string, unknown>[] = [
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
  ];

  const faqItems = (opts.faq ?? []).filter((item) => item.q?.trim() && item.a?.trim());
  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
