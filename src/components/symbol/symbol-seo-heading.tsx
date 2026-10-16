import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";

type Props = {
  symbol: string;
  copy: SymbolSeoCopy;
};

/**
 * Indexable H1 for crawlers only — visible quote UI lives in SymbolQuoteBar.
 */
export function SymbolSeoHeading({ symbol, copy }: Props) {
  const title =
    copy.name && copy.name !== symbol ? `${symbol} ${copy.name}` : symbol;
  return (
    <h1 className="sr-only">
      {title}
      {copy.priceLabel ? ` ${copy.priceLabel}` : ""}
      {copy.changeLabel ? ` ${copy.changeLabel}` : ""}
    </h1>
  );
}
