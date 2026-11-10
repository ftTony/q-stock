"use client";

import { useSyncExternalStore } from "react";
import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";
import {
  WATCH_DEFAULT,
  readWatchlistOpen,
  readWatchlistWidth,
} from "@/components/symbol/hooks/use-watchlist-resize";

/** Visible on parchment — `--surface-2` equals shell bg in light mode, so unused. */
const skel =
  "animate-pulse rounded-sm border border-[var(--wb-hairline,var(--border))] bg-[var(--wb-canvas,var(--panel))]";

function subscribeNoop() {
  return () => {};
}

/**
 * Soft-nav bridge while `/symbol/...` RSC resolves.
 *
 * Why this exists: homepage uses MarketingAppShell; symbol uses MainAppShell.
 * Pathname flips immediately, so the marketing page unmounts before quote/candles
 * RSC arrives — without this, users only see empty parchment + white panel.
 *
 * Left watchlist width is reserved from localStorage when the user last left it
 * open — otherwise loading.tsx paints full-bleed chart and the real page jumps.
 */
export function SymbolRouteFallback() {
  // Primitives only — object snapshots would break useSyncExternalStore identity checks.
  const watchOpen = useSyncExternalStore(
    subscribeNoop,
    readWatchlistOpen,
    () => false,
  );
  const watchWidth = useSyncExternalStore(
    subscribeNoop,
    readWatchlistWidth,
    () => WATCH_DEFAULT,
  );

  return (
    <div
      className="aw flex h-full min-h-[70dvh] w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--symbol-shell-bg,var(--background))]"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex min-h-0 flex-1">
        {watchOpen ? (
          <aside
            className="hidden shrink-0 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--symbol-shell-bg,var(--background))] lg:flex"
            style={{
              flex: `0 0 ${watchWidth}px`,
              width: watchWidth,
              minWidth: 180,
              maxWidth: "min(420px, 36vw)",
            }}
            aria-hidden
          >
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-2.5">
              <div className={`${skel} h-3.5 w-10`} />
              <div className={`${skel} ml-auto h-6 w-6`} />
            </div>
            <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-2">
              <div className={`${skel} h-3 w-14`} />
              <div className={`${skel} ml-auto h-3 w-10`} />
              <div className={`${skel} h-3 w-10`} />
            </div>
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`${skel} h-7 w-full`} />
              ))}
            </div>
          </aside>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--symbol-shell-bg,var(--background))] px-3">
            <div className={`${skel} h-4 w-16`} />
            <div className={`${skel} h-5 w-24`} />
            <div className={`${skel} h-4 w-14`} />
            <div className={`${skel} ml-auto hidden h-4 w-28 sm:block`} />
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--panel,var(--surface))]">
              <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-2">
                <div className={`${skel} h-5 w-10`} />
                <div className={`${skel} h-5 w-10`} />
                <div className={`${skel} h-5 w-10`} />
              </div>
              <div className="relative min-h-0 flex-1">
                <ChartLoadingOverlay placement="center" />
              </div>
            </div>

            <aside className="hidden w-[min(360px,32vw)] shrink-0 bg-[var(--symbol-shell-bg,var(--background))] lg:block">
              <div className="space-y-3 p-3">
                <div className={`${skel} h-4 w-24`} />
                <div className={`${skel} h-24 w-full`} />
                <div className={`${skel} h-24 w-full`} />
                <div className={`${skel} h-40 w-full`} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
