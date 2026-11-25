import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIndustryHeatmap } from "@/lib/market/industry";
import {
  getFutuIndustryStocksPage,
  looksLikeFutuPlateCode,
} from "@/lib/market/providers/futu-industry-stocks";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Paginated industry members for the analysis table.
 * Prefer Futu plate-stock when `industryId` is a plate code; otherwise seed
 * from the heatmap embed (single page).
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const industryId = (searchParams.get("industryId") || "").trim();
      const assetType = parseAssetType(searchParams.get("assetType"));
      const nextKey = searchParams.get("nextKey") || "";
      const loaded = Math.max(
        0,
        Math.min(500, Number(searchParams.get("loaded") || 0) || 0),
      );

      if (!industryId) {
        return NextResponse.json(
          { error: "industryId required", stocks: [], hasMore: false },
          { status: 400 },
        );
      }
      if (assetType !== "stock" && assetType !== "hk" && assetType !== "cn") {
        return NextResponse.json(
          { error: "unsupported market", stocks: [], hasMore: false },
          { status: 400 },
        );
      }

      if (looksLikeFutuPlateCode(industryId)) {
        const page = await getFutuIndustryStocksPage(
          industryId,
          assetType,
          nextKey,
          loaded,
        );
        return NextResponse.json(page);
      }

      // Longbridge chart embed: one-shot page (no cursor).
      if (nextKey || loaded > 0) {
        return NextResponse.json({
          stocks: [],
          nextKey: null,
          hasMore: false,
          total: loaded,
          source: "seed",
        });
      }
      const heatmap = await getIndustryHeatmap(assetType, 40);
      const cell = heatmap.industries.find((i) => i.id === industryId);
      const stocks = cell?.stocks ?? [];
      return NextResponse.json({
        stocks,
        nextKey: null,
        hasMore: false,
        total: stocks.length,
        source: "seed",
      });
    });
  } catch (err) {
    console.error("industries/stocks", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed",
        stocks: [],
        nextKey: null,
        hasMore: false,
        total: 0,
      },
      { status: 502 },
    );
  }
}
