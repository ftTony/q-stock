import { tool } from "ai";
import { z } from "zod";
import { analyzeTrend } from "@/lib/ai/analyze-trend";
import { fetchCandleFeatures } from "@/lib/ai/context/candle-features";
import { buildSymbolSnapshot } from "@/lib/ai/context/symbol-snapshot";
import { getCached, cachedFetch } from "@/lib/cache";
import { getQuote } from "@/lib/market";
import type { AssetType } from "@/lib/types";

const TREND_TTL = 30 * 60_000;

export function createSymbolTools(opts: {
  symbol: string;
  assetType: AssetType;
  userId?: string | null;
  locale?: string;
}) {
  const symbol = opts.symbol.toUpperCase();
  const assetType = opts.assetType;
  const locale = opts.locale || "en";
  const userId = opts.userId ?? null;

  return {
    get_quote: tool({
      description: "Get the latest quote for the locked symbol.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const q = await getQuote(symbol, assetType);
          return {
            symbol,
            assetType,
            price: q.price,
            change: q.change,
            percentChange: q.percentChange,
            high: q.high,
            low: q.low,
            previousClose: q.previousClose,
            timestamp: q.timestamp,
          };
        } catch (err) {
          return {
            error: err instanceof Error ? err.message : "quote failed",
          };
        }
      },
    }),

    get_candles_summary: tool({
      description:
        "Get compact daily candle features (structure, RSI, MACD, key levels). Prefer this over inventing chart patterns.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          return await fetchCandleFeatures({ symbol, assetType });
        } catch (err) {
          return {
            error: err instanceof Error ? err.message : "candles failed",
          };
        }
      },
    }),

    read_chart: tool({
      description:
        "Alias of get_candles_summary — structured K-line features for the locked symbol.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          return await fetchCandleFeatures({ symbol, assetType });
        } catch (err) {
          return {
            error: err instanceof Error ? err.message : "chart read failed",
          };
        }
      },
    }),

    get_news: tool({
      description: "Get recent news headlines for the locked symbol.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(12).optional(),
      }),
      execute: async ({ limit }) => {
        const snap = await buildSymbolSnapshot({
          symbol,
          assetType,
          includeCandles: false,
          newsLimit: limit ?? 8,
        });
        return {
          news: snap.news,
          count: snap.sources.news,
          degraded: snap.degraded,
        };
      },
    }),

    get_earnings: tool({
      description:
        "Get earnings surprises, upcoming calendar, and key metrics (US equities best covered).",
      inputSchema: z.object({}),
      execute: async () => {
        const snap = await buildSymbolSnapshot({
          symbol,
          assetType,
          includeCandles: false,
          newsLimit: 1,
        });
        return {
          earningsSurprises: snap.earningsSurprises,
          earningsUpcoming: snap.earningsUpcoming,
          metrics: snap.metrics,
          count: snap.sources.earnings,
        };
      },
    }),

    get_existing_trend: tool({
      description:
        "Reuse the cached structured trend analysis for this symbol (bias/summary/drivers/risks).",
      inputSchema: z.object({}),
      execute: async () => {
        const scope = userId || "env";
        const cacheKey = `ai:trend:${scope}:${assetType}:${symbol}:${locale}`;
        const hit = await getCached<Awaited<ReturnType<typeof analyzeTrend>>>(
          cacheKey,
        );
        if (hit) return { ...hit, cached: true };
        const result = await cachedFetch(cacheKey, TREND_TTL, () =>
          analyzeTrend({ symbol, assetType, locale, userId }),
        );
        return { ...result, cached: false };
      },
    }),
  };
}

export type SymbolToolSet = ReturnType<typeof createSymbolTools>;
