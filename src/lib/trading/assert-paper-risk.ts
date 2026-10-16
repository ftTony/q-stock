import type { AssetType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getQuote } from "@/lib/market";
import { checkOrderRisk } from "@/lib/trading/check-order-risk";
import { TradingError } from "@/lib/trading/execute";
import { ensurePaperRiskSettings } from "@/lib/trading/paper-risk-settings";

/** Server-side risk gate before creating a paper order. */
export async function assertPaperRisk(input: {
  userId: string;
  symbol: string;
  assetType: AssetType;
  side: "buy" | "sell";
  qty: number;
  type: "market" | "limit" | "stop";
  limitPrice?: number | null;
  stopPrice?: number | null;
  emotionTags?: string[];
}) {
  const settings = await ensurePaperRiskSettings(input.userId);
  const account = await prisma.paperAccount.findUniqueOrThrow({
    where: { userId: input.userId },
  });
  const positions = await prisma.paperPosition.findMany({
    where: { userId: input.userId },
    take: 80,
  });

  let gross = 0;
  let symbolNotional = 0;
  for (const p of positions) {
    const n = Number(p.qty) * Number(p.avgCost);
    gross += n;
    if (p.symbol === input.symbol && p.assetType === input.assetType) {
      symbolNotional = n;
    }
  }

  const cash = Number(account.cashBalance);
  const equity = cash + gross;

  let entry =
    input.type === "limit"
      ? Number(input.limitPrice)
      : input.type === "stop"
        ? Number(input.stopPrice)
        : 0;
  if (!(entry > 0) && input.side === "buy" && input.type === "market") {
    const q = await getQuote(input.symbol, input.assetType).catch(() => null);
    entry = q?.price && q.price > 0 ? q.price : 0;
  }
  const orderNotional =
    input.side === "buy" && entry > 0 ? input.qty * entry : 0;

  let dayPnlPct: number | null = null;
  const dayStart =
    account.dayStartEquity != null ? Number(account.dayStartEquity) : null;
  if (dayStart != null && dayStart > 0) {
    dayPnlPct = ((equity - dayStart) / dayStart) * 100;
  }

  const result = checkOrderRisk({
    settings,
    equity,
    grossNotional: gross,
    symbolNotional,
    orderNotional,
    dayPnlPct,
    side: input.side,
    emotionTagCount: input.emotionTags?.length ?? 0,
  });

  if (!result.ok) {
    throw new TradingError(result.message, result.code);
  }
}
