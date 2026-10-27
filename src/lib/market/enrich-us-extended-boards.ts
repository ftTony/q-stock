import { getQuotes } from "@/lib/market";
import { mergeExtendedOntoRank } from "@/lib/market/extended-hours";
import { getUsMarketPhase } from "@/lib/market/session";
import type { RankQuote } from "@/lib/market/providers/longbridge-rank";
import type { RankBoard } from "@/lib/market/providers/longbridge-rank";

type Boards = Record<RankBoard, RankQuote[]>;

/**
 * Attach US pre/post/overnight snapshots onto rank boards (one batched quote call).
 * Caps unique symbols to keep the 1GB host happy.
 */
export async function enrichUsExtendedBoards(
  boards: Boards,
  maxSymbols = 36,
): Promise<Boards> {
  const phase = getUsMarketPhase();
  const seen = new Set<string>();
  const items: { symbol: string; assetType: "stock" }[] = [];
  for (const key of ["hot", "gainers", "losers"] as RankBoard[]) {
    for (const row of boards[key] ?? []) {
      if (row.assetType !== "stock") continue;
      if (seen.has(row.symbol)) continue;
      seen.add(row.symbol);
      items.push({ symbol: row.symbol, assetType: "stock" });
      if (items.length >= maxSymbols) break;
    }
    if (items.length >= maxSymbols) break;
  }
  if (!items.length) return boards;

  try {
    const quotes = await getQuotes(items);
    const bySym = new Map(quotes.map((q) => [q.symbol, q]));
    const mapBoard = (rows: RankQuote[]) =>
      rows.map((row) =>
        row.assetType === "stock"
          ? mergeExtendedOntoRank(row, bySym.get(row.symbol), phase)
          : row,
      );
    return {
      hot: mapBoard(boards.hot ?? []),
      gainers: mapBoard(boards.gainers ?? []),
      losers: mapBoard(boards.losers ?? []),
    };
  } catch (err) {
    console.warn(
      "[ranks] US extended enrich failed:",
      err instanceof Error ? err.message : err,
    );
    return boards;
  }
}
