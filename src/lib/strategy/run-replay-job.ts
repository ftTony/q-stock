import { prisma } from "@/lib/db";
import { claimByIds } from "@/lib/jobs/claim";
import { getDailyCandles } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { runReplay, type ReplayBar } from "@/lib/strategy/replay-engine";
import type { AssetType } from "@/lib/types";

const MAX_BARS = 800;
/** Re-queue jobs stuck in `running` (crash / OOM mid-job). */
const STALE_RUNNING_MS = 10 * 60 * 1000;

/**
 * Atomically claim a pending replay (pending → running).
 * Returns false if another worker already claimed it.
 */
export async function claimStrategyReplay(replayId: string): Promise<boolean> {
  const updated = await prisma.strategyReplay.updateMany({
    where: { id: replayId, status: "pending" },
    data: { status: "running", error: null },
  });
  return updated.count === 1;
}

async function requeueStaleRunning() {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MS);
  const result = await prisma.strategyReplay.updateMany({
    where: {
      status: "running",
      updatedAt: { lt: cutoff },
    },
    data: {
      status: "pending",
      error: "Requeued after stale running lock",
    },
  });
  if (result.count > 0) {
    console.warn(`[strategy-replay] requeued ${result.count} stale job(s)`);
  }
}

/**
 * Run a replay that is already claimed (`running`) or still `pending`
 * (will claim first). Caps candle count for 1GB host safety.
 */
export async function runStrategyReplayJob(replayId: string) {
  const job = await prisma.strategyReplay.findUnique({
    where: { id: replayId },
    include: { strategy: true },
  });
  if (!job) return null;

  if (job.status === "pending") {
    const claimed = await claimStrategyReplay(replayId);
    if (!claimed) return null;
  } else if (job.status !== "running") {
    return null;
  }

  try {
    const assumptions = (job.assumptions ?? {}) as {
      slipBps?: number;
      initialCash?: number;
      fill?: string;
    };
    const slipBps = Math.min(50, Math.max(0, Number(assumptions.slipBps) || 5));
    const initialCash = Math.min(
      1_000_000,
      Math.max(1000, Number(assumptions.initialCash) || 100_000),
    );

    const fromSec = Math.floor(job.rangeFrom.getTime() / 1000);
    const toSec = Math.floor(job.rangeTo.getTime() / 1000);
    const candles = await withUserMarket(job.userId, () =>
      getDailyCandles(
        job.symbol,
        job.assetType as AssetType,
        fromSec,
        toSec,
      ),
    );
    const sliced = candles.slice(-MAX_BARS);
    if (sliced.length < 30) {
      throw new Error("Not enough daily bars for replay (need ≥30)");
    }

    const bars: ReplayBar[] = sliced.map((c) => ({
      t: c.time * (c.time < 1e12 ? 1000 : 1),
      o: c.open,
      h: c.high,
      l: c.low,
      c: c.close,
      v: c.volume,
    }));

    const result = runReplay(bars, job.strategy.rules, {
      fill: "signal_close",
      slipBps,
      initialCash,
    });

    return prisma.strategyReplay.update({
      where: { id: replayId },
      data: {
        status: "done",
        result: {
          ...result,
          assumptions: {
            fill: "signal_close",
            slipBps,
            initialCash,
            barCount: bars.length,
            longOnly: true,
            disclaimer:
              "Educational rule replay on historical daily closes. Not future performance.",
          },
        },
        error: null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Replay failed";
    return prisma.strategyReplay.update({
      where: { id: replayId },
      data: { status: "failed", error: message.slice(0, 500) },
    });
  }
}

/**
 * Drain a small batch of pending replays (Worker tick).
 * Uses atomic claim so web kickoff and worker cannot double-run the same id.
 */
export async function tickStrategyReplays(limit = 2) {
  await requeueStaleRunning();

  const pending = await prisma.strategyReplay.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(10, limit)),
    select: { id: true },
  });

  const claimed = await claimByIds(pending, claimStrategyReplay);
  for (const id of claimed) {
    await runStrategyReplayJob(id);
  }
  return claimed.length;
}
