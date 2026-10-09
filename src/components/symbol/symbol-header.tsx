"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import { QuoteStatsGrid } from "@/components/market/quote-stats";
import { ChangePct, PriceText } from "@/components/market/price";
import { SubmitButton } from "@/components/ui/submit-button";
import { IconHeart } from "@/components/ui/icon-heart";
import { formatTime } from "@/lib/format-number";
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
  const label = inWatchlist ? watchLabelActive : watchLabel;
  return (
    <SubmitButton
      type="button"
      disabled={watchBusy}
      loading={watchBusy}
      loadingLabel={<span className="sr-only">{loadingLabel}</span>}
      onClick={onToggleWatchlist}
      title={label}
      aria-label={label}
      aria-pressed={inWatchlist}
      className={`qt-btn h-7 w-7 shrink-0 rounded-full p-0 ${
        inWatchlist
          ? "qt-btn-ghost text-[var(--down)]"
          : "qt-btn-ghost text-[var(--muted)] hover:text-[var(--down)]"
      }`}
    >
      <IconHeart filled={inWatchlist} />
    </SubmitButton>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand-text)]"
    >
      <svg
        className="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}

function UpdatedAtLabel({ updatedAt }: { updatedAt: Date }) {
  /** Avoid SSR/client clock skew hydration mismatch (e.g. 09:55:42 vs :43). */
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    setLabel(formatTime(updatedAt));
  }, [updatedAt]);
  if (!label) return null;
  return (
    <span className="text-[10px] text-[var(--muted)]" suppressHydrationWarning>
      {label}
    </span>
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
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {/* Page H1 is server-rendered in SymbolSeoHeading; keep this as a visual title. */}
      <p className="text-sm font-semibold tracking-tight">
        {symbol}{" "}
        <span className="text-[11px] font-normal text-[var(--muted)]">
          {displayName(symbol, assetType)}
        </span>
      </p>
      {quote && (
        <>
          <span className="text-sm font-semibold tabular-nums">
            <PriceText value={quote.price} change={quote.change} />
          </span>
          <span className="text-xs">
            <ChangePct value={quote.percentChange} />
          </span>
          {updatedAt ? <UpdatedAtLabel updatedAt={updatedAt} /> : null}
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

  const titleRow = (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <BackLink label={backLabel} />
      <span className="hidden h-3.5 w-px shrink-0 bg-[var(--border)] sm:block" aria-hidden />
      <SymbolPriceRow
        symbol={symbol}
        assetType={assetType}
        quote={quote}
        updatedAt={updatedAt}
      />
    </div>
  );

  return (
    <>
      {showDock && (
        <div
          className="fixed inset-x-0 top-14 z-30 border-b border-[var(--border)] backdrop-blur-xl lg:left-[var(--sidebar-w,270px)]"
          style={{ backgroundColor: dockBg }}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
            {titleRow}
            <WatchButton {...watchProps} />
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="qt-panel px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          {titleRow}
          <WatchButton {...watchProps} />
        </div>
        {quote && (
          <QuoteStatsGrid
            quote={quote}
            metrics={metrics}
            assetType={assetType}
            className="mt-2 border-t border-[var(--border)]/70 pt-2"
          />
        )}
      </div>
    </>
  );
}
