import { z } from "zod";
import { generateAiObject } from "@/lib/ai/client";
import {
  aiDisclaimer,
  calmMarketSystemPrompt,
} from "@/lib/ai/guardrails";
import { prisma } from "@/lib/db";

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

function periodStart(period: "day" | "week", now = new Date()): Date {
  const d = new Date(now);
  if (period === "week") {
    d.setDate(d.getDate() - 7);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export async function buildTradeReview(opts: {
  userId: string;
  period: "day" | "week";
  locale?: string;
  save?: boolean;
}): Promise<ReviewResult> {
  const locale = opts.locale || "en";
  const since = periodStart(opts.period);

  const [orders, positions, account] = await Promise.all([
    prisma.paperOrder.findMany({
      where: {
        userId: opts.userId,
        status: "filled",
        filledAt: { gte: since },
      },
      orderBy: { filledAt: "asc" },
      take: 40,
    }),
    prisma.paperPosition.findMany({
      where: { userId: opts.userId },
      take: 30,
    }),
    prisma.paperAccount.findUnique({ where: { userId: opts.userId } }),
  ]);

  const orderPayload = orders.map((o) => ({
    id: o.id,
    symbol: o.symbol,
    assetType: o.assetType,
    side: o.side,
    type: o.type,
    qty: Number(o.qty),
    filledPrice: o.filledPrice != null ? Number(o.filledPrice) : null,
    filledAt: o.filledAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
  }));

  const object = await generateAiObject({
    userId: opts.userId,
    schema: reviewSchema,
    system: calmMarketSystemPrompt({
      locale,
      extra:
        "This is a paper-trading review. Focus on process: chase/FOMO, revenge trading, oversizing, ignoring invalidation. emotionFlags are first-class. Do not recommend real trades. If there are no fills, say so calmly and still suggest a nextChecklist.",
    }),
    user: JSON.stringify({
      period: opts.period,
      since: since.toISOString(),
      fills: orderPayload,
      openPositions: positions.map((p) => ({
        symbol: p.symbol,
        assetType: p.assetType,
        qty: Number(p.qty),
        avgCost: Number(p.avgCost),
      })),
      cash: account ? Number(account.cashBalance) : null,
    }),
    temperature: 0.4,
  });

  const orderIds = orders.map((o) => o.id);
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
