"use client";

import dynamic from "next/dynamic";
import {
  ChartLoadingOverlay,
  PanelSkeleton,
} from "@/components/ui/panel-skeleton";
import { SymbolDesktopRailSkeleton } from "@/components/symbol/rail/symbol-desktop-rail-skeleton";
import { SymbolWatchlistPaneSkeleton } from "@/components/symbol/watchlist/symbol-watchlist-pane-skeleton";

/**
 * Single source of truth for every lazily-loaded symbol page component.
 *
 * Keeping all `dynamic()` wrappers here means:
 *  - one chunk per panel (shared by the tab panel, stack pane and dock drawer
 *    instead of a near-duplicate wrapper in each of them),
 *  - one skeleton definition, so tab/stack switches don't shift layout,
 *  - heavy, non-critical shells stay out of the initial static import graph.
 */

/** Uniform placeholder shared by all lazy panels. */
function PanelLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="p-4">
      <PanelSkeleton rows={rows} />
    </div>
  );
}

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

// --- Shells not mounted on the initial viewport -----------------------------
// These used to be static imports in symbol-workbench-body / -overlays, so the
// whole watchlist / stack / mobile-plan subtree was shipped even when the panel
// was closed. As dynamic components their chunks load only on first mount.
// (SymbolH5BelowSlot stays static: it IS above the fold on H5, so lazy-loading
//  it would delay visible content rather than help.)

export const SymbolWatchlistPanel = dynamic(
  () =>
    import("@/components/symbol/watchlist/symbol-watchlist-panel").then((m) => ({
      default: m.SymbolWatchlistPanel,
    })),
  // Watchlist-shaped skeleton (name/price/chg cols) — same as the route
  // fallback and the panel's own loading state, so no style flash.
  {
    ssr: false,
    loading: () => <SymbolWatchlistPaneSkeleton chrome rows={8} />,
  },
);

export const SymbolStackBottomPanel = dynamic(
  () =>
    import("@/components/symbol/page/symbol-stack-bottom-panel").then((m) => ({
      default: m.SymbolStackBottomPanel,
    })),
  { ssr: false, loading: () => <PanelLoading rows={6} /> },
);

export const SymbolMobilePlanDrawer = dynamic(
  () =>
    import("@/components/symbol/mobile/symbol-mobile-plan-drawer").then((m) => ({
      default: m.SymbolMobilePlanDrawer,
    })),
  { ssr: false, loading: () => null },
);

// --- Shared tab / stack / dock panels ---------------------------------------
// Previously declared in up to three files each (duplicated chunks and
// divergent skeletons). One wrapper => one chunk, one placeholder.

export const SymbolDerivativesPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-derivatives-panel").then((m) => ({
      default: m.SymbolDerivativesPanel,
    })),
  { ssr: false, loading: () => <PanelLoading rows={6} /> },
);

export const SymbolIndexConstituentsPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-index-constituents-panel").then(
      (m) => ({ default: m.SymbolIndexConstituentsPanel }),
    ),
  { ssr: false, loading: () => <PanelLoading rows={8} /> },
);

export const SymbolFundamentalsPanel = dynamic(
  () =>
    import("@/components/symbol/panels/symbol-fundamentals-panel").then((m) => ({
      default: m.SymbolFundamentalsPanel,
    })),
  { ssr: false, loading: () => <PanelLoading rows={6} /> },
);

export const TradePanel = dynamic(
  () =>
    import("@/components/trading/trade-panel").then((m) => ({
      default: m.TradePanel,
    })),
  { ssr: false, loading: () => <PanelLoading rows={5} /> },
);

export const SymbolPaperRiskBar = dynamic(
  () =>
    import("@/components/symbol/plan/symbol-paper-risk-bar").then((m) => ({
      default: m.SymbolPaperRiskBar,
    })),
  { ssr: false },
);
