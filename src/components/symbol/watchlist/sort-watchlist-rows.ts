import type { WatchlistItem } from "@/hooks/query/use-watchlist";
import {
  regularQuoteDisplay,
} from "@/lib/market/extended-hours";
import { displayName } from "@/lib/market-names";

export type WatchlistSortKey = "name" | "price" | "chg";
export type WatchlistSortDir = "asc" | "desc";

export type WatchlistSortState = {
  key: WatchlistSortKey;
  dir: WatchlistSortDir;
} | null;

/** First click defaults: name A→Z; price/chg high→low. */
export function nextWatchlistSort(
  prev: WatchlistSortState,
  key: WatchlistSortKey,
): WatchlistSortState {
  if (!prev || prev.key !== key) {
    return { key, dir: key === "name" ? "asc" : "desc" };
  }
  return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
}

function rowPrice(row: WatchlistItem): number | null {
  const q = row.quote;
  if (!q) return null;
  if (row.assetType === "stock") {
    return regularQuoteDisplay(q).price;
  }
  return q.price > 0 ? q.price : null;
}

function rowChg(row: WatchlistItem): number | null {
  const q = row.quote;
  if (!q) return null;
  if (row.assetType === "stock") {
    return regularQuoteDisplay(q).percentChange;
  }
  return q.percentChange;
}

function rowName(row: WatchlistItem): string {
  return displayName(row.symbol, row.assetType, row.quote?.name).toLowerCase();
}

export function sortWatchlistRows(
  rows: WatchlistItem[],
  sort: WatchlistSortState,
): WatchlistItem[] {
  if (!sort || rows.length < 2) return rows;
  const { key, dir } = sort;
  const sign = dir === "asc" ? 1 : -1;

  // Decorate once: displayName()/regularQuoteDisplay() and Intl localeCompare
  // are relatively expensive; computing them per comparison is O(n log n).
  // Precomputing keeps the comparator cheap, which matters on every WS tick.
  const decorated = rows.map((row) => ({
    row,
    name: key === "name" ? rowName(row) : "",
    value:
      key === "name"
        ? 0
        : (key === "price" ? rowPrice(row) : rowChg(row)) ?? Number.NaN,
  }));

  decorated.sort((a, b) => {
    if (key === "name") {
      return sign * a.name.localeCompare(b.name, "zh");
    }
    // NaN sorts last regardless of direction.
    const aNaN = Number.isNaN(a.value);
    const bNaN = Number.isNaN(b.value);
    if (aNaN && bNaN) return 0;
    if (aNaN) return 1;
    if (bNaN) return -1;
    if (a.value === b.value) return 0;
    return sign * (a.value < b.value ? -1 : 1);
  });
  return decorated.map((d) => d.row);
}
