import { prisma } from "@/lib/db";
import {
  deviationFlags,
  type DeviationFlag,
} from "@/lib/review/deviation";

export type ReviewPeriod = "day" | "week";

export type ProcessFill = {
  id: string;
  symbol: string;
  assetType: string;
  side: "buy" | "sell";
  qty: number;
  filledPrice: number | null;
  filledAt: string | null;
  createdAt: string;
  strategyId: string | null;
  strategyName: string | null;
  emotionTags: string[];
  invalidationNote: string | null;
  flags: DeviationFlag[];
};

export type ProcessSummary = {
  fillCount: number;
  taggedCount: number;
  untaggedCount: number;
  taggedPct: number | null;
  emotionTaggedCount: number;
  openPositionCount: number;
  cash: number | null;
};

export type ProcessPayload = {
  period: ReviewPeriod;
  since: string;
  summary: ProcessSummary;
  fills: ProcessFill[];
  positions: Array<{
    symbol: string;
    assetType: string;
    qty: number;
    avgCost: number;
  }>;
};

const FILL_TAKE = 40;
const POSITION_TAKE = 30;

export function periodStart(period: ReviewPeriod, now = new Date()): Date {
  const d = new Date(now);
  if (period === "week") {
    d.setDate(d.getDate() - 7);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export async function buildProcessSummary(opts: {
  userId: string;
  period: ReviewPeriod;
}): Promise<ProcessPayload> {
  const since = periodStart(opts.period);

  const [orders, positions, account] = await Promise.all([
    prisma.paperOrder.findMany({
      where: {
        userId: opts.userId,
        status: "filled",
        filledAt: { gte: since },
      },
      orderBy: { filledAt: "desc" },
      take: FILL_TAKE,
      include: { strategy: { select: { id: true, name: true } } },
    }),
    prisma.paperPosition.findMany({
      where: { userId: opts.userId },
      take: POSITION_TAKE,
    }),
    prisma.paperAccount.findUnique({ where: { userId: opts.userId } }),
  ]);

  const fills: ProcessFill[] = orders.map((o) => {
    const emotionTags = o.emotionTags ?? [];
    const strategyId = o.strategyId ?? null;
    const invalidationNote = o.invalidationNote ?? null;
    return {
      id: o.id,
      symbol: o.symbol,
      assetType: o.assetType,
      side: o.side,
      qty: Number(o.qty),
      filledPrice: o.filledPrice != null ? Number(o.filledPrice) : null,
      filledAt: o.filledAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      strategyId,
      strategyName: o.strategy?.name ?? null,
      emotionTags,
      invalidationNote,
      flags: deviationFlags({ strategyId, invalidationNote, emotionTags }),
    };
  });

  const taggedCount = fills.filter((f) => f.strategyId).length;
  const fillCount = fills.length;
  const emotionTaggedCount = fills.filter((f) => f.emotionTags.length > 0)
    .length;

  return {
    period: opts.period,
    since: since.toISOString(),
    summary: {
      fillCount,
      taggedCount,
      untaggedCount: fillCount - taggedCount,
      taggedPct:
        fillCount > 0 ? Math.round((taggedCount / fillCount) * 100) : null,
      emotionTaggedCount,
      openPositionCount: positions.length,
      cash: account ? Number(account.cashBalance) : null,
    },
    fills,
    positions: positions.map((p) => ({
      symbol: p.symbol,
      assetType: p.assetType,
      qty: Number(p.qty),
      avgCost: Number(p.avgCost),
    })),
  };
}
