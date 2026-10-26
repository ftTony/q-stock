import { z } from "zod";
import { AiError, isAiConfigured } from "@/lib/ai/client";
import { aiDisclaimer } from "@/lib/ai/guardrails";
import { requireAiQuota } from "@/lib/ai/http";
import { buildReplayProcessReview } from "@/lib/ai/replay-review";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  locale: z.string().max(12).optional(),
});

export async function POST(req: Request, ctx: Ctx) {
  try {
    const access = await requireAiQuota(1);
    if (!access.ok) return access.response;
    const { userId } = access;

    if (!(await isAiConfigured(userId))) {
      return Response.json(
        { error: "AI is not configured", disclaimer: aiDisclaimer("en") },
        { status: 503 },
      );
    }

    const { id } = await ctx.params;
    const replay = await prisma.strategyReplay.findFirst({
      where: { id, userId },
      include: { strategy: { select: { name: true } } },
    });
    if (!replay) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (replay.status !== "done" || !replay.result) {
      return Response.json(
        { error: "Replay must be completed first" },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = replay.result as {
      totalReturnPct?: number;
      maxDrawdownPct?: number;
      buyHoldReturnPct?: number;
      winRate?: number | null;
      tradeCount?: number;
      assumptions?: Record<string, unknown>;
      trades?: Array<{
        side: string;
        price: number;
        qty: number;
        time: number;
      }>;
    };

    const review = await buildReplayProcessReview({
      userId,
      locale: parsed.data.locale,
      payload: {
        symbol: replay.symbol,
        assetType: replay.assetType,
        strategyName: replay.strategy.name,
        rangeFrom: replay.rangeFrom.toISOString(),
        rangeTo: replay.rangeTo.toISOString(),
        metrics: {
          totalReturnPct: result.totalReturnPct,
          maxDrawdownPct: result.maxDrawdownPct,
          buyHoldReturnPct: result.buyHoldReturnPct,
          winRate: result.winRate,
          tradeCount: result.tradeCount,
        },
        assumptions: result.assumptions ?? null,
        tradeSample: (result.trades ?? []).slice(0, 12),
      },
    });

    return Response.json(review);
  } catch (err) {
    console.error("strategies/ai-review", err);
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "review failed";
    return Response.json(
      { error: msg, disclaimer: aiDisclaimer("en") },
      { status: 502 },
    );
  }
}
