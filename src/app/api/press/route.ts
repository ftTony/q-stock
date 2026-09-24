import { NextResponse } from "next/server";
import { getPress } from "@/lib/press";
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
      return NextResponse.json({ press: [], degraded: true, source: null });
    }
    const { press, source, degraded } = await getPress(
      symbol.toUpperCase(),
      assetType,
      locale,
    );
    return NextResponse.json({ press, source, degraded });
  } catch (err) {
    console.error("press", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Press releases failed",
        press: [],
        degraded: true,
        source: null,
      },
      { status: 200 },
    );
  }
}
