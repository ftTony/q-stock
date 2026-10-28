import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType } from "@/lib/types";
import { SymbolRelatedLinks } from "@/components/symbol/quote/symbol-related-links";
import { SymbolSeoAboutBody } from "@/components/symbol/quote/symbol-seo-about-body";

type Props = {
  symbol: string;
  assetType: AssetType;
  copy: SymbolSeoCopy;
};

/**
 * SSR-only crawl payload — zero layout so it never fights plan CTAs / bottom nav.
 * Humans open the same copy via QuoteBar「说明」→ drawer.
 */
export function SymbolSeoCrawl({ symbol, assetType, copy }: Props) {
  const title =
    copy.name && copy.name !== symbol ? `${symbol} ${copy.name}` : symbol;

  return (
    <aside className="sr-only" aria-hidden={false}>
      <h1>
        {title}
        {copy.priceLabel ? ` ${copy.priceLabel}` : ""}
        {copy.changeLabel ? ` ${copy.changeLabel}` : ""}
      </h1>
      <SymbolSeoAboutBody copy={copy} />
      <SymbolRelatedLinks symbol={symbol} assetType={assetType} />
    </aside>
  );
}
