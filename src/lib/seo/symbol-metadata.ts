import { cache } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  defaultLocale,
  locales,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { cachedFetch } from "@/lib/cache";
import { getQuote } from "@/lib/market";
import { displayName } from "@/lib/market-names";
import { siteOrigin } from "@/lib/seo/site-url";
import {
  isSitemapTicker,
  sitemapLocales,
} from "@/lib/seo/sitemap-locales";
import type { AssetType, Quote } from "@/lib/types";

function currencyFor(assetType: AssetType): string {
  if (assetType === "hk") return "HKD";
  if (assetType === "cn") return "CNY";
  return "USD";
}

function formatPrice(price: number, assetType: AssetType, locale: string): string {
  const currency = currencyFor(assetType);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: assetType === "crypto" && price < 1 ? 6 : 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

function formatPct(pct: number, locale: string): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatAsOf(ts: number, locale: string): string {
  const d = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

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
  languages["x-default"] = `${origin}${localizedPath(xDefault, path)}`;
  return languages;
}

/** Best-effort quote for SSR / metadata (request-deduped + 60s shared cache). */
export const fetchSymbolQuote = cache(
  async (symbol: string, assetType: AssetType): Promise<Quote | null> => {
    const sym = symbol.toUpperCase();
    try {
      return await cachedFetch(
        `seo:quote:v1:${assetType}:${sym}`,
        60_000,
        () => getQuote(sym, assetType),
      );
    } catch (err) {
      console.warn(
        `[seo] symbol quote failed ${assetType}/${sym}:`,
        err instanceof Error ? err.message : err,
      );
      return null;
    }
  },
);

export type SymbolSeoCopy = {
  title: string;
  description: string;
  name: string;
  priceLabel: string | null;
  changeLabel: string | null;
  asOfLabel: string | null;
  currency: string;
  intro: string;
  aboutLabel: string;
  howTitle: string;
  howSteps: [string, string, string];
  disclaimer: string;
  breadcrumbHome: string;
};

function hasCjk(s: string): boolean {
  return /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(s);
}

/**
 * Locale-aware company name for SEO.
 * Futu often returns Simplified Chinese (`sc_name`); do not surface that on en/etc.
 */
function seoSymbolName(
  locale: string,
  symbol: string,
  assetType: AssetType,
  quote: Quote | null,
): string {
  const fromQuote = quote?.name?.trim() || "";
  const seeded = displayName(symbol, assetType);
  const wantCjk =
    locale === "zh-CN" ||
    locale === "zh-TW" ||
    locale === "ja" ||
    locale === "ko";

  if (wantCjk) {
    if (fromQuote) return fromQuote;
    if (seeded) return seeded;
    return symbol;
  }

  // Latin / other locales: prefer non-CJK labels.
  if (fromQuote && !hasCjk(fromQuote)) return fromQuote;
  if (seeded && seeded !== symbol && !hasCjk(seeded)) return seeded;
  return symbol;
}

export async function buildSymbolSeoCopy(
  locale: string,
  symbol: string,
  assetType: AssetType,
  quote: Quote | null,
): Promise<SymbolSeoCopy> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const name = seoSymbolName(locale, symbol, assetType, quote);
  const currency = currencyFor(assetType);
  const crawl = {
    intro: t("symbolIntro", { symbol, name }),
    aboutLabel: t("symbolAbout"),
    howTitle: t("symbolHowTitle"),
    howSteps: [t("symbolHow1"), t("symbolHow2"), t("symbolHow3")] as [
      string,
      string,
      string,
    ],
    disclaimer: t("symbolDisclaimer"),
    breadcrumbHome: t("breadcrumbHome"),
  };

  if (!quote || !(quote.price > 0)) {
    return {
      title: t("symbolTitleNoPrice", { symbol, name }),
      description: t("symbolDescriptionNoPrice", { symbol, name }),
      name,
      priceLabel: null,
      changeLabel: null,
      asOfLabel: null,
      currency,
      ...crawl,
    };
  }

  const priceLabel = formatPrice(quote.price, assetType, locale);
  const changeLabel = formatPct(quote.percentChange, locale);
  const asOfLabel = formatAsOf(quote.timestamp, locale);

  return {
    title: t("symbolTitle", { symbol, name, price: priceLabel }),
    description: t("symbolDescription", {
      symbol,
      name,
      price: priceLabel,
      change: changeLabel,
      date: asOfLabel,
    }),
    name,
    priceLabel,
    changeLabel,
    asOfLabel,
    currency,
    ...crawl,
  };
}

export async function buildSymbolMetadata(
  locale: string,
  symbol: string,
  assetType: AssetType,
  quote: Quote | null,
): Promise<Metadata> {
  const copy = await buildSymbolSeoCopy(locale, symbol, assetType, quote);
  const origin = siteOrigin();
  const loc = (locales.includes(locale as AppLocale)
    ? locale
    : defaultLocale) as AppLocale;
  const path = `/symbol/${assetType}/${encodeURIComponent(symbol)}`;
  const pagePath = localizedPath(loc, path);
  const canonical = `${origin}${pagePath}`;
  // Junk tickers + non-sitemap locales stay out of the index (crawl budget).
  const indexable =
    isSitemapTicker(assetType, symbol) && sitemapLocales().includes(loc);

  return {
    title: copy.title,
    description: copy.description,
    robots: indexable
      ? undefined
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    alternates: {
      canonical,
      ...(indexable ? { languages: languageAlternates(path) } : {}),
    },
    openGraph: {
      type: "website",
      locale: loc,
      url: canonical,
      title: copy.title,
      description: copy.description,
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description,
    },
    ...(quote && quote.price > 0
      ? {
          other: {
            "product:price:amount": String(quote.price),
            "product:price:currency": copy.currency,
          },
        }
      : {}),
  };
}

/** JSON-LD: WebPage + InvestmentOrSecurity (+ Offer) + HowTo + BreadcrumbList. */
export function symbolJsonLd(
  locale: string,
  symbol: string,
  assetType: AssetType,
  copy: SymbolSeoCopy,
  quote: Quote | null,
): Record<string, unknown> {
  const origin = siteOrigin();
  const loc = (locales.includes(locale as AppLocale)
    ? locale
    : defaultLocale) as AppLocale;
  const homePath = localizedPath(loc, "/");
  const homeUrl = homePath === "/" ? `${origin}/` : `${origin}${homePath}`;
  const path = `/symbol/${assetType}/${encodeURIComponent(symbol)}`;
  const url = `${origin}${localizedPath(loc, path)}`;
  const securityName =
    copy.name !== symbol ? `${symbol} ${copy.name}` : symbol;

  const webpage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: loc,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${url}#security` },
  };

  const security: Record<string, unknown> = {
    "@type": "InvestmentOrSecurity",
    "@id": `${url}#security`,
    name: securityName,
    tickerSymbol: symbol,
    url,
    description: copy.description,
  };

  if (quote && quote.price > 0) {
    security.offers = {
      "@type": "Offer",
      price: quote.price,
      priceCurrency: copy.currency,
      url,
      priceValidUntil: new Date(Date.now() + 86_400_000)
        .toISOString()
        .slice(0, 10),
    };
  }

  const howTo: Record<string, unknown> = {
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: copy.howTitle,
    description: copy.intro,
    inLanguage: loc,
    step: copy.howSteps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };

  const breadcrumb: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.breadcrumbHome,
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: securityName,
        item: url,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webpage, security, howTo, breadcrumb],
  };
}
