import { NextResponse } from "next/server";
import { format, subDays } from "date-fns";
import { getCompanyNews, getMarketNews } from "@/lib/finnhub/client";
import { parseAssetType, toFinnhubSymbol } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));

    if (!symbol) {
      const news = await getMarketNews(
        assetType === "crypto" ? "crypto" : "general",
      );
      return NextResponse.json({ news });
    }

    if (assetType === "crypto") {
      const news = await getMarketNews("crypto");
      const filtered = news.filter(
        (n) =>
          n.headline?.toUpperCase().includes(symbol.toUpperCase()) ||
          n.related?.toUpperCase().includes(symbol.toUpperCase()),
      );
      return NextResponse.json({
        news: filtered.length ? filtered : news.slice(0, 20),
      });
    }

    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const fhSym =
      assetType === "hk"
        ? toFinnhubSymbol(symbol, "hk")
        : symbol.toUpperCase();
    const news = await getCompanyNews(fhSym, from, to);
    return NextResponse.json({ news, degraded: assetType === "hk" && news.length === 0 });
  } catch (err) {
    console.error("news", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "News failed", news: [] },
      { status: 502 },
    );
  }
}
