import { z } from "zod";
import { AiError, isAiConfigured } from "@/lib/ai/client";
import { aiDisclaimer } from "@/lib/ai/guardrails";
import { requireAiQuota, requireAiUser } from "@/lib/ai/http";
import { buildTradeReview } from "@/lib/ai/review";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  period: z.enum(["day", "week"]).default("day"),
  locale: z.string().max(12).optional(),
  save: z.boolean().optional(),
});

export async function GET() {
  const gate = await requireAiUser();
  if (!gate.ok) return gate.response;

  const notes = await prisma.reviewNote.findMany({
    where: { userId: gate.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Response.json({
    notes: notes.map((n) => ({
      id: n.id,
      period: n.period,
      content: n.content,
      sourceOrderIds: n.sourceOrderIds,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
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

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await buildTradeReview({
      userId,
      period: parsed.data.period,
      locale: parsed.data.locale || "en",
      save: parsed.data.save !== false,
    });

    return Response.json(result);
  } catch (err) {
    console.error("ai/review", err);
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "review failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
