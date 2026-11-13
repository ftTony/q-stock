"use client";

import dynamic from "next/dynamic";
import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";
import { SymbolDesktopRailSkeleton } from "@/components/symbol/rail/symbol-desktop-rail-skeleton";
import { SymbolWatchlistPaneSkeleton } from "@/components/symbol/watchlist/symbol-watchlist-pane-skeleton";

/** Quiet chart host while the chunk loads — no fake candlestick skeleton. */
function ChartChunkPlaceholder() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col bg-[var(--aw-canvas,var(--surface))]">
      <div className="h-9 shrink-0 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--surface)]" />
      <div className="relative min-h-0 flex-1 bg-[var(--panel,var(--surface))]">
        <ChartLoadingOverlay placement="center" />
      </div>
    </div>
  );
}

export const SymbolChartSection = dynamic(
  () =>
    import("@/components/symbol/chart/symbol-chart-section").then((m) => ({
      default: m.SymbolChartSection,
    })),
  {
    ssr: false,
    loading: () => <ChartChunkPlaceholder />,
  },
);

export const SymbolWatchlistPanel = dynamic(
  () =>
    import("@/components/symbol/watchlist/symbol-watchlist-panel").then((m) => ({
      default: m.SymbolWatchlistPanel,
    })),
  {
    ssr: false,
    loading: () => <SymbolWatchlistPaneSkeleton chrome rows={10} />,
  },
);

export const SymbolDockDrawers = dynamic(
  () =>
    import("@/components/symbol/dock/symbol-dock-drawers").then((m) => ({
      default: m.SymbolDockDrawers,
    })),
  { ssr: false },
);

export const SymbolAiFab = dynamic(
  () =>
    import("@/components/symbol/dock/symbol-ai-fab").then((m) => ({
      default: m.SymbolAiFab,
    })),
  { ssr: false },
);

/** Desktop-only — keep out of H5 critical graph. */
export const SymbolDesktopRail = dynamic(
  () =>
    import("@/components/symbol/rail/symbol-desktop-rail").then((m) => ({
      default: m.SymbolDesktopRail,
    })),
  {
    ssr: false,
    loading: () => <SymbolDesktopRailSkeleton />,
  },
);

export const SymbolSideIconRail = dynamic(
  () =>
    import("@/components/symbol/rail/symbol-side-icon-rail").then((m) => ({
      default: m.SymbolSideIconRail,
    })),
  { ssr: false },
);
