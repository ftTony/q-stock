import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";

type Props = {
  symbol: string;
  copy: SymbolSeoCopy;
};

/**
 * Server-rendered H1 + daily quote summary for crawlers / view-source.
 * Client header keeps interactive UI; this is the indexable content block.
 */
export function SymbolSeoHeading({ symbol, copy }: Props) {
  return (
    <header className="mb-3 space-y-1">
      <h1 className="text-base font-semibold tracking-tight sm:text-lg">
        {symbol}
        {copy.name && copy.name !== symbol ? (
          <span className="ml-1.5 text-sm font-normal text-[var(--muted)]">
            {copy.name}
          </span>
        ) : null}
      </h1>
      {copy.priceLabel ? (
        <p className="text-sm text-[var(--foreground)]">
          <span className="font-semibold tabular-nums">{copy.priceLabel}</span>
          {copy.changeLabel ? (
            <span className="ml-2 text-xs tabular-nums text-[var(--muted)]">
              {copy.changeLabel}
            </span>
          ) : null}
          {copy.asOfLabel ? (
            <span className="ml-2 text-[10px] text-[var(--muted)]">
              {copy.asOfLabel}
            </span>
          ) : null}
        </p>
      ) : (
        <p className="text-xs text-[var(--muted)]">{copy.description}</p>
      )}
    </header>
  );
}
