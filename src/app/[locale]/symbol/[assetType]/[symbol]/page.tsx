import type { Metadata } from "next";
import { SymbolPageClient } from "@/components/symbol/symbol-page-client";
import { SymbolSeoHeading } from "@/components/symbol/symbol-seo-heading";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  buildSymbolMetadata,
  buildSymbolSeoCopy,
  fetchSymbolQuote,
  symbolJsonLd,
} from "@/lib/seo/symbol-metadata";
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
  const quote = await fetchSymbolQuote(symbol, assetType);
  const copy = await buildSymbolSeoCopy(locale, symbol, assetType, quote);
  const jsonLd = symbolJsonLd(locale, symbol, assetType, copy, quote);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SymbolSeoHeading symbol={symbol} copy={copy} />
      <ScopedMessages
        namespaces={[
          "ai",
          "aiChart",
          "aiChat",
          "aiScenario",
          "alerts",
          "comments",
          "company",
          "earnings",
          "orderRisk",
          "paperRiskBar",
          "symbol",
          "symbolEmotion",
          "symbolRail",
          "symbolShare",
          "trading",
        ]}
      >
        <SymbolPageClient
          symbol={symbol}
          assetType={assetType}
          initialQuote={quote}
        />
      </ScopedMessages>
    </>
  );
}
