import { z } from "zod";
import { auth } from "@/lib/auth";
import { AiError, isAiConfigured } from "@/lib/ai/client";
import { aiDisclaimer } from "@/lib/ai/guardrails";
import { buildTradeReview } from "@/lib/ai/review";
import { consumeAiQuota } from "@/lib/ai/usage";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  period: z.enum(["day", "week"]).default("day"),
  locale: z.string().max(12).optional(),
  save: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.reviewNote.findMany({
    where: { userId: session.user.id },
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
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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

    const quota = await consumeAiQuota(userId, 1);
    if (!quota.ok) {
      return Response.json(
        { error: "AI daily quota exceeded", used: quota.used, limit: quota.limit },
        { status: 429 },
      );
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
