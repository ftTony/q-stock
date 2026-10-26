import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  runCompareSync,
  runLabReportJob,
} from "@/lib/strategy/run-lab-report";
import {
  assertReplayQuota,
  hasActiveReplayWork,
  parseRangeDates,
  REPLAY_DAILY_LIMIT,
} from "@/lib/strategy/replay-quota";
import { serializeLabReport } from "@/lib/strategy/serialize";

const bodySchema = z.object({
  strategyIdA: z.string().min(1),
  strategyIdB: z.string().min(1),
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
  if (parsed.data.strategyIdA === parsed.data.strategyIdB) {
    return NextResponse.json(
      { error: "Pick two different strategies" },
      { status: 400 },
    );
  }

  const range = parseRangeDates(parsed.data.rangeFrom, parsed.data.rangeTo);
  if ("error" in range) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  const cost = 2;
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

  const request = {
    strategyIdA: parsed.data.strategyIdA,
    strategyIdB: parsed.data.strategyIdB,
    symbol: parsed.data.symbol.toUpperCase(),
    assetType: parsed.data.assetType,
    rangeFrom: range.rangeFrom.toISOString(),
    rangeTo: range.rangeTo.toISOString(),
    slipBps: parsed.data.slipBps,
    initialCash: parsed.data.initialCash,
  };

  // Prefer sync compare (2 runs, shared bars) — falls back to worker if needed.
  try {
    const result = await runCompareSync({
      userId,
      strategyIdA: parsed.data.strategyIdA,
      strategyIdB: parsed.data.strategyIdB,
      symbol: parsed.data.symbol.toUpperCase(),
      assetType: parsed.data.assetType,
      rangeFrom: range.rangeFrom,
      rangeTo: range.rangeTo,
      slipBps: parsed.data.slipBps,
      initialCash: parsed.data.initialCash,
    });

    const report = await prisma.strategyLabReport.create({
      data: {
        userId,
        kind: "compare",
        cost,
        request,
        status: "done",
        result,
      },
    });

    return NextResponse.json(
      {
        report: serializeLabReport(report),
        quota: {
          used: quota.used + cost,
          limit: REPLAY_DAILY_LIMIT,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Compare failed";
    const report = await prisma.strategyLabReport.create({
      data: {
        userId,
        kind: "compare",
        cost,
        request,
        status: "pending",
        error: null,
      },
    });
    if (shouldRunInline()) {
      void runLabReportJob(report.id).catch((e) =>
        console.error("[strategy-lab] compare kickoff", e),
      );
    }
    return NextResponse.json(
      {
        report: serializeLabReport(report),
        warning: message,
        quota: {
          used: quota.used + cost,
          limit: REPLAY_DAILY_LIMIT,
        },
      },
      { status: 201 },
    );
  }
}
