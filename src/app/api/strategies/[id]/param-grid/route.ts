import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  listTunableParams,
  parseParamValues,
} from "@/lib/strategy/mutate-param";
import { parseStrategyRules } from "@/lib/strategy/rules";
import {
  runLabReportJob,
  runParamGridSync,
} from "@/lib/strategy/run-lab-report";
import {
  assertReplayQuota,
  hasActiveReplayWork,
  parseRangeDates,
  REPLAY_DAILY_LIMIT,
} from "@/lib/strategy/replay-quota";
import { serializeLabReport } from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  paramId: z.string().min(1).max(40),
  values: z.array(z.number()).min(2).max(5),
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  rangeFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  rangeTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  slipBps: z.number().min(0).max(50).optional(),
  initialCash: z.number().min(1000).max(1_000_000).optional(),
});

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const strategy = await prisma.strategy.findFirst({
    where: {
      id,
      OR: [
        { isTemplate: true },
        { userId: session.user.id, isTemplate: false },
      ],
    },
  });
  if (!strategy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const rules = parseStrategyRules(strategy.rules);
    return NextResponse.json({ params: listTunableParams(rules) });
  } catch {
    return NextResponse.json({ params: [] });
  }
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: strategyId } = await ctx.params;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let values: number[];
  try {
    values = parseParamValues(parsed.data.values, 5);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid values" },
      { status: 400 },
    );
  }

  const range = parseRangeDates(parsed.data.rangeFrom, parsed.data.rangeTo);
  if ("error" in range) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  const cost = values.length;
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
    strategyId,
    paramId: parsed.data.paramId,
    values,
    symbol: parsed.data.symbol.toUpperCase(),
    assetType: parsed.data.assetType,
    rangeFrom: range.rangeFrom.toISOString(),
    rangeTo: range.rangeTo.toISOString(),
    slipBps: parsed.data.slipBps,
    initialCash: parsed.data.initialCash,
  };

  try {
    const result = await runParamGridSync({
      userId,
      strategyId,
      paramId: parsed.data.paramId,
      values,
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
        kind: "param_grid",
        cost,
        request,
        status: "done",
        result,
      },
    });

    return NextResponse.json(
      {
        report: serializeLabReport(report),
        quota: { used: quota.used + cost, limit: REPLAY_DAILY_LIMIT },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Param grid failed";
    const report = await prisma.strategyLabReport.create({
      data: {
        userId,
        kind: "param_grid",
        cost,
        request,
        status: "pending",
      },
    });
    void runLabReportJob(report.id).catch((e) =>
      console.error("[strategy-lab] param-grid kickoff", e),
    );
    return NextResponse.json(
      {
        report: serializeLabReport(report),
        warning: message,
        quota: { used: quota.used + cost, limit: REPLAY_DAILY_LIMIT },
      },
      { status: 201 },
    );
  }
}
