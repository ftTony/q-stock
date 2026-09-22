import { NextResponse } from "next/server";
import { analyzeTrend } from "@/lib/ai/analyze-trend";
import { isAiConfigured } from "@/lib/ai/client";
import { cachedFetch, getCached } from "@/lib/cache";
import type { AssetType } from "@/lib/types";

const TTL_MS = 30 * 60_000;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const assetType = (
      searchParams.get("assetType") === "crypto" ? "crypto" : "stock"
    ) as AssetType;
    const locale = searchParams.get("locale") || "zh-CN";
    const sym = symbol.toUpperCase();
    const cacheKey = `ai:trend:${assetType}:${sym}:${locale}`;

    if (!isAiConfigured()) {
      const result = await analyzeTrend({ symbol: sym, assetType, locale });
      return NextResponse.json({
        ...result,
        cached: false,
        symbol: sym,
        assetType,
      });
    }

    const hit = await getCached<Awaited<ReturnType<typeof analyzeTrend>>>(
      cacheKey,
    );
    if (hit) {
      return NextResponse.json({
        ...hit,
        cached: true,
        symbol: sym,
        assetType,
      });
    }

    const result = await cachedFetch(cacheKey, TTL_MS, () =>
      analyzeTrend({ symbol: sym, assetType, locale }),
    );

    // Don't cache "unavailable" failures from transient AI errors forever —
    // cachedFetch already stored; if unavailable due to AI failure, still ok for 30m.
    return NextResponse.json({
      ...result,
      cached: false,
      symbol: sym,
      assetType,
    });
  } catch (err) {
    console.error("ai/analyze", err);
    return NextResponse.json(
      {
        available: false,
        error: err instanceof Error ? err.message : "AI analyze failed",
        degraded: true,
        cached: false,
      },
      { status: 502 },
    );
  }
}
