"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import { useMounted } from "@/hooks/use-mounted";
import { useMyStrategies } from "@/hooks/query/use-strategies";
import {
  useCancelOrder,
  usePlaceOrder,
  useTradingAccount,
  useTradingOrders,
  useTradingPositions,
} from "@/hooks/query/use-trading";
import { formatNumber } from "@/lib/format-number";
import { summarizeOrderRisk } from "@/lib/trading/risk-math";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import { TradeAiLinks } from "@/components/trading/trade-ai-links";
import { TradeCalmFields } from "@/components/trading/trade-calm-fields";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
import { TradeOrderFields } from "@/components/trading/trade-order-fields";
import { TradeSubmitResult } from "@/components/trading/trade-submit-result";
import { TradeTicketHeader } from "@/components/trading/trade-ticket-header";
import type { AssetType } from "@/lib/types";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

export type TradeAiDraft = {
  side: "buy" | "sell";
  type: "limit" | "stop";
  price: number;
  qtyHint?: number;
  invalidationNote?: string;
  nonce: number;
};

type Account = { cashBalance: number; currency: string };
type Position = { qty: number; avgCost: number };
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

function fmtMoney(n: number): string {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TradePanel({
  symbol,
  assetType,
  lastPrice,
  percentChange = null,
  quoteName = null,
  bid = null,
  ask = null,
  aiDraft = null,
  onDismissAiDraft,
  onCashBalance,
  onOpenCalm,
  onOpenAi,
  onOpenPlan,
  strategyId: strategyIdProp,
  strategyName = null,
  onStrategyIdChange,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  percentChange?: number | null;
  quoteName?: string | null;
  bid?: number | null;
  ask?: number | null;
  aiDraft?: TradeAiDraft | null;
  onDismissAiDraft?: () => void;
  onCashBalance?: (cash: number | null) => void;
  onOpenCalm?: () => void;
  onOpenAi?: () => void;
  onOpenPlan?: () => void;
  strategyId?: string;
  strategyName?: string | null;
  onStrategyIdChange?: (id: string, name?: string) => void;
}) {
  const t = useTranslations("trading");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const [side, setSide] = useState<Side>("buy");
  /** Swing / learning default: limit (P0 IA). */
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [invalidationPrice, setInvalidationPrice] = useState("");
  const [emotionTags, setEmotionTags] = useState<EmotionTagId[]>([]);
  const [strategyIdInner, setStrategyIdInner] = useState<string>("");
  const strategyId =
    strategyIdProp !== undefined ? strategyIdProp : strategyIdInner;
  const signedIn = Boolean(session?.user);

  const accountQuery = useTradingAccount(signedIn);
  const positionsQuery = useTradingPositions({ enabled: signedIn });
  const ordersQuery = useTradingOrders({
    status: "pending",
    symbol,
    assetType,
    enabled: signedIn,
  });
  const strategiesQuery = useMyStrategies(signedIn);
  const placeOrder = usePlaceOrder();
  const cancelOrder = useCancelOrder();

  const strategies = strategiesQuery.data?.strategies ?? [];
  const setStrategyId = (id: string) => {
    const name = strategies.find((s) => s.id === id)?.name;
    if (onStrategyIdChange) onStrategyIdChange(id, name);
    else setStrategyIdInner(id);
  };

  const account = (accountQuery.data as { account?: Account } | undefined)
    ?.account ?? null;
  const position = useMemo(() => {
    const list =
      (
        positionsQuery.data as
          | {
              positions?: Array<{
                symbol: string;
                assetType: string;
                qty: number;
                avgCost: number;
              }>;
            }
          | undefined
      )?.positions ?? [];
    const pos = list.find(
      (x) => x.symbol === symbol && x.assetType === assetType,
    );
    return pos ? ({ qty: pos.qty, avgCost: pos.avgCost } as Position) : null;
  }, [positionsQuery.data, symbol, assetType]);
  const orders =
    ((ordersQuery.data as { orders?: Order[] } | undefined)?.orders ??
      []) as Order[];
  const loading =
    accountQuery.isLoading ||
    positionsQuery.isLoading ||
    ordersQuery.isLoading;
  const busy = placeOrder.isPending || cancelOrder.isPending;

  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<ToastTone>("neutral");
  const [msgKey, setMsgKey] = useState(0);
  const [submitResult, setSubmitResult] = useState<"filled" | "pending" | null>(
    null,
  );

  useEffect(() => {
    onCashBalance?.(account?.cashBalance ?? null);
  }, [account?.cashBalance, onCashBalance]);

  useEffect(() => {
    if (lastPrice && lastPrice > 0) {
      setLimitPrice((prev) => prev || String(Number(lastPrice.toFixed(4))));
      setStopPrice((prev) => prev || String(Number(lastPrice.toFixed(4))));
    }
  }, [lastPrice]);

  useEffect(() => {
    const q = Number(searchParams.get("qty"));
    if (q > 0) setQty(String(q));
    const inv = searchParams.get("invalidation");
    if (inv && Number(inv) > 0) setInvalidationPrice(inv);
    const entry = searchParams.get("entry");
    if (entry && Number(entry) > 0) {
      setOrderType("limit");
      setLimitPrice(String(Number(Number(entry).toFixed(4))));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!aiDraft) return;
    setSide(aiDraft.side);
    setOrderType(aiDraft.type);
    if (aiDraft.type === "limit") {
      setLimitPrice(String(Number(aiDraft.price.toFixed(4))));
    } else {
      setStopPrice(String(Number(aiDraft.price.toFixed(4))));
    }
    if (aiDraft.qtyHint != null && aiDraft.qtyHint > 0) {
      setQty(String(aiDraft.qtyHint));
    }
    if (aiDraft.invalidationNote) {
      const m = aiDraft.invalidationNote.match(/(\d+(\.\d+)?)/);
      if (m) setInvalidationPrice(m[1]!);
    }
  }, [aiDraft]);

  const qtyNum = Number(qty) || 0;
  const estimatePrice = useMemo(() => {
    if (orderType === "limit") return Number(limitPrice) || lastPrice || 0;
    if (orderType === "stop") return Number(stopPrice) || lastPrice || 0;
    return lastPrice || 0;
  }, [orderType, limitPrice, stopPrice, lastPrice]);

  const estimate = qtyNum > 0 && estimatePrice > 0 ? qtyNum * estimatePrice : 0;

  function showToast(text: string, tone: ToastTone) {
    setMsgTone(tone);
    setMsg(text);
    setMsgKey((k) => k + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSubmitResult(null);
    if (!session?.user) {
      showToast(t("loginRequired"), "neutral");
      return;
    }
    try {
      const stopForRisk =
        orderType === "stop"
          ? Number(stopPrice)
          : Number(invalidationPrice) || null;
      const risk = summarizeOrderRisk({
        equity: account?.cashBalance ?? 0,
        qty: qtyNum,
        entry: estimatePrice,
        stop: stopForRisk,
      });
      const body: Record<string, unknown> = {
        symbol,
        assetType,
        side,
        type: orderType,
        qty: qtyNum,
        emotionTags,
        invalidationNote: invalidationPrice
          ? `invalidation=${invalidationPrice}`
          : null,
        strategyId: strategyId || null,
        riskSnapshot: {
          equity: account?.cashBalance ?? null,
          notional: risk.notional,
          riskAmount: risk.riskAmount,
          riskPct: risk.riskPct,
          positionPct: risk.positionPct,
        },
      };
      if (orderType === "limit") body.limitPrice = Number(limitPrice);
      if (orderType === "stop") body.stopPrice = Number(stopPrice);

      const data = (await placeOrder.mutateAsync(body)) as {
        order?: { status?: string };
        error?: string;
      };
      const filled = data.order?.status === "filled";
      setSubmitResult(filled ? "filled" : "pending");
      showToast(
        filled ? t("orderFilledPaper") : t("orderPendingPaper"),
        "success",
      );
      setEmotionTags([]);
      onDismissAiDraft?.();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("orderFailed"),
        "error",
      );
    }
  }

  async function cancel(id: string) {
    try {
      await cancelOrder.mutateAsync(id);
    } catch {
      /* ignore */
    }
  }

  if (!mounted || status === "loading") {
    return (
      <div className="p-4 text-sm text-[var(--muted)]">{t("loading")}</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate
          compact
          title={t("loginTitle")}
          body={t("loginBody")}
          hint={t("loginHint")}
        />
      </div>
    );
  }

  const submitClass =
    side === "buy"
      ? "h-9 w-full !rounded-[8px] !border !border-[color-mix(in_srgb,var(--up)_28%,var(--aw-hairline,var(--border)))] !bg-[color-mix(in_srgb,var(--up)_14%,var(--aw-canvas,#fff))] !text-[13px] !font-semibold !text-[var(--up)] hover:!bg-[color-mix(in_srgb,var(--up)_22%,var(--aw-canvas,#fff))] hover:!opacity-100"
      : "h-9 w-full !rounded-[8px] !border !border-[color-mix(in_srgb,var(--down)_28%,var(--aw-hairline,var(--border)))] !bg-[color-mix(in_srgb,var(--down)_14%,var(--aw-canvas,#fff))] !text-[13px] !font-semibold !text-[var(--down)] hover:!bg-[color-mix(in_srgb,var(--down)_22%,var(--aw-canvas,#fff))] hover:!opacity-100";

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <TopToast
        key={msgKey}
        message={msg}
        tone={msgTone}
        onDismiss={() => setMsg(null)}
      />
      <TradeTicketHeader
        symbol={symbol}
        assetType={assetType}
        name={quoteName}
        lastPrice={lastPrice}
        percentChange={percentChange}
      />
      <div className="aw-dock-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2.5">
        <div className="space-y-2.5">
          {loading ? <p className="aw-caption">{t("loading")}</p> : null}

          {submitResult ? (
            <TradeSubmitResult
              kind={submitResult}
              onDismiss={() => setSubmitResult(null)}
            />
          ) : null}

          {position && position.qty > 0 ? (
            <p className="text-[12px] tabular-nums text-[var(--muted)]">
              {t("position")}: {position.qty}
              {position.avgCost != null
                ? ` · ${t("avgCost")} $${fmtMoney(position.avgCost)}`
                : ""}
            </p>
          ) : null}

          <TradeOrderFields
            side={side}
            onSide={setSide}
            orderType={orderType}
            onOrderType={setOrderType}
            qty={qty}
            onQty={setQty}
            limitPrice={limitPrice}
            onLimitPrice={setLimitPrice}
            stopPrice={stopPrice}
            onStopPrice={setStopPrice}
            bid={bid}
            ask={ask}
            lastPrice={lastPrice}
          />

          {aiDraft ? (
            <div className="flex items-center justify-between gap-2 border-t border-[var(--aw-hairline,var(--border))] pt-2 text-[12px] text-[var(--brand-text)]">
              <span>{t("aiDraftBanner")}</span>
              <button
                type="button"
                className="underline"
                onClick={() => onDismissAiDraft?.()}
              >
                {t("aiDraftUndo")}
              </button>
            </div>
          ) : null}

          <TradeCalmFields
            invalidationPrice={invalidationPrice}
            onInvalidationPrice={setInvalidationPrice}
            strategies={strategies}
            strategyId={strategyId}
            strategyName={strategyName}
            onStrategyId={setStrategyId}
            onOpenPlan={onOpenPlan}
            equity={account?.cashBalance ?? null}
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
            onEmotionTags={setEmotionTags}
          />

          <TradeAiLinks onOpenCalm={onOpenCalm} onOpenAi={onOpenAi} />

          <TradeOpenOrders
            orders={orders}
            busy={busy}
            onCancel={(id) => void cancel(id)}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--panel))] px-4 pb-2.5 pt-2">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="aw-metric-label">{t("estimate")}</span>
          <span className="aw-metric-value">${fmtMoney(estimate)}</span>
        </div>
        <SubmitButton
          type="submit"
          loading={busy}
          loadingLabel={t("loading")}
          disabled={!(qtyNum > 0)}
          className={submitClass}
        >
          {side === "buy" ? t("submitBuy") : t("submitSell")}
        </SubmitButton>
      </div>
    </form>
  );
}
