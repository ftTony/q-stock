import type { WatchlistItem } from "@/hooks/query/use-watchlist";
import type { Quote } from "@/lib/types";

type WatchlistListCache = {
  items: WatchlistItem[];
};

function sameRow(a: WatchlistItem, q: Quote): boolean {
  return (
    a.assetType === q.assetType &&
    a.symbol.toUpperCase() === q.symbol.toUpperCase()
  );
}

/** Merge a live quote into a watchlist React Query cache entry (list with quotes). */
export function mergeWatchlistQuote(
  prev: WatchlistListCache | undefined,
  incoming: Quote,
): WatchlistListCache | undefined {
  if (!prev?.items?.length || !(incoming.price > 0)) return prev;
  const idx = prev.items.findIndex((row) => sameRow(row, incoming));
  if (idx < 0) return prev;
  const previous = prev.items[idx]?.quote;
  const nextQuote: Quote = {
    ...incoming,
    ...(incoming.name?.trim() || previous?.name
      ? { name: incoming.name?.trim() || previous?.name }
      : {}),
    ...(incoming.preMarket || previous?.preMarket
      ? { preMarket: incoming.preMarket ?? previous?.preMarket }
      : {}),
    ...(incoming.postMarket || previous?.postMarket
      ? { postMarket: incoming.postMarket ?? previous?.postMarket }
      : {}),
    ...(incoming.overnight || previous?.overnight
      ? { overnight: incoming.overnight ?? previous?.overnight }
      : {}),
    ...(incoming.regularSession || previous?.regularSession
      ? {
          regularSession:
            incoming.regularSession ?? previous?.regularSession,
        }
      : {}),
    ...(incoming.activeSession
      ? { activeSession: incoming.activeSession }
      : previous?.activeSession
        ? { activeSession: previous.activeSession }
        : {}),
  };
  const items = prev.items.slice();
  items[idx] = { ...items[idx]!, quote: nextQuote };
  return { ...prev, items };
}
