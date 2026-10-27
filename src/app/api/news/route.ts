import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMarketNews } from "@/lib/finnhub/client";
import { getSymbolNews } from "@/lib/news";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      const assetType = parseAssetType(searchParams.get("assetType"));
      const locale = searchParams.get("locale") ?? undefined;
      const rawLimit = Number(searchParams.get("limit") ?? 40);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(60, Math.max(1, Math.floor(rawLimit)))
        : 40;

      if (!symbol) {
        const news = (await getMarketNews(
          assetType === "crypto" ? "crypto" : "general",
        )).slice(0, limit);
        return NextResponse.json({ news });
      }

      const { news, source, degraded } = await getSymbolNews(
        symbol.toUpperCase(),
        assetType,
        locale,
      );
      return NextResponse.json({
        news: news.slice(0, limit),
        source,
        degraded,
      });
    });
  } catch (err) {
    console.error("news", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "News failed", news: [] },
      { status: 502 },
    );
  }
}
