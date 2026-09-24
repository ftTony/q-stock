import { NextResponse } from "next/server";
import {
  getIpoList,
  parseIpoStatus,
} from "@/lib/market/providers/longbridge-ipo";
import { hasLongbridgeHttpCreds } from "@/lib/market/providers/longbridge-http";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = parseAssetType(searchParams.get("assetType"));
    if (assetType !== "hk") {
      return NextResponse.json({ items: [], source: null });
    }
    if (!hasLongbridgeHttpCreds()) {
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
    const items = await getIpoList(status, limit);
    return NextResponse.json({
      items,
      status,
      source: "longbridge",
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
