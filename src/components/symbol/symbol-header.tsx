"use client";

import { Link } from "@/i18n/routing";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { QuoteStatsGrid } from "@/components/market/quote-stats";
import { ChangePct, PriceText } from "@/components/market/price";
import { SubmitButton } from "@/components/ui/submit-button";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
  metrics?: EarningsMetric[];
  updatedAt: Date | null;
  inWatchlist: boolean;
  watchBusy: boolean;
  watchLabel: string;
  watchLabelActive: string;
  loadingLabel: string;
  onToggleWatchlist: () => void;
};

export function SymbolHeader({
  symbol,
  assetType,
  quote,
  metrics = [],
  updatedAt,
  inWatchlist,
  watchBusy,
  watchLabel,
  watchLabelActive,
  loadingLabel,
  onToggleWatchlist,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-[var(--muted)] sm:text-base">
        <Link href="/" className="hover:text-[var(--brand-text)]">
          ← Markets
        </Link>
      </div>

      <div className="qt-panel space-y-3 p-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {symbol}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">
                {displayName(symbol, assetType)}
              </span>
            </h1>
            {quote && (
              <>
                <span className="text-xl font-semibold sm:text-2xl">
                  <PriceText value={quote.price} change={quote.change} />
                </span>
                <ChangePct value={quote.percentChange} />
                {updatedAt && (
                  <span className="text-[11px] text-[var(--muted)]">
                    {updatedAt.toLocaleTimeString()}
                  </span>
                )}
              </>
            )}
          </div>
          <SubmitButton
            type="button"
            disabled={watchBusy}
            loading={watchBusy}
            loadingLabel={loadingLabel}
            onClick={onToggleWatchlist}
            className={`shrink-0 px-3 py-1.5 text-xs ${
              inWatchlist
                ? "qt-btn-ghost text-[var(--brand-text)]"
                : "qt-btn-primary"
            }`}
          >
            {inWatchlist ? watchLabelActive : watchLabel}
          </SubmitButton>
        </div>

        {quote && (
          <QuoteStatsGrid
            quote={quote}
            metrics={metrics}
            className="border-t border-[var(--border)]/70 pt-3"
          />
        )}
      </div>
    </div>
  );
}
