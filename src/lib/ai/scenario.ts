import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import { buildSymbolSnapshot } from "@/lib/ai/context/symbol-snapshot";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";
import type { AssetType } from "@/lib/types";

const scenarioSchema = z.object({
  regimes: z
    .array(
      z.object({
        name: z.string(),
        probability: z.number().min(0).max(1),
        invalidation: z.string(),
        watchLevels: z.array(z.number()).max(4),
      }),
    )
    .min(1)
    .max(4),
  paperDraft: z
    .object({
      side: z.enum(["buy", "sell"]).optional(),
      type: z.enum(["limit", "stop"]).optional(),
      price: z.number().positive().optional(),
      rationale: z.string(),
      sizeHintPct: z.number().min(0).max(20),
    })
    .nullable(),
  calmReminder: z.string().min(1),
});

export type ScenarioResult = z.infer<typeof scenarioSchema> & {
  symbol: string;
  assetType: AssetType;
  disclaimer: string;
};

export async function buildScenario(opts: {
  symbol: string;
  assetType: AssetType;
  locale?: string;
  userId?: string | null;
  paper?: {
    cashBalance?: number;
    positionQty?: number;
    avgCost?: number;
  };
}): Promise<ScenarioResult> {
  const locale = opts.locale || "en";
  const symbol = opts.symbol.toUpperCase();
  const snap = await buildSymbolSnapshot({
    symbol,
    assetType: opts.assetType,
    includeCandles: true,
    newsLimit: 6,
  });

  const object = await generateAiObject({
    userId: opts.userId,
    schema: scenarioSchema,
    system: calmMarketSystemPrompt({
      locale,
      lockedSymbol: symbol,
      lockedAssetType: opts.assetType,
      extra:
        "Produce calm scenario regimes (continuation / range / invalidation). paperDraft may suggest ONLY limit or stop (never market) with sizeHintPct ≤ 20 for paper trading. If data is thin, set paperDraft to null. Always include calmReminder that this is not investment advice.",
    }),
    user: JSON.stringify({
      snapshot: {
        quote: snap.quote,
        candles: snap.candles,
        news: snap.news.slice(0, 4),
        sources: snap.sources,
      },
      paper: opts.paper ?? null,
    }),
    temperature: 0.35,
  });

  // Hard enforce: never market; cap size
  if (object.paperDraft) {
    if (object.paperDraft.type && !["limit", "stop"].includes(object.paperDraft.type)) {
      object.paperDraft.type = "limit";
    }
    object.paperDraft.sizeHintPct = Math.min(
      20,
      Math.max(0, object.paperDraft.sizeHintPct),
    );
  }

  return {
    ...object,
    symbol,
    assetType: opts.assetType,
    disclaimer: aiDisclaimer(locale),
  };
}
