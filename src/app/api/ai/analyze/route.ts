import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeTrend } from "@/lib/ai/analyze-trend";
import { isAiConfigured } from "@/lib/ai/client";
import { cachedFetch, getCached } from "@/lib/cache";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

const TTL_MS = 30 * 60_000;

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    return await withUserMarket(userId ?? undefined, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }

      const assetType = parseAssetType(searchParams.get("assetType"));
      const locale = searchParams.get("locale") || "en";
      const sym = symbol.toUpperCase();
      const scope = userId || "env";
      const cacheKey = `ai:trend:${scope}:${assetType}:${sym}:${locale}`;

      if (!(await isAiConfigured(userId))) {
        const result = await analyzeTrend({
          symbol: sym,
          assetType,
          locale,
          userId,
        });
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
        analyzeTrend({ symbol: sym, assetType, locale, userId }),
      );

      return NextResponse.json({
        ...result,
        cached: false,
        symbol: sym,
        assetType,
      });
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
