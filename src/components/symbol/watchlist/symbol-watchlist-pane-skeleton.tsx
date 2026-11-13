"use client";

import { Skel } from "@/components/ui/panel-skeleton";

type Props = {
  /** Accessible label (e.g. common.loading). */
  label?: string;
  /** Include head + column labels (dynamic-import / route fallback). */
  chrome?: boolean;
  /**
   * Fill a sized parent instead of locking watchlist width
   * (route fallback already sets the aside width).
   */
  fillParent?: boolean;
  rows?: number;
  className?: string;
};

const ROW_COLS =
  "minmax(0, 1.4fr) minmax(0, 0.9fr) minmax(0, 0.85fr)";

/**
 * Watchlist-shaped skeleton — name/code · price · change.
 * Do not reuse RailPanelSkeleton here (that layout is for the right rail).
 */
export function SymbolWatchlistPaneSkeleton({
  label,
  chrome = false,
  fillParent = false,
  rows = 10,
  className = "",
}: Props) {
  const list = (
    <div className="min-h-0 flex-1 overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="box-border grid h-11 items-center gap-x-1 border-b border-[var(--aw-hairline,var(--border))] px-2"
          style={{ gridTemplateColumns: ROW_COLS }}
        >
          <div className="min-w-0 space-y-1.5">
            <Skel className="h-3 w-[72%]" />
            <Skel className="h-2.5 w-[48%]" />
          </div>
          <div className="flex justify-end">
            <Skel className="h-3 w-12" />
          </div>
          <div className="flex justify-end">
            <Skel className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!chrome) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={`min-h-0 flex-1 overflow-hidden ${className}`}
      >
        {list}
        {label ? <span className="sr-only">{label}</span> : null}
      </div>
    );
  }

  return (
    <aside
      role="status"
      aria-busy="true"
      aria-label={label}
      className={
        fillParent
          ? `flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--aw-canvas,var(--surface))] ${className}`
          : `aw-watchlist-pane flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--surface))] ${className}`
      }
      style={
        fillParent
          ? undefined
          : {
              width: "var(--aw-watchlist-width, 260px)",
              flex: "0 0 var(--aw-watchlist-width, 260px)",
            }
      }
    >
      <div className="aw-watchlist-head flex shrink-0 items-center justify-between gap-1 border-b border-[var(--aw-hairline,var(--border))] px-2.5">
        <Skel className="h-3.5 w-10" />
        <div className="flex items-center gap-0.5">
          <Skel className="h-6 w-6" />
          <Skel className="h-6 w-6" />
        </div>
      </div>
      <div
        className="aw-watchlist-cols box-border grid shrink-0 items-center border-b border-[var(--aw-hairline,var(--border))] px-2"
        style={{ gridTemplateColumns: ROW_COLS }}
        aria-hidden
      >
        <Skel className="h-3 w-14" />
        <div className="flex justify-end">
          <Skel className="h-3 w-10" />
        </div>
        <div className="flex justify-end">
          <Skel className="h-3 w-10" />
        </div>
      </div>
      {list}
      {label ? <span className="sr-only">{label}</span> : null}
    </aside>
  );
}
