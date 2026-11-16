import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";

/** Models often return null for lists — keep JSON Schema plain, coerce after. */
const stringList = z
  .array(z.string())
  .max(6)
  .nullable()
  .optional()
  .transform((v) =>
    (v ?? [])
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6),
  );

const schema = z.object({
  processSummary: z.string().min(1),
  whatStoodOut: stringList,
  overfittingRisks: stringList,
  nextChecklist: stringList,
});

export type ReplayReviewContent = z.infer<typeof schema>;

export async function buildReplayProcessReview(opts: {
  userId: string;
  locale?: string;
  payload: {
    symbol: string;
    assetType: string;
    strategyName: string;
    rangeFrom: string;
    rangeTo: string;
    metrics: {
      totalReturnPct?: number | null;
      maxDrawdownPct?: number | null;
      buyHoldReturnPct?: number | null;
      winRate?: number | null;
      tradeCount?: number | null;
    };
    assumptions?: Record<string, unknown> | null;
    tradeSample?: Array<{
      side: string;
      price: number;
      qty: number;
      time: number;
    }>;
  };
}): Promise<ReplayReviewContent & { disclaimer: string }> {
  const locale = opts.locale || "en";
  const object = await generateAiObject({
    userId: opts.userId,
    schema,
    system: calmMarketSystemPrompt({
      locale,
      extra:
        "This is an educational rule-replay process review. Emphasize path dependency, sample size, and overfitting risk. Do not recommend live trades or promise returns. Tone matches paper-trading review notes. Respond with a single JSON object whose keys are exactly processSummary (string), whatStoodOut (string[]), overfittingRisks (string[]), nextChecklist (string[]). Use [] for empty lists — never null.",
    }),
    user: JSON.stringify({
      task: "rule_replay_process_review",
      requiredKeys: [
        "processSummary",
        "whatStoodOut",
        "overfittingRisks",
        "nextChecklist",
      ],
      replay: opts.payload,
    }),
    temperature: 0.35,
  });

  return {
    ...object,
    disclaimer: aiDisclaimer(locale),
  };
}
