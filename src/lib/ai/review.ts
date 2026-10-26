import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";
import { prisma } from "@/lib/db";
import { buildProcessSummary } from "@/lib/review/process-summary";

const reviewSchema = z.object({
  whatWentWell: z.array(z.string()).max(8),
  whatToImprove: z.array(z.string()).max(8),
  emotionFlags: z.array(z.string()).max(8),
  nextChecklist: z.array(z.string()).max(8),
  summary: z.string().min(1),
});

export type ReviewContent = z.infer<typeof reviewSchema>;

export type ReviewResult = ReviewContent & {
  period: "day" | "week";
  orderIds: string[];
  disclaimer: string;
  noteId?: string;
};

export async function buildTradeReview(opts: {
  userId: string;
  period: "day" | "week";
  locale?: string;
  save?: boolean;
}): Promise<ReviewResult> {
  const locale = opts.locale || "en";
  const process = await buildProcessSummary({
    userId: opts.userId,
    period: opts.period,
  });

  const object = await generateAiObject({
    userId: opts.userId,
    schema: reviewSchema,
    system: calmMarketSystemPrompt({
      locale,
      extra:
        "This is a paper-trading process review. Focus on process: chase/FOMO, revenge trading, oversizing, ignoring invalidation, missing strategy tags. emotionFlags summarize user-selected tags and missing fields — never diagnose the user as greedy or fearful. Do not recommend real trades. If there are no fills, say so calmly and still suggest a nextChecklist. Prefer citing counts from processSummary over inventing P&L.",
    }),
    user: JSON.stringify({
      period: opts.period,
      since: process.since,
      processSummary: process.summary,
      fills: process.fills.map((f) => ({
        id: f.id,
        symbol: f.symbol,
        assetType: f.assetType,
        side: f.side,
        qty: f.qty,
        filledPrice: f.filledPrice,
        filledAt: f.filledAt,
        strategyName: f.strategyName,
        emotionTags: f.emotionTags,
        invalidationNote: f.invalidationNote,
        flags: f.flags,
      })),
      openPositions: process.positions,
      cash: process.summary.cash,
    }),
    temperature: 0.4,
  });

  const orderIds = process.fills.map((f) => f.id);
  let noteId: string | undefined;

  if (opts.save) {
    const note = await prisma.reviewNote.create({
      data: {
        userId: opts.userId,
        period: opts.period,
        content: object,
        sourceOrderIds: orderIds,
      },
    });
    noteId = note.id;
  }

  return {
    ...object,
    period: opts.period,
    orderIds,
    disclaimer: aiDisclaimer(locale),
    noteId,
  };
}
