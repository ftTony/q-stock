"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { TradeAiLinks } from "@/components/trading/trade-ai-links";
import { TradeCalmFields } from "@/components/trading/trade-calm-fields";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
import { TradeOrderFields } from "@/components/trading/trade-order-fields";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

type Order = {
  id: string;
  side: Side;
  type: OrderType;
  qty: number;
  limitPrice: number | null;
  stopPrice: number | null;
};

type Props = {
  loading: boolean;
  positionLine: ReactNode;
  resultBanner: ReactNode;
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
  lastPrice: number | null;
  invalidationPrice: string;
  onInvalidationPrice: (v: string) => void;
  strategies: Array<{ id: string; name: string }>;
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
  estimateLabel: string;
  submitLabel: string;
  submitClass: string;
  busy: boolean;
  canSubmit: boolean;
  emotionTags: EmotionTagId[];
  onEmotionTags: (tags: EmotionTagId[]) => void;
  symbol: string;
  assetType: string;
  orders: Order[];
  onCancelOrder: (id: string) => void;
};

/** Desktop stack bottom only: calm/orders left, ticket right. */
export function TradePanelStackLayout({
  loading,
  positionLine,
  resultBanner,
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
  lastPrice,
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
  estimateLabel,
  submitLabel,
  submitClass,
  busy,
  canSubmit,
  emotionTags,
  onEmotionTags,
  symbol,
  assetType,
  orders,
  onCancelOrder,
}: Props) {
  const t = useTranslations("trading");

  return (
    <div className="aw-trade-stack-split flex min-h-0 flex-1 overflow-hidden">
      <div className="aw-trade-stack-side aw-trade-stack-pad aw-dock-scroll flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain py-2">
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
          stop={
            orderType === "stop"
              ? Number(stopPrice) || null
              : Number(invalidationPrice) || null
          }
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

      <div
        className="aw-trade-stack-divider shrink-0 self-stretch"
        aria-hidden
      />

      <div className="aw-trade-stack-ticket flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="aw-trade-stack-pad aw-dock-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain py-2">
          {loading ? <p className="aw-caption">{t("loading")}</p> : null}
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
            compact
          />
          {draftBanner}
        </div>
        <div className="aw-trade-stack-pad aw-trade-stack-submit-bar shrink-0 border-t border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--panel))] pb-1.5 pt-1">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="aw-metric-label">
              {t("estimate")}
              <span className="ml-1.5 font-normal text-[var(--muted)]">
                · {t("paperBadge")}
              </span>
            </span>
            <span className="aw-metric-value text-[13px]">{estimateLabel}</span>
          </div>
          <SubmitButton
            type="submit"
            loading={busy}
            loadingLabel={t("loading")}
            disabled={!canSubmit}
            className={`aw-trade-stack-submit ${submitClass}`}
          >
            {submitLabel}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}
