import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import { buildSymbolSnapshot } from "@/lib/ai/context/symbol-snapshot";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";
import type { AssetType } from "@/lib/types";

const compareSchema = z.object({
  overview: z.string().min(1),
  dimensions: z
    .array(
      z.object({
        name: z.string(),
        ranking: z.array(z.string()).min(1).max(4),
        note: z.string(),
      }),
    )
    .min(2)
    .max(6),
  calmTakeaway: z.string().min(1),
  risks: z.array(z.string()).min(1).max(8),
});

export type CompareResult = z.infer<typeof compareSchema> & {
  items: Array<{ symbol: string; assetType: AssetType }>;
  sources: Array<{
    symbol: string;
    news: number;
    candleBars: number;
    hasQuote: boolean;
  }>;
  disclaimer: string;
  degraded: boolean;
};

export async function compareSymbols(opts: {
  items: Array<{ symbol: string; assetType: AssetType }>;
  locale?: string;
  userId?: string | null;
}): Promise<CompareResult> {
  const locale = opts.locale || "en";
  const items = opts.items.map((i) => ({
    symbol: i.symbol.toUpperCase(),
    assetType: i.assetType,
  }));

  const snapshots = await Promise.all(
    items.map((i) =>
      buildSymbolSnapshot({
        symbol: i.symbol,
        assetType: i.assetType,
        includeCandles: true,
        newsLimit: 6,
      }),
    ),
  );

  const degraded = snapshots.some((s) => s.degraded);
  const object = await generateAiObject({
    userId: opts.userId,
    schema: compareSchema,
    system: calmMarketSystemPrompt({
      locale,
      extra:
        "Compare the provided symbols on dimensions like momentum, valuation/metrics (if any), sentiment from news, and risk. Rank by relative fit to each dimension using ONLY the data. Emphasize differences — never say which one to buy. calmTakeaway must be observational.",
    }),
    user: `Compare these snapshots:\n${JSON.stringify(
      snapshots.map((s) => ({
        symbol: s.symbol,
        assetType: s.assetType,
        quote: s.quote,
        candles: s.candles
          ? {
              structure: s.candles.structure,
              change5dPct: s.candles.change5dPct,
              change20dPct: s.candles.change20dPct,
              rsi14: s.candles.rsi14,
              macdHist: s.candles.macdHist,
              distToMa25Pct: s.candles.distToMa25Pct,
              recentHigh: s.candles.recentHigh,
              recentLow: s.candles.recentLow,
            }
          : null,
        news: s.news.slice(0, 4),
        metrics: s.metrics.slice(0, 6),
        sources: s.sources,
      })),
    )}`,
    temperature: 0.35,
    timeoutMs: 90_000,
  });

  return {
    ...object,
    items,
    sources: snapshots.map((s) => ({
      symbol: s.symbol,
      news: s.sources.news,
      candleBars: s.sources.candleBars,
      hasQuote: s.sources.hasQuote,
    })),
    disclaimer: aiDisclaimer(locale),
    degraded,
  };
}
