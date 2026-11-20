"use client";

import { IconWatchlistSort } from "@/components/symbol/watchlist/watchlist-toggle-icons";
import {
  nextWatchlistSort,
  type WatchlistSortKey,
  type WatchlistSortState,
} from "@/components/symbol/watchlist/sort-watchlist-rows";

type Col = {
  key: WatchlistSortKey;
  label: string;
  align: "left" | "right";
};

type Props = {
  cols: Col[];
  sort: WatchlistSortState;
  onSortChange: (next: WatchlistSortState) => void;
};

export function SymbolWatchlistSortCols({ cols, sort, onSortChange }: Props) {
  return (
    <div
      className="aw-watchlist-cols grid shrink-0 items-center border-b border-[var(--aw-hairline,var(--border))] px-2 text-[var(--muted)]"
      role="row"
    >
      {cols.map((col) => {
        const active = sort?.key === col.key ? sort.dir : null;
        const ariaSort =
          active === "asc"
            ? "ascending"
            : active === "desc"
              ? "descending"
              : "none";
        return (
          <button
            key={col.key}
            type="button"
            role="columnheader"
            aria-sort={ariaSort}
            className={`inline-flex min-w-0 items-center gap-0.5 text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] ${
              col.align === "right" ? "justify-end" : "justify-start"
            }`}
            onClick={() => onSortChange(nextWatchlistSort(sort, col.key))}
          >
            <span className="truncate">{col.label}</span>
            <IconWatchlistSort
              className="h-3 w-2.5 shrink-0"
              direction={active}
            />
          </button>
        );
      })}
    </div>
  );
}
