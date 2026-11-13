"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
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
import { consumePaperDraft } from "@/lib/trading/paper-draft-storage";
import { tradingErrorMessage } from "@/lib/trading/order-error-message";
import { summarizeOrderRisk } from "@/lib/trading/risk-math";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import { TradePanelDefaultLayout } from "@/components/trading/trade-panel-default";
import { TradePanelStackLayout } from "@/components/trading/trade-panel-stack";
import { TradeSubmitResult } from "@/components/trading/trade-submit-result";
import { useTradeOrderStrategy } from "@/components/trading/use-trade-order-strategy";
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
  onOpenSymbolReview,
  /** Plan bind seeds order tag; order changes do not rewrite Plan. */
  strategyId: planStrategyIdProp = "",
  strategyName: planStrategyName = null,
  density = "default",
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
  onOpenSymbolReview?: (orderId?: string | null) => void;
  strategyId?: string;
  strategyName?: string | null;
  density?: "default" | "stack";
}) {
  const stack = density === "stack";
  const t = useTranslations("trading");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [invalidationPrice, setInvalidationPrice] = useState("");
  const [emotionTags, setEmotionTags] = useState<EmotionTagId[]>([]);
  const planStrategyId = planStrategyIdProp || "";
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
  const {
    orderStrategyId,
    setOrderStrategy,
    strategyDisplayName,
  } = useTradeOrderStrategy(
    planStrategyId,
    planStrategyName,
    strategies,
    symbol,
    assetType,
  );

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
  const [submitOrderId, setSubmitOrderId] = useState<string | null>(null);
  const [storedDraft, setStoredDraft] = useState<TradeAiDraft | null>(null);
  const effectiveDraft = aiDraft ?? storedDraft;

  useEffect(() => {
    const draft = consumePaperDraft(symbol, assetType);
    if (!draft) return;
    setStoredDraft({
      side: draft.side,
      type: draft.type,
      price: draft.price,
      qtyHint: draft.qtyHint,
      invalidationNote: draft.invalidationNote,
      nonce: draft.nonce,
    });
    if (draft.strategyId) setOrderStrategy(draft.strategyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/symbol bridge
  }, [symbol, assetType]);

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
    if (!effectiveDraft) return;
    setSide(effectiveDraft.side);
    setOrderType(effectiveDraft.type);
    if (effectiveDraft.type === "limit") {
      setLimitPrice(String(Number(effectiveDraft.price.toFixed(4))));
    } else {
      setStopPrice(String(Number(effectiveDraft.price.toFixed(4))));
    }
    if (effectiveDraft.qtyHint != null && effectiveDraft.qtyHint > 0) {
      setQty(String(effectiveDraft.qtyHint));
    }
    if (effectiveDraft.invalidationNote) {
      const m = effectiveDraft.invalidationNote.match(/(\d+(\.\d+)?)/);
      if (m) setInvalidationPrice(m[1]!);
    }
  }, [effectiveDraft]);

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
    setSubmitOrderId(null);
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
        strategyId: orderStrategyId || null,
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
        order?: { id?: string; status?: string };
        error?: string;
      };
      const filled = data.order?.status === "filled";
      setSubmitOrderId(data.order?.id ?? null);
      setSubmitResult(filled ? "filled" : "pending");
      showToast(
        filled ? t("orderFilledPaper") : t("orderPendingPaper"),
        "success",
      );
      setEmotionTags([]);
      onDismissAiDraft?.();
    } catch (err) {
      showToast(tradingErrorMessage(err, t), "error");
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

  const submitH = stack ? "h-8 min-h-8" : "h-9";
  const submitRadius = stack ? "!rounded-none" : "!rounded-[8px]";
  const submitText = stack ? "!text-[12px]" : "!text-[13px]";
  const submitClass =
    side === "buy"
      ? `${submitH} w-full ${submitRadius} !border !border-[color-mix(in_srgb,var(--up)_28%,var(--aw-hairline,var(--border)))] !bg-[color-mix(in_srgb,var(--up)_14%,var(--aw-canvas,#fff))] ${submitText} !font-semibold !text-[var(--up)] hover:!bg-[color-mix(in_srgb,var(--up)_22%,var(--aw-canvas,#fff))] hover:!opacity-100`
      : `${submitH} w-full ${submitRadius} !border !border-[color-mix(in_srgb,var(--down)_28%,var(--aw-hairline,var(--border)))] !bg-[color-mix(in_srgb,var(--down)_14%,var(--aw-canvas,#fff))] ${submitText} !font-semibold !text-[var(--down)] hover:!bg-[color-mix(in_srgb,var(--down)_22%,var(--aw-canvas,#fff))] hover:!opacity-100`;

  const positionLine =
    position && position.qty > 0 ? (
      <p className="text-[12px] tabular-nums text-[var(--muted)]">
        {t("position")}: {position.qty}
        {position.avgCost != null
          ? ` · ${t("avgCost")} $${fmtMoney(position.avgCost)}`
          : ""}
      </p>
    ) : null;

  const resultBanner = submitResult ? (
    <TradeSubmitResult
      kind={submitResult}
      onDismiss={() => {
        setSubmitResult(null);
        setSubmitOrderId(null);
      }}
      onViewSymbolReview={
        onOpenSymbolReview
          ? () => onOpenSymbolReview(submitOrderId)
          : undefined
      }
    />
  ) : null;

  const draftBanner = effectiveDraft ? (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--aw-hairline,var(--border))] pt-2 text-[12px] text-[var(--brand-text)]">
      <span>{t("aiDraftBanner")}</span>
      <button
        type="button"
        className="underline"
        onClick={() => {
          setStoredDraft(null);
          onDismissAiDraft?.();
        }}
      >
        {t("aiDraftUndo")}
      </button>
    </div>
  ) : null;

  return (
    <form
      onSubmit={onSubmit}
      className="aw-trade-panel flex min-h-0 flex-1 flex-col"
      data-density={density}
    >
      <TopToast
        key={msgKey}
        message={msg}
        tone={msgTone}
        onDismiss={() => setMsg(null)}
      />
      {stack ? (
        <TradePanelStackLayout
          loading={loading}
          positionLine={positionLine}
          resultBanner={resultBanner}
          draftBanner={draftBanner}
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
          invalidationPrice={invalidationPrice}
          onInvalidationPrice={setInvalidationPrice}
          strategies={strategies}
          strategyId={orderStrategyId}
          strategyName={strategyDisplayName}
          planStrategyId={planStrategyId}
          onStrategyId={setOrderStrategy}
          onOpenPlan={onOpenPlan}
          onOpenCalm={onOpenCalm}
          onOpenAi={onOpenAi}
          equity={account?.cashBalance ?? null}
          qtyNum={qtyNum}
          estimatePrice={estimatePrice}
          estimateLabel={`$${fmtMoney(estimate)}`}
          submitLabel={side === "buy" ? t("submitBuy") : t("submitSell")}
          submitClass={submitClass}
          busy={busy}
          canSubmit={qtyNum > 0}
          emotionTags={emotionTags}
          onEmotionTags={setEmotionTags}
          symbol={symbol}
          assetType={assetType}
          orders={orders}
          onCancelOrder={(id) => void cancel(id)}
        />
      ) : (
        <TradePanelDefaultLayout
          symbol={symbol}
          assetType={assetType}
          quoteName={quoteName}
          lastPrice={lastPrice}
          percentChange={percentChange}
          loading={loading}
          loadingLabel={t("loading")}
          resultBanner={resultBanner}
          positionLine={positionLine}
          draftBanner={draftBanner}
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
          invalidationPrice={invalidationPrice}
          onInvalidationPrice={setInvalidationPrice}
          strategies={strategies}
          strategyId={orderStrategyId}
          strategyName={strategyDisplayName}
          planStrategyId={planStrategyId}
          onStrategyId={setOrderStrategy}
          onOpenPlan={onOpenPlan}
          onOpenCalm={onOpenCalm}
          onOpenAi={onOpenAi}
          equity={account?.cashBalance ?? null}
          qtyNum={qtyNum}
          estimatePrice={estimatePrice}
          stopForRisk={
            orderType === "stop"
              ? Number(stopPrice) || null
              : Number(invalidationPrice) || null
          }
          estimateLabel={`$${fmtMoney(estimate)}`}
          estimateCaption={t("estimate")}
          submitLabel={side === "buy" ? t("submitBuy") : t("submitSell")}
          submitClass={submitClass}
          busy={busy}
          emotionTags={emotionTags}
          onEmotionTags={setEmotionTags}
          orders={orders}
          onCancelOrder={(id) => void cancel(id)}
        />
      )}
    </form>
  );
}
