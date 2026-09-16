import { NextResponse } from "next/server";
import {
  getMarketSentiment,
  getSymbolSentiment,
} from "@/lib/adanos/client";
import type { AssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = (searchParams.get("assetType") || "stock") as AssetType;

    if (!symbol) {
      const market = await getMarketSentiment(assetType);
      return NextResponse.json({ market });
    }

    const sentiment = await getSymbolSentiment(symbol, assetType);
    return NextResponse.json({ sentiment });
  } catch (err) {
    console.error("sentiment", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Sentiment failed",
        degraded: true,
      },
      { status: 200 },
    );
  }
}
