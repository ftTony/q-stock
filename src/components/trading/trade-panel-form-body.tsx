"use client";

import type { ReactNode } from "react";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import { TradePanelDefaultLayout } from "@/components/trading/trade-panel-default";
import { TradePanelStackLayout } from "@/components/trading/trade-panel-stack";
import type { QtyMode } from "@/components/trading/trade-ticket-qty";
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
  stack: boolean;
  symbol: string;
  assetType: AssetType;
  quoteName: string | null;
  lastPrice: number | null;
  percentChange: number | null;
  bid: number | null;
  ask: number | null;
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
  invalidationPrice: string;
  onInvalidationPrice: (v: string) => void;
  strategies: StrategyOpt[];
  orderStrategyId: string;
  strategyDisplayName: string | null;
  planStrategyId: string;
  onStrategyId: (id: string) => void;
  onOpenPlan?: () => void;
  onOpenCalm?: () => void;
  onOpenAi?: () => void;
  equityNum: number;
  cashBalance: number;
  floatingPnl: number;
  marginUsed: number;
  accountType: "cash" | "margin";
  onAccountType: (t: "cash" | "margin") => void;
  borrowedBalance: number;
  interestAccrued: number;
  buyingPower: number;
  currency: string;
  qtyMode: QtyMode;
  onQtyMode: (m: QtyMode) => void;
  qtyInput: string;
  onQtyInput: (v: string) => void;
  shares: number;
  estimate: number;
  equityPct: number;
  maxSharesByMargin: number;
  stopLoss: string;
  onStopLoss: (v: string) => void;
  takeProfit: string;
  onTakeProfit: (v: string) => void;
  onApplyStopPct: (pct: number) => void;
  onApplyTakePct: (pct: number) => void;
  confirmBefore: boolean;
  onConfirmBefore: (v: boolean) => void;
  emergencyStop: boolean;
  onEmergencyStop: (v: boolean) => void;
  qtyNum: number;
  estimatePrice: number;
  estimateLabel: string;
  estimateCaption: string;
  stackSubmitLabel: string;
  brokerSubmitLabel: string;
  submitClass: string;
  busy: boolean;
  emotionTags: EmotionTagId[];
  onEmotionTags: (tags: EmotionTagId[]) => void;
  orders: Order[];
  onCancelOrder: (id: string) => void;
};

/** Chooses stack vs broker dock layout for TradePanel. */
export function TradePanelFormBody(p: Props) {
  if (p.stack) {
    const currencyPrefix =
      p.currency === "USD" || p.currency === "USDT"
        ? "US$"
        : `${p.currency} `;
    return (
      <TradePanelStackLayout
        symbol={p.symbol}
        positionLine={p.positionLine}
        resultBanner={p.resultBanner}
        draftBanner={p.draftBanner}
        side={p.side}
        onSide={p.onSide}
        orderType={p.orderType}
        onOrderType={p.onOrderType}
        qty={p.qty}
        onQty={p.onQty}
        limitPrice={p.limitPrice}
        onLimitPrice={p.onLimitPrice}
        stopPrice={p.stopPrice}
        onStopPrice={p.onStopPrice}
        bid={p.bid}
        ask={p.ask}
        lastPrice={p.lastPrice}
        qtyMode={p.qtyMode}
        onQtyMode={p.onQtyMode}
        qtyInput={p.qtyInput}
        onQtyInput={p.onQtyInput}
        shares={p.shares}
        estimateNotional={p.estimate}
        equityPct={p.equityPct}
        maxSharesByMargin={p.maxSharesByMargin}
        currencyPrefix={currencyPrefix}
        stopLoss={p.stopLoss}
        onStopLoss={p.onStopLoss}
        takeProfit={p.takeProfit}
        onTakeProfit={p.onTakeProfit}
        onApplyStopPct={p.onApplyStopPct}
        onApplyTakePct={p.onApplyTakePct}
        estimateLabel={p.estimateLabel}
        submitLabel={p.brokerSubmitLabel}
        submitClass={p.submitClass}
        busy={p.busy}
        canSubmit={p.qtyNum > 0 && !p.emergencyStop}
        orders={p.orders}
        onCancelOrder={p.onCancelOrder}
      />
    );
  }

  return (
    <TradePanelDefaultLayout
      symbol={p.symbol}
      assetType={p.assetType}
      quoteName={p.quoteName}
      lastPrice={p.lastPrice}
      percentChange={p.percentChange}
      loadingLabel={p.loadingLabel}
      resultBanner={p.resultBanner}
      positionLine={p.positionLine}
      draftBanner={p.draftBanner}
      side={p.side}
      onSide={p.onSide}
      orderType={p.orderType}
      onOrderType={p.onOrderType}
      qty={p.qty}
      onQty={p.onQty}
      limitPrice={p.limitPrice}
      onLimitPrice={p.onLimitPrice}
      stopPrice={p.stopPrice}
      onStopPrice={p.onStopPrice}
      bid={p.bid}
      ask={p.ask}
      invalidationPrice={p.invalidationPrice}
      onInvalidationPrice={p.onInvalidationPrice}
      strategies={p.strategies}
      strategyId={p.orderStrategyId}
      strategyName={p.strategyDisplayName}
      planStrategyId={p.planStrategyId}
      onStrategyId={p.onStrategyId}
      onOpenPlan={p.onOpenPlan}
      onOpenCalm={p.onOpenCalm}
      onOpenAi={p.onOpenAi}
      equity={p.equityNum}
      cashBalance={p.cashBalance}
      floatingPnl={p.floatingPnl}
      dayPnl={0}
      marginUsed={p.marginUsed}
      accountType={p.accountType}
      onAccountType={p.onAccountType}
      borrowedBalance={p.borrowedBalance}
      interestAccrued={p.interestAccrued}
      buyingPower={p.buyingPower}
      currency={p.currency}
      qtyMode={p.qtyMode}
      onQtyMode={p.onQtyMode}
      qtyInput={p.qtyInput}
      onQtyInput={p.onQtyInput}
      shares={p.shares}
      estimateNotional={p.estimate}
      equityPct={p.equityPct}
      maxSharesByMargin={p.maxSharesByMargin}
      stopLoss={p.stopLoss}
      onStopLoss={p.onStopLoss}
      takeProfit={p.takeProfit}
      onTakeProfit={p.onTakeProfit}
      onApplyStopPct={p.onApplyStopPct}
      onApplyTakePct={p.onApplyTakePct}
      confirmBefore={p.confirmBefore}
      onConfirmBefore={p.onConfirmBefore}
      emergencyStop={p.emergencyStop}
      onEmergencyStop={p.onEmergencyStop}
      qtyNum={p.qtyNum}
      estimatePrice={p.estimatePrice}
      stopForRisk={
        p.orderType === "stop"
          ? Number(p.stopPrice) || null
          : Number(p.stopLoss) || Number(p.invalidationPrice) || null
      }
      estimateLabel={p.estimateLabel}
      estimateCaption={p.estimateCaption}
      submitLabel={p.brokerSubmitLabel}
      submitClass={p.submitClass}
      busy={p.busy}
      emotionTags={p.emotionTags}
      onEmotionTags={p.onEmotionTags}
      orders={p.orders}
      onCancelOrder={p.onCancelOrder}
    />
  );
}
