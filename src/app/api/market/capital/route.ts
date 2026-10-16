import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchFutuCapital } from "@/lib/market/providers/futu-capital";
import { fetchLbCapital } from "@/lib/market/providers/longbridge-research";
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
        return NextResponse.json({ unavailable: true });
      }

      const errors: string[] = [];
      try {
        const data = await fetchLbCapital(symbol, assetType);
        return NextResponse.json({ ...data, source: "longbridge" });
      } catch (err) {
        errors.push(
          `longbridge: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      try {
        const data = await fetchFutuCapital(symbol, assetType);
        return NextResponse.json({ ...data, source: "futu" });
      } catch (err) {
        errors.push(
          `futu: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      console.warn("[capital]", errors.join(" | "));
      return NextResponse.json({
        unavailable: true,
        detail: errors.join(" | "),
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "capital failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
