import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchLbShort } from "@/lib/market/providers/longbridge-research";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      const assetType = parseAssetType(searchParams.get("assetType"));
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }
      if (assetType === "crypto" || assetType === "cn") {
        return NextResponse.json({ rows: [], unavailable: true });
      }
      try {
        const rows = await fetchLbShort(symbol, assetType, 30);
        return NextResponse.json({ rows });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[short]", msg);
        return NextResponse.json({
          rows: [],
          unavailable: true,
          detail: msg,
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "short failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
