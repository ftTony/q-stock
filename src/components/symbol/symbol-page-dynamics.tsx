"use client";

import dynamic from "next/dynamic";
import {
  ChartAreaSkeleton,
  RailPanelSkeleton,
} from "@/components/ui/panel-skeleton";

export const SymbolChartSection = dynamic(
  () =>
    import("@/components/symbol/symbol-chart-section").then((m) => ({
      default: m.SymbolChartSection,
    })),
  { ssr: false, loading: () => <ChartAreaSkeleton /> },
);

export const SymbolWatchlistPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-watchlist-panel").then((m) => ({
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
    import("@/components/symbol/symbol-dock-drawers").then((m) => ({
      default: m.SymbolDockDrawers,
    })),
  { ssr: false },
);

export const SymbolAiFab = dynamic(
  () =>
    import("@/components/symbol/symbol-ai-fab").then((m) => ({
      default: m.SymbolAiFab,
    })),
  { ssr: false },
);
