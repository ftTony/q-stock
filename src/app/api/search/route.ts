import { NextResponse } from "next/server";
import { searchSymbols } from "@/lib/market";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const assetType = parseAssetType(searchParams.get("assetType"));
    const results = await searchSymbols(q, assetType);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("search", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 502 },
    );
  }
}
