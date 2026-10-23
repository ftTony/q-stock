import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeReplay } from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ id: string }> };

const DAILY_LIMIT = 20;
const MAX_RANGE_DAYS = 365 * 5;

const bodySchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  rangeFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  rangeTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  slipBps: z.number().min(0).max(50).optional(),
  initialCash: z.number().min(1000).max(1_000_000).optional(),
});

function shouldRunInline(): boolean {
  if (process.env.STRATEGY_REPLAY_INLINE === "0") return false;
  if (process.env.STRATEGY_REPLAY_INLINE === "1") return true;
  return process.env.NODE_ENV === "development";
}

export async function GET(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: strategyId } = await ctx.params;
  const url = new URL(req.url);
  const replayId = url.searchParams.get("replayId");

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const todayCount = await prisma.strategyReplay.count({
    where: { userId: session.user.id, createdAt: { gte: dayStart } },
  });
  const quota = { used: todayCount, limit: DAILY_LIMIT };

  if (replayId) {
    const replay = await prisma.strategyReplay.findFirst({
      where: { id: replayId, userId: session.user.id, strategyId },
    });
    if (!replay) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ replay: serializeReplay(replay), quota });
  }

  const replays = await prisma.strategyReplay.findMany({
    where: { userId: session.user.id, strategyId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({
    replays: replays.map(serializeReplay),
    quota,
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: strategyId } = await ctx.params;
  const strategy = await prisma.strategy.findFirst({
    where: {
      id: strategyId,
      OR: [
        { isTemplate: true },
        { userId: session.user.id, isTemplate: false },
      ],
    },
  });
  if (!strategy) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const rangeFrom = new Date(parsed.data.rangeFrom);
  const rangeTo = new Date(parsed.data.rangeTo);
  if (
    Number.isNaN(rangeFrom.getTime()) ||
    Number.isNaN(rangeTo.getTime()) ||
    rangeFrom >= rangeTo
  ) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  const spanMs = rangeTo.getTime() - rangeFrom.getTime();
  if (spanMs > MAX_RANGE_DAYS * 86400_000) {
    return NextResponse.json(
      { error: "Range too long (max 5 years)" },
      { status: 400 },
    );
  }

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const todayCount = await prisma.strategyReplay.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: dayStart },
    },
  });
  if (todayCount >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        code: "daily_limit",
        error: "Daily replay limit reached",
        used: todayCount,
        limit: DAILY_LIMIT,
      },
      { status: 429 },
    );
  }

  const running = await prisma.strategyReplay.count({
    where: {
      userId: session.user.id,
      status: { in: ["pending", "running"] },
    },
  });
  if (running >= 1) {
    return NextResponse.json(
      { code: "queued", error: "A replay is already queued" },
      { status: 429 },
    );
  }

  const replay = await prisma.strategyReplay.create({
    data: {
      userId: session.user.id,
      strategyId,
      symbol: parsed.data.symbol.toUpperCase(),
      assetType: parsed.data.assetType,
      rangeFrom,
      rangeTo,
      assumptions: {
        fill: "signal_close",
        slipBps: parsed.data.slipBps ?? 5,
        initialCash: parsed.data.initialCash ?? 100_000,
      },
      status: "pending",
    },
  });

  // Prefer Worker drain; in development, run inline so local UX is not stuck pending.
  if (shouldRunInline()) {
    const { runStrategyReplayJob } = await import(
      "@/lib/strategy/run-replay-job"
    );
    void runStrategyReplayJob(replay.id).catch((err) => {
      console.error("[strategy-replay] inline kickoff failed", err);
    });
  }

  return NextResponse.json(
    {
      replay: serializeReplay(replay),
      quota: { used: todayCount + 1, limit: DAILY_LIMIT },
    },
    { status: 201 },
  );
}
