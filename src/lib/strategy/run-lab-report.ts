import { prisma } from "@/lib/db";
import { claimByIds } from "@/lib/jobs/claim";
import {
  loadReplayBars,
} from "@/lib/strategy/load-replay-bars";
import { pickMetrics, slimEquity } from "@/lib/strategy/lab-metrics";
import { applyParamValue } from "@/lib/strategy/mutate-param";
import { parseStrategyRules } from "@/lib/strategy/rules";
import { runReplay } from "@/lib/strategy/replay-engine";
import type { AssetType } from "@/lib/types";

const STALE_RUNNING_MS = 15 * 60 * 1000;

type CommonReq = {
  symbol?: string;
  symbols?: string[];
  assetType: AssetType;
  rangeFrom: string;
  rangeTo: string;
  slipBps?: number;
  initialCash?: number;
  strategyId?: string;
  strategyIdA?: string;
  strategyIdB?: string;
  paramId?: string;
  values?: number[];
};

function assumptionsOf(req: CommonReq) {
  return {
    fill: "signal_close" as const,
    slipBps: Math.min(50, Math.max(0, Number(req.slipBps) || 5)),
    initialCash: Math.min(
      1_000_000,
      Math.max(1000, Number(req.initialCash) || 100_000),
    ),
  };
}

export async function claimLabReport(id: string): Promise<boolean> {
  const updated = await prisma.strategyLabReport.updateMany({
    where: { id, status: "pending" },
    data: { status: "running", error: null },
  });
  return updated.count === 1;
}

async function requeueStale() {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MS);
  await prisma.strategyLabReport.updateMany({
    where: { status: "running", updatedAt: { lt: cutoff } },
    data: { status: "pending", error: "Requeued after stale running lock" },
  });
}

async function loadStrategyForUser(
  strategyId: string,
  userId: string,
) {
  return prisma.strategy.findFirst({
    where: {
      id: strategyId,
      OR: [{ isTemplate: true }, { userId, isTemplate: false }],
    },
  });
}

export async function runCompareSync(opts: {
  userId: string;
  strategyIdA: string;
  strategyIdB: string;
  symbol: string;
  assetType: AssetType;
  rangeFrom: Date;
  rangeTo: Date;
  slipBps?: number;
  initialCash?: number;
}) {
  const [a, b] = await Promise.all([
    loadStrategyForUser(opts.strategyIdA, opts.userId),
    loadStrategyForUser(opts.strategyIdB, opts.userId),
  ]);
  if (!a || !b) throw new Error("Strategy not found");

  const bars = await loadReplayBars({
    userId: opts.userId,
    symbol: opts.symbol,
    assetType: opts.assetType,
    rangeFrom: opts.rangeFrom,
    rangeTo: opts.rangeTo,
  });
  const assumptions = assumptionsOf({
    assetType: opts.assetType,
    rangeFrom: opts.rangeFrom.toISOString(),
    rangeTo: opts.rangeTo.toISOString(),
    slipBps: opts.slipBps,
    initialCash: opts.initialCash,
  });

  const runA = runReplay(bars, a.rules, assumptions);
  const runB = runReplay(bars, b.rules, assumptions);

  return {
    symbol: opts.symbol.toUpperCase(),
    assetType: opts.assetType,
    barCount: bars.length,
    assumptions: {
      ...assumptions,
      barCount: bars.length,
      disclaimer:
        "Educational dual-rule compare on daily closes. Not future performance.",
    },
    legs: [
      {
        strategyId: a.id,
        name: a.name,
        metrics: pickMetrics(runA),
        equityCurve: slimEquity(runA),
      },
      {
        strategyId: b.id,
        name: b.name,
        metrics: pickMetrics(runB),
        equityCurve: slimEquity(runB),
      },
    ],
  };
}

export async function runParamGridSync(opts: {
  userId: string;
  strategyId: string;
  paramId: string;
  values: number[];
  symbol: string;
  assetType: AssetType;
  rangeFrom: Date;
  rangeTo: Date;
  slipBps?: number;
  initialCash?: number;
}) {
  const strategy = await loadStrategyForUser(opts.strategyId, opts.userId);
  if (!strategy) throw new Error("Strategy not found");

  const bars = await loadReplayBars({
    userId: opts.userId,
    symbol: opts.symbol,
    assetType: opts.assetType,
    rangeFrom: opts.rangeFrom,
    rangeTo: opts.rangeTo,
  });
  const assumptions = assumptionsOf({
    assetType: opts.assetType,
    rangeFrom: opts.rangeFrom.toISOString(),
    rangeTo: opts.rangeTo.toISOString(),
    slipBps: opts.slipBps,
    initialCash: opts.initialCash,
  });

  const baseRules = parseStrategyRules(strategy.rules);
  const rows = [];
  for (const value of opts.values) {
    const rules = applyParamValue(baseRules, opts.paramId, value);
    const run = runReplay(bars, rules, assumptions);
    rows.push({
      value,
      metrics: pickMetrics(run),
    });
  }

  return {
    symbol: opts.symbol.toUpperCase(),
    assetType: opts.assetType,
    strategyId: strategy.id,
    strategyName: strategy.name,
    paramId: opts.paramId,
    barCount: bars.length,
    assumptions: {
      ...assumptions,
      barCount: bars.length,
      disclaimer:
        "Tiny param grid on one knob — easy to overfit. Educational only.",
    },
    rows,
  };
}

/** Sequential basket: one symbol at a time (Worker). */
export async function runLabReportJob(reportId: string) {
  const job = await prisma.strategyLabReport.findUnique({
    where: { id: reportId },
  });
  if (!job) return null;

  if (job.status === "pending") {
    const claimed = await claimLabReport(reportId);
    if (!claimed) return null;
  } else if (job.status !== "running") {
    return null;
  }

  const req = job.request as CommonReq;

  try {
    if (job.kind === "basket") {
      const strategyId = req.strategyId;
      if (!strategyId) throw new Error("Missing strategyId");
      const strategy = await loadStrategyForUser(strategyId, job.userId);
      if (!strategy) throw new Error("Strategy not found");

      const symbols = (req.symbols ?? [])
        .map((s) => String(s).toUpperCase().trim())
        .filter(Boolean)
        .slice(0, 10);
      if (symbols.length < 2) throw new Error("Need 2–10 symbols");

      const rangeFrom = new Date(req.rangeFrom);
      const rangeTo = new Date(req.rangeTo);
      const assumptions = assumptionsOf(req);
      const rows = [];

      for (const symbol of symbols) {
        try {
          const bars = await loadReplayBars({
            userId: job.userId,
            symbol,
            assetType: req.assetType,
            rangeFrom,
            rangeTo,
          });
          const run = runReplay(bars, strategy.rules, assumptions);
          rows.push({
            symbol,
            ok: true as const,
            metrics: pickMetrics(run),
            barCount: bars.length,
          });
        } catch (err) {
          rows.push({
            symbol,
            ok: false as const,
            error: err instanceof Error ? err.message : "failed",
          });
        }
      }

      return prisma.strategyLabReport.update({
        where: { id: reportId },
        data: {
          status: "done",
          error: null,
          result: {
            strategyId: strategy.id,
            strategyName: strategy.name,
            assetType: req.assetType,
            assumptions: {
              ...assumptions,
              disclaimer:
                "Basket replay ran sequentially on daily bars. Not a portfolio optimizer.",
            },
            rows,
          },
        },
      });
    }

    // compare / param_grid should usually finish inline; re-run if stuck pending
    if (job.kind === "compare") {
      const result = await runCompareSync({
        userId: job.userId,
        strategyIdA: String(req.strategyIdA),
        strategyIdB: String(req.strategyIdB),
        symbol: String(req.symbol),
        assetType: req.assetType,
        rangeFrom: new Date(req.rangeFrom),
        rangeTo: new Date(req.rangeTo),
        slipBps: req.slipBps,
        initialCash: req.initialCash,
      });
      return prisma.strategyLabReport.update({
        where: { id: reportId },
        data: { status: "done", result, error: null },
      });
    }

    if (job.kind === "param_grid") {
      const result = await runParamGridSync({
        userId: job.userId,
        strategyId: String(req.strategyId),
        paramId: String(req.paramId),
        values: (req.values ?? []).map(Number),
        symbol: String(req.symbol),
        assetType: req.assetType,
        rangeFrom: new Date(req.rangeFrom),
        rangeTo: new Date(req.rangeTo),
        slipBps: req.slipBps,
        initialCash: req.initialCash,
      });
      return prisma.strategyLabReport.update({
        where: { id: reportId },
        data: { status: "done", result, error: null },
      });
    }

    throw new Error(`Unknown lab kind: ${job.kind}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lab report failed";
    return prisma.strategyLabReport.update({
      where: { id: reportId },
      data: { status: "failed", error: message.slice(0, 500) },
    });
  }
}

export async function tickStrategyLabReports(limit = 1) {
  await requeueStale();
  const pending = await prisma.strategyLabReport.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(5, limit)),
    select: { id: true },
  });
  const claimed = await claimByIds(pending, claimLabReport);
  for (const id of claimed) {
    await runLabReportJob(id);
  }
  return claimed.length;
}
