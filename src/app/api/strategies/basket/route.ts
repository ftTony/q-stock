import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runLabReportJob } from "@/lib/strategy/run-lab-report";
import {
  assertReplayQuota,
  hasActiveReplayWork,
  parseRangeDates,
  REPLAY_DAILY_LIMIT,
} from "@/lib/strategy/replay-quota";
import { serializeLabReport } from "@/lib/strategy/serialize";

const bodySchema = z.object({
  strategyId: z.string().min(1),
  symbols: z.array(z.string().min(1).max(20)).min(2).max(10),
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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const symbols = [
    ...new Set(
      parsed.data.symbols.map((s) => s.toUpperCase().trim()).filter(Boolean),
    ),
  ].slice(0, 10);
  if (symbols.length < 2) {
    return NextResponse.json(
      { error: "Need 2–10 distinct symbols" },
      { status: 400 },
    );
  }

  const range = parseRangeDates(parsed.data.rangeFrom, parsed.data.rangeTo);
  if ("error" in range) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  const strategy = await prisma.strategy.findFirst({
    where: {
      id: parsed.data.strategyId,
      OR: [
        { isTemplate: true },
        { userId, isTemplate: false },
      ],
    },
  });
  if (!strategy) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  const cost = symbols.length;
  const quota = await assertReplayQuota(userId, cost);
  if ("error" in quota) {
    return NextResponse.json(
      {
        code: "daily_limit",
        error: "Daily replay limit reached",
        used: quota.used,
        limit: quota.limit,
      },
      { status: 429 },
    );
  }

  if (await hasActiveReplayWork(userId)) {
    return NextResponse.json(
      { code: "queued", error: "A replay or lab job is already queued" },
      { status: 429 },
    );
  }

  const report = await prisma.strategyLabReport.create({
    data: {
      userId,
      kind: "basket",
      cost,
      request: {
        strategyId: parsed.data.strategyId,
        symbols,
        assetType: parsed.data.assetType,
        rangeFrom: range.rangeFrom.toISOString(),
        rangeTo: range.rangeTo.toISOString(),
        slipBps: parsed.data.slipBps,
        initialCash: parsed.data.initialCash,
      },
      status: "pending",
    },
  });

  if (shouldRunInline()) {
    void runLabReportJob(report.id).catch((err) => {
      console.error("[strategy-lab] basket kickoff", err);
    });
  }

  return NextResponse.json(
    {
      report: serializeLabReport(report),
      quota: { used: quota.used + cost, limit: REPLAY_DAILY_LIMIT },
    },
    { status: 201 },
  );
}
