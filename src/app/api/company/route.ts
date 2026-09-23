import { NextResponse } from "next/server";
import { getCompanyData } from "@/lib/company";
import { parseAssetType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const assetType = parseAssetType(searchParams.get("assetType"));
    const locale = searchParams.get("locale") ?? undefined;
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }
    if (assetType === "crypto") {
      return NextResponse.json({
        profile: null,
        officers: [],
        source: null,
        degraded: true,
      });
    }
    const data = await getCompanyData(symbol.toUpperCase(), assetType, locale);
    return NextResponse.json(data);
  } catch (err) {
    console.error("company", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Company data failed",
        profile: null,
        officers: [],
        source: null,
        degraded: true,
      },
      { status: 200 },
    );
  }
}