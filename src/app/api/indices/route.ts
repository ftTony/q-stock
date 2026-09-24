import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/market";
import { indicesForMarket } from "@/lib/market/indices";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = parseAssetType(searchParams.get("assetType"));
    const defs = indicesForMarket(assetType);
    if (!defs.length) {
      return NextResponse.json({ indices: [], quotes: [] });
    }

    const quotes = await getQuotes(
      defs.map((d) => ({ symbol: d.symbol, assetType: d.assetType })),
    );
    const bySym = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    const indices = defs.map((d) => {
      const q = bySym.get(d.symbol.toUpperCase());
      return {
        id: d.id,
        symbol: d.symbol,
        nameKey: d.nameKey,
        assetType: d.assetType,
        price: q?.price ?? null,
        change: q?.change ?? null,
        percentChange: q?.percentChange ?? null,
        open: q?.open ?? null,
        high: q?.high ?? null,
        low: q?.low ?? null,
        previousClose: q?.previousClose ?? null,
        timestamp: q?.timestamp ?? null,
      };
    });

    return NextResponse.json({ indices, source: quotes[0]?.source ?? null });
  } catch (err) {
    console.error("indices", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Indices failed",
        indices: [],
      },
      { status: 502 },
    );
  }
}
