import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveRankBoards } from "@/lib/market/rank-boards";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

type RankBoard = "hot" | "gainers" | "losers" | "all";

function parseBoard(raw: string | null): RankBoard {
  if (raw === "gainers" || raw === "losers" || raw === "hot") return raw;
  return "all";
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

      // Boards come from one provider call; a single board is then sliced out.
      const { boards, source, degraded } = await resolveRankBoards(
        assetType,
        limit,
      );

      if (board === "all") {
        return NextResponse.json({ boards, source, degraded });
      }
      return NextResponse.json({
        quotes: boards[board],
        board,
        source,
        degraded,
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
