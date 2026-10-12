import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getLongbridgeRankBoards,
  getLongbridgeRankList,
  isLongbridgeRankConfigured,
  type RankBoard,
} from "@/lib/market/providers/longbridge-rank";
import {
  getFutuRankBoards,
  getFutuRankList,
} from "@/lib/market/providers/futu-rank";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import { getQuotes } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import {
  POPULAR_CN,
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

/** Broker rank APIs can hang; fail fast so popular quotes can serve. */
const RANK_PROVIDER_TIMEOUT_MS = 4_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const assetType = parseAssetType(searchParams.get("assetType"));
      const board = parseBoard(searchParams.get("board"));
      const limit = Math.min(
        50,
        Math.max(5, Number(searchParams.get("limit") || 15) || 15),
      );

      if (assetType === "crypto") {
        const quotes = await getQuotes(
          POPULAR_CRYPTO.map((s) => ({
            symbol: s,
            assetType: "crypto" as const,
          })),
        );
        return NextResponse.json({
          quotes,
          board: "hot",
          boards: { hot: quotes, gainers: [], losers: [] },
          source: "popular",
        });
      }

      // Equity boards: Longbridge → Futu → popular fallback
      if (isLongbridgeRankConfigured()) {
        try {
          if (board === "all") {
            const boards = await withTimeout(
              getLongbridgeRankBoards(assetType, limit),
              RANK_PROVIDER_TIMEOUT_MS,
              "longbridge ranks",
            );
            return NextResponse.json({
              boards,
              source: "longbridge",
            });
          }
          const quotes = await withTimeout(
            getLongbridgeRankList(assetType, board, limit),
            RANK_PROVIDER_TIMEOUT_MS,
            "longbridge ranks",
          );
          return NextResponse.json({
            quotes,
            board,
            source: "longbridge",
          });
        } catch (err) {
          console.warn(
            "[ranks] longbridge failed, fallback:",
            err instanceof Error ? err.message : err,
          );
        }
      }

      if (assetType !== "cn" && isFutuConfigured()) {
        try {
          if (board === "all") {
            const boards = await withTimeout(
              getFutuRankBoards(assetType, limit),
              RANK_PROVIDER_TIMEOUT_MS,
              "futu ranks",
            );
            return NextResponse.json({ boards, source: "futu" });
          }
          const quotes = await withTimeout(
            getFutuRankList(assetType, board, limit),
            RANK_PROVIDER_TIMEOUT_MS,
            "futu ranks",
          );
          return NextResponse.json({ quotes, board, source: "futu" });
        } catch (err) {
          console.warn(
            "[ranks] futu failed, fallback popular:",
            err instanceof Error ? err.message : err,
          );
        }
      }

      const list =
        assetType === "hk"
          ? POPULAR_HK.map((s) => ({ symbol: s, assetType: "hk" as const }))
          : assetType === "cn"
            ? POPULAR_CN.map((s) => ({ symbol: s, assetType: "cn" as const }))
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
