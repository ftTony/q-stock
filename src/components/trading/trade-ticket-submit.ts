import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import { summarizeOrderRisk } from "@/lib/trading/risk-math";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

/** Solid up/down CTA — same language for dock + stack (no washed pink chip). */
export function tradeSubmitClass(
  side: Side,
  _stack: boolean,
): string {
  const h = "h-10 min-h-10";
  const text = "!text-[13px]";
  return side === "buy"
    ? `${h} w-full !rounded-none !border-0 !bg-[var(--up)] ${text} !font-semibold !text-white hover:!opacity-90`
    : `${h} w-full !rounded-none !border-0 !bg-[var(--down)] ${text} !font-semibold !text-white hover:!opacity-90`;
}

export function buildPlaceOrderBody(opts: {
  accountType: "cash" | "margin";
  symbol: string;
  assetType: string;
  side: Side;
  orderType: OrderType;
  qtyNum: number;
  estimatePrice: number;
  equity: number;
  emotionTags: EmotionTagId[];
  orderStrategyId: string;
  limitPrice: string;
  stopPrice: string;
  stopLoss: string;
  takeProfit: string;
  invalidationPrice: string;
  tradePin?: string;
}): Record<string, unknown> {
  const stopForRisk =
    opts.orderType === "stop"
      ? Number(opts.stopPrice)
      : Number(opts.stopLoss) || Number(opts.invalidationPrice) || null;
  const risk = summarizeOrderRisk({
    equity: opts.equity,
    qty: opts.qtyNum,
    entry: opts.estimatePrice,
    stop: stopForRisk,
  });
  const notes = [
    opts.invalidationPrice ? `invalidation=${opts.invalidationPrice}` : null,
    opts.stopLoss ? `stopLoss=${opts.stopLoss}` : null,
    opts.takeProfit ? `takeProfit=${opts.takeProfit}` : null,
  ].filter(Boolean);
  const body: Record<string, unknown> = {
    accountType: opts.accountType,
    symbol: opts.symbol,
    assetType: opts.assetType,
    side: opts.side,
    type: opts.orderType,
    qty: opts.qtyNum,
    emotionTags: opts.emotionTags,
    invalidationNote: notes.length ? notes.join(";") : null,
    strategyId: opts.orderStrategyId || null,
    riskSnapshot: {
      equity: opts.equity || null,
      notional: risk.notional,
      riskAmount: risk.riskAmount,
      riskPct: risk.riskPct,
      positionPct: risk.positionPct,
    },
  };
  if (opts.orderType === "limit") body.limitPrice = Number(opts.limitPrice);
  if (opts.orderType === "stop") body.stopPrice = Number(opts.stopPrice);
  if (opts.tradePin) body.tradePin = opts.tradePin;
  return body;
}
