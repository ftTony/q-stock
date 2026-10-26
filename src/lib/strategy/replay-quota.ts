import { prisma } from "@/lib/db";

export const REPLAY_DAILY_LIMIT = 20;
export const MAX_RANGE_DAYS = 365 * 5;

export async function countReplayQuotaUsed(userId: string): Promise<number> {
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const [replays, labCost] = await Promise.all([
    prisma.strategyReplay.count({
      where: { userId, createdAt: { gte: dayStart } },
    }),
    prisma.strategyLabReport.aggregate({
      where: { userId, createdAt: { gte: dayStart } },
      _sum: { cost: true },
    }),
  ]);
  return replays + (labCost._sum.cost ?? 0);
}

export async function assertReplayQuota(
  userId: string,
  extraCost: number,
): Promise<{ used: number; limit: number } | { error: "daily_limit"; used: number; limit: number }> {
  const used = await countReplayQuotaUsed(userId);
  if (used + extraCost > REPLAY_DAILY_LIMIT) {
    return { error: "daily_limit", used, limit: REPLAY_DAILY_LIMIT };
  }
  return { used, limit: REPLAY_DAILY_LIMIT };
}

export async function hasActiveReplayWork(userId: string): Promise<boolean> {
  const [replay, lab] = await Promise.all([
    prisma.strategyReplay.count({
      where: { userId, status: { in: ["pending", "running"] } },
    }),
    prisma.strategyLabReport.count({
      where: { userId, status: { in: ["pending", "running"] } },
    }),
  ]);
  return replay + lab >= 1;
}

export function parseRangeDates(from: string, to: string): {
  rangeFrom: Date;
  rangeTo: Date;
} | { error: string } {
  const rangeFrom = new Date(from);
  const rangeTo = new Date(to);
  if (
    Number.isNaN(rangeFrom.getTime()) ||
    Number.isNaN(rangeTo.getTime()) ||
    rangeFrom >= rangeTo
  ) {
    return { error: "Invalid date range" };
  }
  const spanMs = rangeTo.getTime() - rangeFrom.getTime();
  if (spanMs > MAX_RANGE_DAYS * 86400_000) {
    return { error: "Range too long (max 5 years)" };
  }
  return { rangeFrom, rangeTo };
}
