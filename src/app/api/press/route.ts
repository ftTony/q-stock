import { NextResponse } from "next/server";
import { getPressReleases } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  try {
    const symbol = new URL(req.url).searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }
    const press = await getPressReleases(symbol.toUpperCase());
    return NextResponse.json({
      press,
      degraded: press.length === 0,
    });
  } catch (err) {
    console.error("press", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Press releases failed",
        press: [],
        degraded: true,
      },
      { status: 200 },
    );
  }
}
