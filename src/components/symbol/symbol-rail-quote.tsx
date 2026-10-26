"use client";

import { useTranslations } from "next-intl";
import { ChangePct, PriceText } from "@/components/market/price";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
};

/** Right-rail quote head — Longbridge-style dense identity block. */
export function SymbolRailQuote({ symbol, assetType, quote }: Props) {
  const t = useTranslations("symbol");

  return (
    <div className="border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] px-2 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold leading-none tracking-[-0.16px] text-[var(--aw-ink,var(--foreground))]">
            {symbol}
          </div>
          <p className="mt-1 truncate text-[11px] leading-none tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]">
            {displayName(symbol, assetType, quote?.name) || t("profile")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {quote ? (
            <>
              <div className="text-[22px] font-semibold tabular-nums leading-none tracking-[-0.28px]">
                <PriceText value={quote.price} change={quote.change} />
              </div>
              <div className="mt-1 flex items-baseline justify-end gap-1.5">
                <ChangePct value={quote.percentChange} />
                {quote.change != null && Number.isFinite(quote.change) ? (
                  <span
                    className={`text-[11px] tabular-nums leading-none ${
                      quote.change > 0
                        ? "text-[var(--up)]"
                        : quote.change < 0
                          ? "text-[var(--down)]"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {quote.change > 0 ? "+" : ""}
                    {quote.change.toFixed(2)}
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <span className="text-[12px] text-[var(--muted)]">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
