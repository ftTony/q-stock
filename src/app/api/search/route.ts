import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchSymbols } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const q = searchParams.get("q") || "";
      const assetType = parseAssetType(searchParams.get("assetType"));
      const results = await searchSymbols(q, assetType);
      return NextResponse.json({ results });
    });
  } catch (err) {
    console.error("search", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 502 },
    );
  }
}
