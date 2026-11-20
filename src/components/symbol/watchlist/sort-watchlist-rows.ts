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
  const copy = rows.slice();
  copy.sort((a, b) => {
    if (key === "name") {
      return sign * rowName(a).localeCompare(rowName(b), "zh");
    }
    const av = key === "price" ? rowPrice(a) : rowChg(a);
    const bv = key === "price" ? rowPrice(b) : rowChg(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av === bv) return 0;
    return sign * (av < bv ? -1 : 1);
  });
  return copy;
}
