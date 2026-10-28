"use client";

import dynamic from "next/dynamic";
import {
  ChartAreaSkeleton,
  RailPanelSkeleton,
} from "@/components/ui/panel-skeleton";

export const SymbolChartSection = dynamic(
  () =>
    import("@/components/symbol/chart/symbol-chart-section").then((m) => ({
      default: m.SymbolChartSection,
    })),
  { ssr: false, loading: () => <ChartAreaSkeleton /> },
);

export const SymbolWatchlistPanel = dynamic(
  () =>
    import("@/components/symbol/watchlist/symbol-watchlist-panel").then((m) => ({
      default: m.SymbolWatchlistPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-0 w-[var(--aw-watchlist-width,280px)] flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--surface))]">
        <RailPanelSkeleton rows={10} className="min-h-0 flex-1" />
      </div>
    ),
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
    loading: () => (
      <aside className="aw-rail hidden min-h-0 flex-col border-l border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--surface))] lg:flex lg:w-[var(--aw-rail-width,360px)]">
        <RailPanelSkeleton rows={8} className="min-h-0 flex-1" />
      </aside>
    ),
  },
);

export const SymbolSideIconRail = dynamic(
  () =>
    import("@/components/symbol/rail/symbol-side-icon-rail").then((m) => ({
      default: m.SymbolSideIconRail,
    })),
  { ssr: false },
);
