import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";

type Props = {
  symbol: string;
  copy: SymbolSeoCopy;
};

/**
 * Server-rendered H1 + quote summary for crawlers / no-JS.
 * Visually hidden so SymbolHeader owns the on-screen layout (avoids double title).
 */
export function SymbolSeoHeading({ symbol, copy }: Props) {
  return (
    <header className="sr-only">
      <h1>
        {symbol}
        {copy.name && copy.name !== symbol ? ` ${copy.name}` : ""}
      </h1>
      {copy.priceLabel ? (
        <p>
          {copy.priceLabel}
          {copy.changeLabel ? ` ${copy.changeLabel}` : ""}
          {copy.asOfLabel ? ` ${copy.asOfLabel}` : ""}
        </p>
      ) : (
        <p>{copy.description}</p>
      )}
    </header>
  );
}
