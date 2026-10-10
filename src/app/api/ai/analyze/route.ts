import { NextResponse } from "next/server";
import { analyzeTrend } from "@/lib/ai/analyze-trend";
import { isAiConfigured } from "@/lib/ai/client";
import {
  aiQuotaExceededResponse,
  requireAiUser,
} from "@/lib/ai/http";
import { consumeAiQuota } from "@/lib/ai/usage";
import { cachedFetch, deleteCached, getCached, setCached } from "@/lib/cache";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

/** One generation per symbol/locale/user per day unless refresh=1. */
const TTL_MS = 24 * 60 * 60_000;

export async function GET(req: Request) {
  try {
    const gate = await requireAiUser();
    if (!gate.ok) return gate.response;
    const { userId } = gate;

    return await withUserMarket(userId, async () => {
      const { searchParams } = new URL(req.url);
      const symbol = searchParams.get("symbol");
      if (!symbol) {
        return NextResponse.json({ error: "symbol required" }, { status: 400 });
      }

      const assetType = parseAssetType(searchParams.get("assetType"));
      const locale = searchParams.get("locale") || "en";
      const refresh = searchParams.get("refresh") === "1";
      const sym = symbol.toUpperCase();
      const cacheKey = `ai:trend:${userId}:${assetType}:${sym}:${locale}`;

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

      if (!refresh) {
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
      } else {
        await deleteCached(cacheKey);
      }

      const quota = await consumeAiQuota(userId, 1);
      if (!quota.ok) {
        return aiQuotaExceededResponse(quota);
      }

      const result = refresh
        ? await (async () => {
            const value = await analyzeTrend({
              symbol: sym,
              assetType,
              locale,
              userId,
            });
            await setCached(cacheKey, value, TTL_MS);
            return value;
          })()
        : await cachedFetch(cacheKey, TTL_MS, () =>
            analyzeTrend({ symbol: sym, assetType, locale, userId }),
          );

      return NextResponse.json({
        ...result,
        cached: false,
        symbol: sym,
        assetType,
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
        },
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
