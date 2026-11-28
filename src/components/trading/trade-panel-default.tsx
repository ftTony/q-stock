"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
import { TradeOrderFields } from "@/components/trading/trade-order-fields";
import { TradeTicketAccount } from "@/components/trading/trade-ticket-account";
import { TradeTicketBrackets } from "@/components/trading/trade-ticket-brackets";
import {
  TradeTicketQty,
  type QtyMode,
} from "@/components/trading/trade-ticket-qty";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import type { AssetType } from "@/lib/types";
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
  status: string;
  createdAt: string;
};

type Props = {
  symbol: string;
  assetType: AssetType;
  quoteName: string | null;
  lastPrice: number | null;
  percentChange: number | null;
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
  /** Legacy calm props kept for call-site compatibility (unused in broker UI). */
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
  cashBalance: number;
  floatingPnl: number;
  dayPnl: number;
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
  estimateNotional: number;
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

/** Dock trade form — broker-style ticket matching 下单面板 reference. */
export function TradePanelDefaultLayout({
  symbol,
  lastPrice,
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
  cashBalance,
  equity,
  floatingPnl,
  dayPnl,
  marginUsed,
  accountType,
  onAccountType,
  borrowedBalance,
  interestAccrued,
  buyingPower,
  currency,
  qtyMode,
  onQtyMode,
  qtyInput,
  onQtyInput,
  shares,
  estimateNotional,
  equityPct,
  maxSharesByMargin,
  stopLoss,
  onStopLoss,
  takeProfit,
  onTakeProfit,
  onApplyStopPct,
  onApplyTakePct,
  confirmBefore,
  onConfirmBefore,
  emergencyStop,
  onEmergencyStop,
  qtyNum,
  submitLabel,
  submitClass,
  busy,
  orders,
  onCancelOrder,
}: Props) {
  const t = useTranslations("trading");
  const canSubmit = qtyNum > 0 && !emergencyStop;
  const px =
    lastPrice != null
      ? formatNumber(lastPrice, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : "—";

  return (
    <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2.5">
      <div className="space-y-3">
        {resultBanner}
        <TradeTicketAccount
          accountType={accountType}
          onAccountType={onAccountType}
          cashBalance={cashBalance}
          equity={equity ?? cashBalance}
          floatingPnl={floatingPnl}
          dayPnl={dayPnl}
          marginUsed={marginUsed}
          borrowedBalance={borrowedBalance}
          interestAccrued={interestAccrued}
          buyingPower={buyingPower}
          currency={currency}
        />
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-semibold tracking-wide text-[var(--foreground)]">
            {symbol}
          </span>
          <span className="text-[15px] font-medium tabular-nums tracking-tight text-[var(--foreground)]">
            {px}
          </span>
        </div>
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
          currencyPrefix={
            currency === "USD" || currency === "USDT" ? "US$" : `${currency} `
          }
        />
        {draftBanner}
        {positionLine}
        <TradeTicketBrackets
          side={side}
          stopLoss={stopLoss}
          onStopLoss={onStopLoss}
          takeProfit={takeProfit}
          onTakeProfit={onTakeProfit}
          onApplyStopPct={onApplyStopPct}
          onApplyTakePct={onApplyTakePct}
        />
        <TradeOpenOrders
          orders={orders}
          busy={busy}
          onCancel={onCancelOrder}
        />
        {/* Follow form — do not pin footer to drawer bottom (avoids empty mid gap). */}
        <div className="border-t border-[var(--aw-hairline,var(--border))] pt-3">
          <SubmitButton
            type="submit"
            loading={busy}
            loadingLabel={loadingLabel}
            disabled={!canSubmit}
            className={submitClass}
          >
            {submitLabel}
          </SubmitButton>
          <p className="mt-1.5 text-center text-[11px] text-[var(--muted)]">
            {t("paperFillHint")}
          </p>
          <div className="mt-2 space-y-2 border-t border-[var(--aw-hairline,var(--border))] pt-2">
            <ToggleRow
              label={t("confirmBeforeOrder")}
              checked={confirmBefore}
              onChange={onConfirmBefore}
            />
            <ToggleRow
              label={t("emergencyStop")}
              checked={emergencyStop}
              onChange={onEmergencyStop}
            />
          </div>
          <p className="mt-2 text-[10px] leading-snug text-[var(--muted)]">
            {t("paperLimitNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-[12px] text-[var(--foreground)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-none transition-colors ${
          checked ? "bg-[var(--brand)]" : "bg-[var(--surface-2)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 bg-[var(--panel)] transition-transform ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
