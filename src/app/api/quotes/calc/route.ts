import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalysisCalcEnrich } from "@/lib/market/providers/analysis-calc-enrich";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

/** Batch calc enrich (turnover / 涨跌速率 / 多日涨跌幅) for analysis board. */
export async function GET(req: Request) {
  try {
    const session = await auth();
    return await withUserMarket(session?.user?.id, async () => {
      const { searchParams } = new URL(req.url);
      const assetType = parseAssetType(searchParams.get("assetType"));
      const symbolsParam = searchParams.get("symbols");
      if (!symbolsParam) {
        return NextResponse.json(
          { error: "symbols required" },
          { status: 400 },
        );
      }
      const symbols = symbolsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 48);
      if (!symbols.length) {
        return NextResponse.json(
          { error: "symbols required" },
          { status: 400 },
        );
      }
      const rows = await getAnalysisCalcEnrich(symbols, assetType);
      return NextResponse.json({ rows });
    });
  } catch (err) {
    console.error("quotes/calc", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch calc indexes";
    const noCreds = /not configured|No market data providers/i.test(message);
    return NextResponse.json(
      { error: message, code: noCreds ? "NO_CREDENTIALS" : "UPSTREAM" },
      { status: noCreds ? 503 : 502 },
    );
  }
}
