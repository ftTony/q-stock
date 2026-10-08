import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import { fetchCandleFeatures } from "@/lib/ai/context/candle-features";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";
import type { AssetType } from "@/lib/types";

const chartReadSchema = z.object({
  structure: z.string().min(1),
  keyLevels: z.array(z.number()).max(8),
  whatWouldChangeMind: z.string().min(1),
  notes: z.array(z.string()).max(6),
});

export type ChartReadResult = z.infer<typeof chartReadSchema> & {
  features: Awaited<ReturnType<typeof fetchCandleFeatures>>;
  disclaimer: string;
  degraded: boolean;
};

export async function readChart(opts: {
  symbol: string;
  assetType: AssetType;
  locale?: string;
  userId?: string | null;
}): Promise<ChartReadResult> {
  const locale = opts.locale || "en";
  const symbol = opts.symbol.toUpperCase();
  const features = await fetchCandleFeatures({
    symbol,
    assetType: opts.assetType,
  });

  const degraded = features.barCount < 20;
  const object = await generateAiObject({
    userId: opts.userId,
    schema: chartReadSchema,
    system: calmMarketSystemPrompt({
      locale,
      lockedSymbol: symbol,
      lockedAssetType: opts.assetType,
      extra:
        "Interpret ONLY the provided candle features. Output structure narrative, numeric key levels from the data, and a clear invalidation condition (whatWouldChangeMind).",
    }),
    user: `Chart features for ${symbol} (${opts.assetType}):\n${JSON.stringify(features)}`,
    temperature: 0.3,
  });

  return {
    ...object,
    features,
    disclaimer: aiDisclaimer(locale),
    degraded,
  };
}
