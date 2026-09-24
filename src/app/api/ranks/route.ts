import { NextResponse } from "next/server";
import {
  getLongbridgeRankBoards,
  getLongbridgeRankList,
  isLongbridgeRankConfigured,
  type RankBoard,
} from "@/lib/market/providers/longbridge-rank";
import { getQuotes } from "@/lib/market";
import {
  POPULAR_CRYPTO,
  POPULAR_HK,
  POPULAR_STOCKS,
  parseAssetType,
  type Quote,
} from "@/lib/types";

function parseBoard(raw: string | null): RankBoard | "all" {
  if (raw === "gainers" || raw === "losers" || raw === "hot" || raw === "all") {
    return raw;
  }
  return "all";
}

function sortBoards(quotes: Quote[], limit: number) {
  const hot = quotes.slice(0, limit);
  const gainers = [...quotes]
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, limit);
  const losers = [...quotes]
    .sort((a, b) => a.percentChange - b.percentChange)
    .slice(0, limit);
  return { hot, gainers, losers };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = parseAssetType(searchParams.get("assetType"));
    const board = parseBoard(searchParams.get("board"));
    const limit = Math.min(
      50,
      Math.max(5, Number(searchParams.get("limit") || 15) || 15),
    );

    if (assetType === "crypto") {
      const quotes = await getQuotes(
        POPULAR_CRYPTO.map((s) => ({ symbol: s, assetType: "crypto" as const })),
      );
      return NextResponse.json({
        quotes,
        board: "hot",
        boards: { hot: quotes, gainers: [], losers: [] },
        source: "popular",
      });
    }

    if (isLongbridgeRankConfigured()) {
      try {
        if (board === "all") {
          const boards = await getLongbridgeRankBoards(assetType, limit);
          return NextResponse.json({
            boards,
            source: "longbridge",
          });
        }
        const quotes = await getLongbridgeRankList(assetType, board, limit);
        return NextResponse.json({
          quotes,
          board,
          source: "longbridge",
        });
      } catch (err) {
        console.warn(
          "[ranks] longbridge failed, fallback popular:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    const list =
      assetType === "hk"
        ? POPULAR_HK.map((s) => ({ symbol: s, assetType: "hk" as const }))
        : POPULAR_STOCKS.map((s) => ({
            symbol: s,
            assetType: "stock" as const,
          }));
    const quotes = await getQuotes(list);
    if (board === "all") {
      return NextResponse.json({
        boards: sortBoards(quotes, limit),
        source: "popular-fallback",
        degraded: true,
      });
    }
    const boards = sortBoards(quotes, limit);
    return NextResponse.json({
      quotes: boards[board],
      board,
      source: "popular-fallback",
      degraded: true,
    });
  } catch (err) {
    console.error("ranks", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Rank list failed",
        quotes: [],
        boards: { hot: [], gainers: [], losers: [] },
      },
      { status: 502 },
    );
  }
}
