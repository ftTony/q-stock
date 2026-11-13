import type { Metadata } from "next";
import { SymbolPageClient } from "@/components/symbol/symbol-page-client";
import { SymbolSeoCrawl } from "@/components/symbol/quote/symbol-seo-crawl";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  buildSymbolMetadata,
  buildSymbolSeoCopy,
  symbolJsonLd,
} from "@/lib/seo/symbol-metadata";
import {
  seedSymbolsForMarket,
  type SitemapMarket,
} from "@/lib/seo/sitemap-symbols";
import { parseAssetType } from "@/lib/types";

type PageParams = {
  locale: string;
  assetType: string;
  symbol: string;
};

type Props = {
  params: Promise<PageParams>;
};

/**
 * Crawl-critical route — keep the request path free of market-provider I/O.
 *
 * Why (2026-11): Googlebot was only crawling ~100 of ~500 URLs. Sampling with
 * the Googlebot UA showed TTFB 1.6–17s and 1 in 3 responses truncated mid-HTML
 * (no `<title>`, no canonical) because the shell awaited `getQuote` /
 * `getDailyCandles` before flushing `<head>`. Quote + candles now hydrate on the
 * client (they already did via `useSymbolQuote` / `useSymbolCandles`), so the
 * document renders from local data only and can be served from the ISR cache.
 *
 * `revalidate` keeps the static shell fresh (prices are never baked in).
 */
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, assetType: rawType, symbol: rawSymbol } = await params;
  const assetType = parseAssetType(rawType);
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  // No provider call: the name comes from the local seed table, and the live
  // price lives in the client-rendered quote bar. A price in `<title>` used to
  // block the whole `<head>` on a 3s provider timeout.
  return buildSymbolMetadata(locale, symbol, assetType, null);
}

export default async function SymbolPage({ params }: Props) {
  const { locale, assetType: rawType, symbol: rawSymbol } = await params;
  const assetType = parseAssetType(rawType);
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  const copy = await buildSymbolSeoCopy(locale, symbol, assetType, null);
  const jsonLd = symbolJsonLd(locale, symbol, assetType, copy, null);
  const peers = seedSymbolsForMarket(assetType as SitemapMarket)
    .filter((s) => s !== symbol)
    .slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SymbolSeoCrawl symbol={symbol} assetType={assetType} copy={copy} />
      <ScopedMessages
        locale={locale}
        namespaces={[
          "ai",
          "aiChart",
          "aiChat",
          "aiScenario",
          "alerts",
          "comments",
          "common",
          "company",
          "earnings",
          "market",
          "nav",
          "orderRisk",
          "paperRiskBar",
          "seo",
          "settings",
          "symbol",
          "symbolEmotion",
          "symbolLayout",
          "symbolRail",
          "symbolShare",
          "strategies",
          "trading",
          "watchlist",
          "researchCard",
        ]}
      >
        {/* Quote / candles hydrate on the client; props stay null on purpose. */}
        <SymbolPageClient
          symbol={symbol}
          assetType={assetType}
          seoCopy={copy}
          seoPeers={peers}
        />
      </ScopedMessages>
    </>
  );
}
