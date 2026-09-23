import { NextResponse } from "next/server";
import { getQuote, getQuotes } from "@/lib/market";
import {
  POPULAR_CRYPTO,
  POPULAR_HK,
  POPULAR_STOCKS,
  parseAssetType,
} from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));
    const popular = searchParams.get("popular");

    if (popular === "1") {
      const list =
        assetType === "crypto"
          ? POPULAR_CRYPTO.map((s) => ({
              symbol: s,
              assetType: "crypto" as const,
            }))
          : assetType === "hk"
            ? POPULAR_HK.map((s) => ({ symbol: s, assetType: "hk" as const }))
            : POPULAR_STOCKS.map((s) => ({
                symbol: s,
                assetType: "stock" as const,
              }));
      const quotes = await getQuotes(list);
      return NextResponse.json({ quotes });
    }

    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const quote = await getQuote(symbol, assetType);
    return NextResponse.json({ quote });
  } catch (err) {
    console.error("quotes", err);
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status?: number }).status) || 502
        : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch quote" },
      { status },
    );
  }
}
