import { NextResponse } from "next/server";
import { getIpoList, parseIpoStatus } from "@/lib/market/ipo";
import { isProviderEnabled } from "@/lib/market/router";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = parseAssetType(searchParams.get("assetType"));
    if (assetType !== "hk") {
      return NextResponse.json({ items: [], source: null });
    }
    if (!isProviderEnabled("longbridge") && !isProviderEnabled("futu")) {
      return NextResponse.json({
        items: [],
        source: null,
        degraded: true,
      });
    }
    const status = parseIpoStatus(searchParams.get("status"));
    const limit = Math.min(
      20,
      Math.max(4, Number(searchParams.get("limit") || 4) || 4),
    );
    const { items, source } = await getIpoList(status, limit);
    return NextResponse.json({
      items,
      status,
      source,
      degraded: items.length === 0,
    });
  } catch (err) {
    console.error("ipo", err);
    return NextResponse.json(
      {
        items: [],
        source: null,
        degraded: true,
        error: err instanceof Error ? err.message : "IPO list failed",
      },
      { status: 200 },
    );
  }
}
