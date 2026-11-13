"use client";

import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import { TradeAiLinks } from "@/components/trading/trade-ai-links";
import { TradeCalmFields } from "@/components/trading/trade-calm-fields";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
import { TradeOrderFields } from "@/components/trading/trade-order-fields";
import { TradeTicketHeader } from "@/components/trading/trade-ticket-header";
import type { AssetType } from "@/lib/types";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

type StrategyOpt = { id: string; name: string };

type Order = {
  id: string;
  side: Side;
  type: OrderType;
  qty: number;
  limitPrice: number | null;
  stopPrice: number | null;
  status: string;
  createdAt: string;
};

type Props = {
  symbol: string;
  assetType: AssetType;
  quoteName: string | null;
  lastPrice: number | null;
  percentChange: number | null;
  loading: boolean;
  loadingLabel: string;
  resultBanner: ReactNode;
  positionLine: ReactNode;
  draftBanner: ReactNode;
  side: Side;
  onSide: (s: Side) => void;
  orderType: OrderType;
  onOrderType: (t: OrderType) => void;
  qty: string;
  onQty: (v: string) => void;
  limitPrice: string;
  onLimitPrice: (v: string) => void;
  stopPrice: string;
  onStopPrice: (v: string) => void;
  bid: number | null;
  ask: number | null;
  invalidationPrice: string;
  onInvalidationPrice: (v: string) => void;
  strategies: StrategyOpt[];
  strategyId: string;
  strategyName: string | null;
  planStrategyId?: string;
  onStrategyId: (id: string) => void;
  onOpenPlan?: () => void;
  onOpenCalm?: () => void;
  onOpenAi?: () => void;
  equity: number | null;
  qtyNum: number;
  estimatePrice: number;
  stopForRisk: number | null;
  estimateLabel: string;
  estimateCaption: string;
  submitLabel: string;
  submitClass: string;
  busy: boolean;
  emotionTags: EmotionTagId[];
  onEmotionTags: (tags: EmotionTagId[]) => void;
  orders: Order[];
  onCancelOrder: (id: string) => void;
};

/** Dock / default-density trade form body (keeps trade-panel under 500 lines). */
export function TradePanelDefaultLayout({
  symbol,
  assetType,
  quoteName,
  lastPrice,
  percentChange,
  loading,
  loadingLabel,
  resultBanner,
  positionLine,
  draftBanner,
  side,
  onSide,
  orderType,
  onOrderType,
  qty,
  onQty,
  limitPrice,
  onLimitPrice,
  stopPrice,
  onStopPrice,
  bid,
  ask,
  invalidationPrice,
  onInvalidationPrice,
  strategies,
  strategyId,
  strategyName,
  planStrategyId = "",
  onStrategyId,
  onOpenPlan,
  onOpenCalm,
  onOpenAi,
  equity,
  qtyNum,
  estimatePrice,
  stopForRisk,
  estimateLabel,
  estimateCaption,
  submitLabel,
  submitClass,
  busy,
  emotionTags,
  onEmotionTags,
  orders,
  onCancelOrder,
}: Props) {
  return (
    <>
      <TradeTicketHeader
        symbol={symbol}
        assetType={assetType}
        name={quoteName}
        lastPrice={lastPrice}
        percentChange={percentChange}
      />
      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2.5">
        <div className="space-y-2.5">
          {loading ? <p className="aw-caption">{loadingLabel}</p> : null}
          {resultBanner}
          {positionLine}
          <TradeOrderFields
            side={side}
            onSide={onSide}
            orderType={orderType}
            onOrderType={onOrderType}
            qty={qty}
            onQty={onQty}
            limitPrice={limitPrice}
            onLimitPrice={onLimitPrice}
            stopPrice={stopPrice}
            onStopPrice={onStopPrice}
            bid={bid}
            ask={ask}
            lastPrice={lastPrice}
          />
          {draftBanner}
          <TradeCalmFields
            invalidationPrice={invalidationPrice}
            onInvalidationPrice={onInvalidationPrice}
            strategies={strategies}
            strategyId={strategyId}
            strategyName={strategyName}
            planStrategyId={planStrategyId}
            onStrategyId={onStrategyId}
            onOpenPlan={onOpenPlan}
            equity={equity}
            qty={qtyNum}
            entry={estimatePrice}
            stop={stopForRisk}
            symbol={symbol}
            assetType={assetType}
            emotionTags={emotionTags}
            onEmotionTags={onEmotionTags}
          />
          <TradeAiLinks onOpenCalm={onOpenCalm} onOpenAi={onOpenAi} />
          <TradeOpenOrders
            orders={orders}
            busy={busy}
            onCancel={onCancelOrder}
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--panel))] px-4 pb-2.5 pt-2">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="aw-metric-label">{estimateCaption}</span>
          <span className="aw-metric-value">{estimateLabel}</span>
        </div>
        <SubmitButton
          type="submit"
          loading={busy}
          loadingLabel={loadingLabel}
          disabled={!(qtyNum > 0)}
          className={submitClass}
        >
          {submitLabel}
        </SubmitButton>
      </div>
    </>
  );
}
