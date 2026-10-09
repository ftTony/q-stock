import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuotes } from "@/lib/market";
import { defsToIndexQuotes } from "@/lib/market/index-quotes";
import { indicesForMarket } from "@/lib/market/indices";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const assetType = parseAssetType(searchParams.get("assetType"));
      const defs = indicesForMarket(assetType);
      if (!defs.length) {
        return NextResponse.json({ indices: [], quotes: [] });
      }

      const quotes = await getQuotes(
        defs.map((d) => ({ symbol: d.symbol, assetType: d.assetType })),
      );
      const indices = defsToIndexQuotes(defs, quotes);

      return NextResponse.json({ indices, source: quotes[0]?.source ?? null });
    });
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
