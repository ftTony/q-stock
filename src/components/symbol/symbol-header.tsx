"use client";

import { useEffect, useRef, useState } from "react";
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
  backLabel: string;
  onToggleWatchlist: () => void;
};

function WatchButton({
  inWatchlist,
  watchBusy,
  watchLabel,
  watchLabelActive,
  loadingLabel,
  onToggleWatchlist,
}: Pick<
  Props,
  | "inWatchlist"
  | "watchBusy"
  | "watchLabel"
  | "watchLabelActive"
  | "loadingLabel"
  | "onToggleWatchlist"
>) {
  return (
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
  );
}

function SymbolPriceRow({
  symbol,
  assetType,
  quote,
  updatedAt,
}: {
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
  updatedAt: Date | null;
}) {
  return (
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
  );
}

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
  backLabel,
  onToggleWatchlist,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showDock, setShowDock] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // When the main header block leaves the viewport (below top bar), show dock
        setShowDock(!entry.isIntersecting);
      },
      {
        // Account for sticky app header (h-14 = 56px)
        root: null,
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const watchProps = {
    inWatchlist,
    watchBusy,
    watchLabel,
    watchLabelActive,
    loadingLabel,
    onToggleWatchlist,
  };

  return (
    <>
      {/* Floating dock: only after 盘口 header scrolls away */}
      {showDock && (
        <div className="fixed inset-x-0 top-14 z-30 px-4 sm:px-6 lg:left-[260px]">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)]/95 p-3 shadow-md backdrop-blur-xl sm:px-5 sm:py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href="/"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--brand-text)] sm:text-base"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {backLabel}
              </Link>
              <span
                className="hidden h-4 w-px shrink-0 bg-[var(--border)] sm:block"
                aria-hidden
              />
              <SymbolPriceRow
                symbol={symbol}
                assetType={assetType}
                quote={quote}
                updatedAt={updatedAt}
              />
            </div>
            <WatchButton {...watchProps} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-[var(--muted)] sm:text-base">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-[var(--brand-text)]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {backLabel}
          </Link>
        </div>

        {/* Sentinel: when this block leaves view, dock appears */}
        <div ref={sentinelRef} className="qt-panel space-y-3 p-3 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SymbolPriceRow
              symbol={symbol}
              assetType={assetType}
              quote={quote}
              updatedAt={updatedAt}
            />
            <WatchButton {...watchProps} />
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
    </>
  );
}
