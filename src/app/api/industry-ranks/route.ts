import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getIndustryHeatmap,
  isIndustryHeatmapAvailable,
} from "@/lib/market/industry";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const assetType = parseAssetType(searchParams.get("assetType"));
      if (assetType === "crypto") {
        return NextResponse.json({ industries: [], source: null });
      }
      if (!isIndustryHeatmapAvailable()) {
        return NextResponse.json({
          industries: [],
          source: null,
          degraded: true,
        });
      }

      const limit = Math.min(
        60,
        Math.max(10, Number(searchParams.get("limit") || 40) || 40),
      );
      const { industries, source } = await getIndustryHeatmap(assetType, limit);
      return NextResponse.json({
        industries,
        source,
        degraded: industries.length === 0,
      });
    });
  } catch (err) {
    console.error("industry-ranks", err);
    return NextResponse.json(
      {
        industries: [],
        source: null,
        degraded: true,
        error: err instanceof Error ? err.message : "Industry ranks failed",
      },
      { status: 200 },
    );
  }
}
