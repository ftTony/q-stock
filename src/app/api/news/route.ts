import { NextResponse } from "next/server";
import { getMarketNews } from "@/lib/finnhub/client";
import { getSymbolNews } from "@/lib/news";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));
    const locale = searchParams.get("locale") ?? undefined;

    if (!symbol) {
      const news = await getMarketNews(
        assetType === "crypto" ? "crypto" : "general",
      );
      return NextResponse.json({ news });
    }

    const { news, source, degraded } = await getSymbolNews(
      symbol.toUpperCase(),
      assetType,
      locale,
    );
    return NextResponse.json({ news, source, degraded });
  } catch (err) {
    console.error("news", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "News failed", news: [] },
      { status: 502 },
    );
  }
}
