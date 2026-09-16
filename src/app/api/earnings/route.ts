import { NextResponse } from "next/server";
import { getEarnings } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  try {
    const symbol = new URL(req.url).searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }
    const earnings = await getEarnings(symbol.toUpperCase());
    return NextResponse.json({ earnings });
  } catch (err) {
    console.error("earnings", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Earnings failed",
        earnings: [],
        degraded: true,
      },
      { status: 200 },
    );
  }
}
