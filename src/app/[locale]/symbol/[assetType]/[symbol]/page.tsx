import type { Metadata } from "next";
import { SymbolPageClient } from "@/components/symbol/symbol-page-client";
import { SymbolSeoCrawl } from "@/components/symbol/quote/symbol-seo-crawl";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  buildSymbolMetadata,
  buildSymbolSeoCopy,
  fetchSymbolDailyCandles,
  fetchSymbolQuote,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, assetType: rawType, symbol: rawSymbol } = await params;
  const assetType = parseAssetType(rawType);
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  const quote = await fetchSymbolQuote(symbol, assetType);
  return buildSymbolMetadata(locale, symbol, assetType, quote);
}

export default async function SymbolPage({ params }: Props) {
  const { locale, assetType: rawType, symbol: rawSymbol } = await params;
  const assetType = parseAssetType(rawType);
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  const [quote, initialBars] = await Promise.all([
    fetchSymbolQuote(symbol, assetType),
    fetchSymbolDailyCandles(symbol, assetType),
  ]);
  const copy = await buildSymbolSeoCopy(locale, symbol, assetType, quote);
  const jsonLd = symbolJsonLd(locale, symbol, assetType, copy, quote);
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
          "symbolRail",
          "symbolShare",
          "strategies",
          "trading",
          "watchlist",
          "researchCard",
        ]}
      >
        <SymbolPageClient
          symbol={symbol}
          assetType={assetType}
          initialQuote={quote}
          initialBars={initialBars}
          seoCopy={copy}
          seoPeers={peers}
        />
      </ScopedMessages>
    </>
  );
}
