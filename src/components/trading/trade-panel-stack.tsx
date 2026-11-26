"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
import { TradeOrderFields } from "@/components/trading/trade-order-fields";
import { TradeTicketBrackets } from "@/components/trading/trade-ticket-brackets";
import {
  TradeTicketQty,
  type QtyMode,
} from "@/components/trading/trade-ticket-qty";
import { formatNumber } from "@/lib/format-number";

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
  symbol: string;
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
  qtyMode: QtyMode;
  onQtyMode: (m: QtyMode) => void;
  qtyInput: string;
  onQtyInput: (v: string) => void;
  shares: number;
  estimateNotional: number;
  equityPct: number;
  maxSharesByMargin: number;
  currencyPrefix: string;
  stopLoss: string;
  onStopLoss: (v: string) => void;
  takeProfit: string;
  onTakeProfit: (v: string) => void;
  onApplyStopPct: (pct: number) => void;
  onApplyTakePct: (pct: number) => void;
  estimateLabel: string;
  submitLabel: string;
  submitClass: string;
  busy: boolean;
  canSubmit: boolean;
  orders: Order[];
  onCancelOrder: (id: string) => void;
};

/**
 * Stack trade right column — full-width ticket (account lives on the left rail).
 */
export function TradePanelStackLayout({
  symbol,
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
  qtyMode,
  onQtyMode,
  qtyInput,
  onQtyInput,
  shares,
  estimateNotional,
  equityPct,
  maxSharesByMargin,
  currencyPrefix,
  stopLoss,
  onStopLoss,
  takeProfit,
  onTakeProfit,
  onApplyStopPct,
  onApplyTakePct,
  estimateLabel,
  submitLabel,
  submitClass,
  busy,
  canSubmit,
  orders,
  onCancelOrder,
}: Props) {
  const t = useTranslations("trading");
  const px =
    lastPrice != null
      ? formatNumber(lastPrice, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : "—";

  return (
    <div className="aw-trade-stack-ticket flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="aw-trade-stack-pad aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-3">
        <div className="mx-auto w-full max-w-[26rem] space-y-3.5">
          {loading ? <p className="aw-caption">{t("loading")}</p> : null}
          {resultBanner}

          <header className="flex items-baseline justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] pb-2.5">
            <span className="truncate text-[16px] font-semibold tracking-wide text-[var(--foreground)]">
              {symbol}
            </span>
            <span className="text-[16px] font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
              {px}
            </span>
          </header>

          {positionLine}

          <TradeOrderFields
            broker
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
          <TradeTicketQty
            mode={qtyMode}
            onMode={onQtyMode}
            value={qtyInput}
            onValue={onQtyInput}
            shares={shares}
            estimateNotional={estimateNotional}
            equityPct={equityPct}
            maxSharesByMargin={maxSharesByMargin}
            currencyPrefix={currencyPrefix}
          />
          <TradeTicketBrackets
            side={side}
            stopLoss={stopLoss}
            onStopLoss={onStopLoss}
            takeProfit={takeProfit}
            onTakeProfit={onTakeProfit}
            onApplyStopPct={onApplyStopPct}
            onApplyTakePct={onApplyTakePct}
          />
          {draftBanner}

          <div className="space-y-2 border-t border-[var(--aw-hairline,var(--border))] pt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-[var(--muted)]">
                {t("estimate")}
                <span className="mx-1 opacity-40">·</span>
                {t("paperBadge")}
              </span>
              <span className="text-[15px] font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
                {estimateLabel}
              </span>
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

          <TradeOpenOrders
            orders={orders}
            busy={busy}
            onCancel={onCancelOrder}
          />
        </div>
      </div>
    </div>
  );
}
