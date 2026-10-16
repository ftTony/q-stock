import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ADVANCED_QUOTES_REQUIRED,
  canUseAdvancedQuotes,
} from "@/lib/market/advanced-quotes";
import { fetchLbDepth } from "@/lib/market/providers/longbridge-book";
import { MarketDataError } from "@/lib/market/types";
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
      if (assetType === "crypto") {
        return NextResponse.json({ bids: [], asks: [], unavailable: true });
      }
      if (!canUseAdvancedQuotes()) {
        return NextResponse.json(
          {
            bids: [],
            asks: [],
            unavailable: true,
            code: ADVANCED_QUOTES_REQUIRED,
          },
          { status: 403 },
        );
      }
      try {
        const book = await fetchLbDepth(symbol, assetType, 10);
        return NextResponse.json(book);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[depth]", msg);
        return NextResponse.json({
          bids: [],
          asks: [],
          unavailable: true,
          detail: msg,
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "depth failed";
    if (err instanceof MarketDataError) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
