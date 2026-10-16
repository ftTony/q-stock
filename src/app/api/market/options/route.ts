import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  fetchLbOptionChain,
  fetchLbOptionExpiries,
} from "@/lib/market/providers/longbridge-research";
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
      const expiry = searchParams.get("expiry");
      const spot = Number(searchParams.get("spot") || 0);
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }
      if (assetType !== "stock" && assetType !== "hk") {
        return NextResponse.json({ unavailable: true });
      }

      try {
        if (!expiry) {
          const expiries = await fetchLbOptionExpiries(symbol, assetType);
          return NextResponse.json({ expiries });
        }
        const chain = await fetchLbOptionChain(
          symbol,
          assetType,
          expiry,
          Number.isFinite(spot) ? spot : 0,
        );
        return NextResponse.json(chain);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[options]", msg);
        const conn = /connections (limitation|exhausted)/i.test(msg);
        const noPkg =
          /no option-chain access|USOption|404000|api not found/i.test(msg);
        return NextResponse.json({
          unavailable: true,
          detail: msg,
          code: conn
            ? "LB_CONN_LIMIT"
            : noPkg
              ? "LB_OPTION_PACKAGE"
              : undefined,
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "options failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
