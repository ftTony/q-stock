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
  /** 0 = just stuck (panel white) → 1 = fully match nav background */
  const [dockBlend, setDockBlend] = useState(0);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setShowDock(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!showDock) {
      setDockBlend(0);
      return;
    }
    const update = () => {
      const el = sentinelRef.current;
      if (!el) return;
      // After header (56px): blend over next ~72px of scroll
      const past = 56 - el.getBoundingClientRect().bottom;
      setDockBlend(Math.min(1, Math.max(0, past / 72)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [showDock]);

  const watchProps = {
    inWatchlist,
    watchBusy,
    watchLabel,
    watchLabelActive,
    loadingLabel,
    onToggleWatchlist,
  };

  const dockBg = `color-mix(in srgb, var(--panel) ${Math.round((1 - dockBlend) * 100)}%, var(--background) ${Math.round(dockBlend * 100)}%)`;

  return (
    <>
      {showDock && (
        <div
          className="fixed inset-x-0 top-14 z-30 border-b border-[var(--border)] backdrop-blur-xl lg:left-[260px]"
          style={{ backgroundColor: dockBg }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
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
              assetType={assetType}
              className="border-t border-[var(--border)]/70 pt-3"
            />
          )}
        </div>
      </div>
    </>
  );
}

