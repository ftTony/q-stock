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
  // Skip the whole update when nothing observable changed. Live feeds repeat
  // identical ticks often; avoiding a new cache object stops every watchlist
  // row from re-rendering for no reason.
  if (
    previous &&
    previous.price === incoming.price &&
    previous.change === incoming.change &&
    previous.percentChange === incoming.percentChange &&
    previous.volume === incoming.volume &&
    previous.turnover === incoming.turnover &&
    previous.timestamp === incoming.timestamp
  ) {
    return prev;
  }
  const nextQuote: Quote = {
    ...incoming,
    ...(incoming.name?.trim() || previous?.name
      ? { name: incoming.name?.trim() || previous?.name }
      : {}),
    ...(incoming.nameZh?.trim() || previous?.nameZh
      ? { nameZh: incoming.nameZh?.trim() || previous?.nameZh }
      : {}),
    ...(incoming.nameEn?.trim() || previous?.nameEn
      ? { nameEn: incoming.nameEn?.trim() || previous?.nameEn }
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

/**
 * Merge a batch of live quotes in a single cache update. This is the
 * high-frequency path (WS ticks): one `setQueryData` per animation frame
 * instead of one per message keeps the watchlist off the render hot path.
 */
export function mergeWatchlistQuotes(
  prev: WatchlistListCache | undefined,
  quotes: readonly Quote[],
): WatchlistListCache | undefined {
  if (!prev?.items?.length || quotes.length === 0) return prev;
  let items: WatchlistItem[] | null = null;
  for (const incoming of quotes) {
    if (!(incoming.price > 0)) continue;
    const source = items ?? prev.items;
    const idx = source.findIndex((row) => sameRow(row, incoming));
    if (idx < 0) continue;
    const previous = source[idx]!.quote;
    if (
      previous &&
      previous.price === incoming.price &&
      previous.change === incoming.change &&
      previous.percentChange === incoming.percentChange &&
      previous.volume === incoming.volume &&
      previous.turnover === incoming.turnover &&
      previous.timestamp === incoming.timestamp
    ) {
      continue;
    }
    if (!items) items = prev.items.slice();
    const nextQuote: Quote = {
      ...incoming,
      ...(incoming.name?.trim() || previous?.name
        ? { name: incoming.name?.trim() || previous?.name }
        : {}),
      ...(incoming.nameZh?.trim() || previous?.nameZh
        ? { nameZh: incoming.nameZh?.trim() || previous?.nameZh }
        : {}),
      ...(incoming.nameEn?.trim() || previous?.nameEn
        ? { nameEn: incoming.nameEn?.trim() || previous?.nameEn }
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
    items[idx] = { ...source[idx]!, quote: nextQuote };
  }
  return items ? { ...prev, items } : prev;
}
