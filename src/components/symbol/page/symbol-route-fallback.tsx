"use client";

import { useSyncExternalStore } from "react";
import { ChartLoadingOverlay, Skel } from "@/components/ui/panel-skeleton";
import { SymbolDesktopRailSkeleton } from "@/components/symbol/rail/symbol-desktop-rail-skeleton";
import { SymbolWatchlistPaneSkeleton } from "@/components/symbol/watchlist/symbol-watchlist-pane-skeleton";
import {
  WATCH_DEFAULT,
  readWatchlistWidth,
} from "@/components/symbol/hooks/use-watchlist-resize";

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
 * Desktop always reserves the left watchlist chrome (row skeletons). Gating on
 * localStorage open-state failed on SSR (`useSyncExternalStore` server snapshot
 * is always false), so loading looked like “自选没有点位”.
 */
export function SymbolRouteFallback() {
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
          <SymbolWatchlistPaneSkeleton chrome fillParent rows={10} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--symbol-shell-bg,var(--background))] px-3">
            <Skel className="h-4 w-16" />
            <Skel className="h-5 w-24" />
            <Skel className="h-4 w-14" />
            <Skel className="ml-auto hidden h-4 w-28 sm:block" />
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--panel,var(--surface))]">
              <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-2">
                <Skel className="h-5 w-10" />
                <Skel className="h-5 w-10" />
                <Skel className="h-5 w-10" />
              </div>
              <div className="relative min-h-0 flex-1">
                <ChartLoadingOverlay placement="center" />
              </div>
            </div>

            <SymbolDesktopRailSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
