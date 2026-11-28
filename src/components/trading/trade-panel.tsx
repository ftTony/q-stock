"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TradePasswordDialog } from "@/components/trading/trade-password-dialog";
import {
  OrderConfirmDetails,
  type OrderDetailRow,
} from "@/components/trading/order-confirm-details";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import { useMounted } from "@/hooks/use-mounted";
import { useMyStrategies } from "@/hooks/query/use-strategies";
import {
  useCancelOrder,
  usePlaceOrder,
  useResetTradePassword,
  useSetTradePassword,
  useTradingAccount,
  useTradingOrders,
  useTradingPositions,
  useTradePasswordStatus,
  useVerifyLoginPassword,
} from "@/hooks/query/use-trading";
import { formatNumber } from "@/lib/format-number";
import { consumePaperDraft } from "@/lib/trading/paper-draft-storage";
import { tradingErrorMessage } from "@/lib/trading/order-error-message";
import type { EmotionTagId } from "@/components/symbol/plan/symbol-emotion-check";
import {
  TradePanelDraftBanner,
  TradePanelPositionLine,
  TradePanelResultBanner,
} from "@/components/trading/trade-panel-banners";
import { TradePanelFormBody } from "@/components/trading/trade-panel-form-body";
import {
  buildPlaceOrderBody,
  tradeSubmitClass,
} from "@/components/trading/trade-ticket-submit";
import { useTradeOrderStrategy } from "@/components/trading/use-trade-order-strategy";
import { useTradeTicketQty } from "@/components/trading/use-trade-ticket-qty";
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

type AccountType = "cash" | "margin";
type Account = {
  cashBalance: number;
  currency: string;
  accountType?: AccountType;
  borrowedBalance?: number;
  interestAccrued?: number;
};
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
  const tPw = useTranslations("tradePassword");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const [side, setSide] = useState<Side>("buy");
  const [accountType, setAccountType] = useState<AccountType>("cash");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [invalidationPrice, setInvalidationPrice] = useState("");
  const [emotionTags, setEmotionTags] = useState<EmotionTagId[]>([]);
  const planStrategyId = planStrategyIdProp || "";
  const signedIn = Boolean(session?.user);

  const accountQuery = useTradingAccount(signedIn, accountType);
  const positionsQuery = useTradingPositions({ enabled: signedIn, accountType });
  const ordersQuery = useTradingOrders({
    status: "pending",
    symbol,
    assetType,
    accountType,
    enabled: signedIn,
  });
  const strategiesQuery = useMyStrategies(signedIn);
  const placeOrder = usePlaceOrder();
  const cancelOrder = useCancelOrder();
  const tradePwQuery = useTradePasswordStatus(signedIn);
  const setTradePw = useSetTradePassword();
  const resetTradePw = useResetTradePassword();
  const verifyLoginPw = useVerifyLoginPassword();
  const tradePasswordEnabled = Boolean(tradePwQuery.data?.enabled);

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
  const grossNum = useMemo(() => {
    const list =
      ((positionsQuery.data as { positions?: Array<{ qty: number; avgCost: number }> } | undefined)
        ?.positions ?? []) as Array<{ qty: number; avgCost: number }>;
    return list.reduce((s, p) => s + p.qty * p.avgCost, 0);
  }, [positionsQuery.data]);
  const orders =
    ((ordersQuery.data as { orders?: Order[] } | undefined)?.orders ??
      []) as Order[];
  const busy = placeOrder.isPending || cancelOrder.isPending;

  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<ToastTone>("neutral");
  const [msgKey, setMsgKey] = useState(0);
  const [submitResult, setSubmitResult] = useState<"filled" | "pending" | null>(
    null,
  );
  const [submitOrderId, setSubmitOrderId] = useState<string | null>(null);
  const [storedDraft, setStoredDraft] = useState<TradeAiDraft | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordMode, setPasswordMode] = useState<
    "enter" | "set" | "forgot"
  >("enter");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  /** PIN captured in step 1, held until the step-2 confirmation is accepted. */
  const [pendingPin, setPendingPin] = useState<string | null>(null);
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
      setQtyMode("shares");
      setQtyInput(String(effectiveDraft.qtyHint));
    }
    if (effectiveDraft.invalidationNote) {
      const m = effectiveDraft.invalidationNote.match(/(\d+(\.\d+)?)/);
      if (m) setInvalidationPrice(m[1]!);
    }
  }, [effectiveDraft]);

  const estimatePrice = useMemo(() => {
    if (orderType === "limit") return Number(limitPrice) || lastPrice || 0;
    if (orderType === "stop") return Number(stopPrice) || lastPrice || 0;
    return lastPrice || 0;
  }, [orderType, limitPrice, stopPrice, lastPrice]);

  const borrowedNum = account?.borrowedBalance ?? 0;
  const interestNum = account?.interestAccrued ?? 0;
  const equityNum =
    accountType === "margin"
      ? Math.max(0, (account?.cashBalance ?? 0) + grossNum - borrowedNum - interestNum)
      : account?.cashBalance ?? 0;
  // Cash book: power = cash. Margin book: 2×equity minus current exposure.
  const buyingPowerNum =
    accountType === "margin"
      ? Math.max(0, equityNum * 2 - grossNum)
      : Math.max(0, account?.cashBalance ?? 0);
  const ticket = useTradeTicketQty({
    estimatePrice,
    equity: equityNum,
    buyingPower: buyingPowerNum,
    side,
    stack,
    qty,
  });
  const {
    qtyMode,
    setQtyMode,
    qtyInput,
    setQtyInput,
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    confirmBefore,
    setConfirmBefore,
    emergencyStop,
    setEmergencyStop,
    shares,
    qtyNum,
    estimate,
    maxSharesByMargin,
    equityPct,
    applyStopPct,
    applyTakePct,
  } = ticket;
  const floatingPnl =
    position && lastPrice != null && position.avgCost > 0
      ? (lastPrice - position.avgCost) * position.qty
      : 0;
  const marginUsed =
    position && lastPrice != null
      ? Math.abs(position.qty) * (position.avgCost || lastPrice)
      : 0;

  function showToast(text: string, tone: ToastTone) {
    setMsgTone(tone);
    setMsg(text);
    setMsgKey((k) => k + 1);
  }

  async function submitOrder(pin?: string) {
    try {
      const body = buildPlaceOrderBody({
        accountType,
        symbol,
        assetType,
        side,
        orderType,
        qtyNum,
        estimatePrice,
        equity: equityNum,
        emotionTags,
        orderStrategyId,
        limitPrice,
        stopPrice,
        stopLoss,
        takeProfit,
        invalidationPrice,
        tradePin: pin,
      });

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
      setPendingPin(null);
      return true;
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === "INVALID_TRADE_PASSWORD") {
        // Wrong PIN: bounce back to the password sheet for a retry.
        setConfirmOpen(false);
        setPendingPin(null);
        setPasswordError(t("errTradePassword"));
        setPasswordOpen(true);
        return false;
      }
      showToast(tradingErrorMessage(err, t), "error");
      return false;
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSubmitResult(null);
    setSubmitOrderId(null);
    if (!session?.user) {
      showToast(t("loginRequired"), "neutral");
      return;
    }
    if (emergencyStop) {
      showToast(t("emergencyStopActive"), "neutral");
      return;
    }
    if (!(qtyNum > 0)) {
      showToast(t("errInvalidQty"), "neutral");
      return;
    }
    // Step 1: trade password. When none is configured yet the user must
    // create one (6 digits) first; otherwise ask for the existing PIN.
    if (pendingPin == null) {
      if (tradePwQuery.data == null) return; // status not loaded yet
      setPasswordMode(tradePasswordEnabled ? "enter" : "set");
      setPasswordError(null);
      setPasswordOpen(true);
      return;
    }
    // Step 2: secondary confirmation (shared by password and no-password flows).
    if (confirmBefore) {
      setConfirmOpen(true);
      return;
    }
    // Confirmation disabled: submit directly with the captured PIN (if any).
    void submitOrder(pendingPin ?? undefined);
  }

  /** PIN accepted locally → close the sheet, then open secondary confirmation. */
  function onPinCaptured(pin: string) {
    setPasswordError(null);
    setPendingPin(pin);
    setPasswordOpen(false);
    if (confirmBefore) {
      setConfirmOpen(true);
    } else {
      void submitOrder(pin);
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
    return <div className="p-4 text-sm text-[var(--muted)]">{t("loading")}</div>;
  }
  if (!session?.user) {
    return (
      <div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate compact title={t("loginTitle")} body={t("loginBody")} hint={t("loginHint")} />
      </div>
    );
  }

  const submitClass = tradeSubmitClass(side, stack);
  const typeKey =
    orderType === "market" ? "marketShort" : orderType === "limit" ? "limitShort" : "stopShort";
  const brokerSubmitLabel = t("submitTicket", {
    side: side === "buy" ? t("buy") : t("sell"),
    qty: formatNumber(qtyNum, { maximumFractionDigits: 4 }),
    symbol,
    type: t(typeKey),
  });
  const orderDetailRows: OrderDetailRow[] = [
    {
      label: t("confirmDetailSymbol"),
      value: quoteName ? `${quoteName} · ${symbol}` : symbol,
      kind: "symbol",
    },
    {
      label: t("side"),
      value: side === "buy" ? t("buy") : t("sell"),
      kind: "side",
    },
    {
      label: t("orderType"),
      value: t(typeKey),
    },
    {
      label: t("accountTypeLabel"),
      value: accountType === "margin" ? t("accountTypeMargin") : t("accountTypeCash"),
    },
    {
      label: t("qty"),
      value: formatNumber(qtyNum, { maximumFractionDigits: 4 }),
    },
    {
      label: t("confirmDetailPrice"),
      value: `$${fmtMoney(estimatePrice)}`,
    },
    {
      label: t("estimate"),
      value: `$${fmtMoney(estimate)}`,
      kind: "amount",
    },
  ];
  const orderDetails = (
    <OrderConfirmDetails rows={orderDetailRows} side={side} />
  );
  const positionLine = (
    <TradePanelPositionLine qty={position?.qty ?? 0} avgCost={position?.avgCost ?? null} fmtMoney={fmtMoney} />
  );
  const resultBanner = (
    <TradePanelResultBanner
      kind={submitResult}
      orderId={submitOrderId}
      onDismiss={() => {
        setSubmitResult(null);
        setSubmitOrderId(null);
      }}
      onOpenSymbolReview={onOpenSymbolReview}
    />
  );
  const draftBanner = (
    <TradePanelDraftBanner
      visible={Boolean(effectiveDraft)}
      onClear={() => {
        setStoredDraft(null);
        onDismissAiDraft?.();
      }}
    />
  );

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
      <TradePanelFormBody
        stack={stack}
        symbol={symbol}
        assetType={assetType}
        quoteName={quoteName}
        lastPrice={lastPrice}
        percentChange={percentChange}
        bid={bid}
        ask={ask}
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
        invalidationPrice={invalidationPrice}
        onInvalidationPrice={setInvalidationPrice}
        strategies={strategies}
        orderStrategyId={orderStrategyId}
        strategyDisplayName={strategyDisplayName}
        planStrategyId={planStrategyId}
        onStrategyId={setOrderStrategy}
        onOpenPlan={onOpenPlan}
        onOpenCalm={onOpenCalm}
        onOpenAi={onOpenAi}
        equityNum={equityNum}
        cashBalance={account?.cashBalance ?? 0}
        floatingPnl={floatingPnl}
        marginUsed={marginUsed}
        accountType={accountType}
        onAccountType={setAccountType}
        borrowedBalance={borrowedNum}
        interestAccrued={interestNum}
        buyingPower={buyingPowerNum}
        currency={account?.currency ?? "USD"}
        qtyMode={qtyMode}
        onQtyMode={setQtyMode}
        qtyInput={qtyInput}
        onQtyInput={setQtyInput}
        shares={shares}
        estimate={estimate}
        equityPct={equityPct}
        maxSharesByMargin={maxSharesByMargin}
        stopLoss={stopLoss}
        onStopLoss={setStopLoss}
        takeProfit={takeProfit}
        onTakeProfit={setTakeProfit}
        onApplyStopPct={applyStopPct}
        onApplyTakePct={applyTakePct}
        confirmBefore={confirmBefore}
        onConfirmBefore={setConfirmBefore}
        emergencyStop={emergencyStop}
        onEmergencyStop={setEmergencyStop}
        qtyNum={qtyNum}
        estimatePrice={estimatePrice}
        estimateLabel={`$${fmtMoney(estimate)}`}
        estimateCaption={t("estimate")}
        stackSubmitLabel={side === "buy" ? t("submitBuy") : t("submitSell")}
        brokerSubmitLabel={brokerSubmitLabel}
        submitClass={submitClass}
        busy={busy}
        emotionTags={emotionTags}
        onEmotionTags={setEmotionTags}
        orders={orders}
        onCancelOrder={(id) => void cancel(id)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t("confirmOrderTitle")}
        details={orderDetails}
        cancelLabel={t("confirmOrderCancel")}
        confirmLabel={t("confirmOrderSubmit")}
        confirmColor={side === "buy" ? "var(--up)" : "var(--down)"}
        busy={placeOrder.isPending}
        onCancel={() => {
          if (!placeOrder.isPending) {
            setConfirmOpen(false);
            setPendingPin(null);
          }
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          void submitOrder(pendingPin ?? undefined);
        }}
      />

      <TradePasswordDialog
        open={passwordOpen}
        mode={passwordMode}
        title={
          passwordMode === "set"
            ? tPw("setTitleDialog")
            : passwordMode === "forgot"
              ? tPw("forgotTitle")
              : t("tradePasswordTitle")
        }
        hint={
          passwordMode === "set"
            ? tPw("setHintDialog")
            : passwordMode === "forgot"
              ? tPw("forgotHint1")
              : t("tradePasswordHint")
        }
        step2Hint={tPw("forgotHint2")}
        stepLabels={[tPw("stepVerify"), tPw("stepNew"), tPw("stepConfirm")]}
        verifyLabel={tPw("nextStep")}
        prevLabel={tPw("prevStep")}
        nextLabel={tPw("nextStep")}
        doneLabel={tPw("done")}
        onVerifyLogin={
          passwordMode === "forgot"
            ? (lp) =>
                (async () => {
                  try {
                    await verifyLoginPw.mutateAsync(lp);
                  } catch (err) {
                    const code = (err as Error & { code?: string }).code;
                    setPasswordError(
                      code === "INVALID_LOGIN_PASSWORD"
                        ? tPw("errLoginPassword")
                        : code === "NO_LOGIN_PASSWORD"
                          ? tPw("errNoLoginPassword")
                          : err instanceof Error && err.message
                            ? err.message
                            : tPw("saveFailed"),
                    );
                    throw err;
                  }
                })()
            : undefined
        }
        submitLabel={
          passwordMode === "set"
            ? tPw("setSubmit")
            : passwordMode === "forgot"
              ? tPw("resetSubmit")
              : t("tradePasswordSubmit")
        }
        cancelLabel={t("tradePasswordCancel")}
        errorLabel={t("errTradePassword")}
        mismatchLabel={tPw("errMismatch")}
        newPinLabel={tPw("newPin")}
        confirmPinLabel={tPw("confirmPin")}
        confirmAriaLabel={tPw("confirmPin")}
        loginPasswordLabel={tPw("loginPassword")}
        forgotLinkLabel={tPw("forgotLink")}
        onForgot={
          passwordMode === "enter"
            ? () => {
                setPasswordError(null);
                setPasswordMode("forgot");
              }
            : undefined
        }
        busy={
          placeOrder.isPending ||
          setTradePw.isPending ||
          resetTradePw.isPending
        }
        error={passwordError}
        onCancel={() => {
          if (
            !placeOrder.isPending &&
            !setTradePw.isPending &&
            !resetTradePw.isPending
          ) {
            setPasswordOpen(false);
            setPasswordError(null);
            setPendingPin(null);
          }
        }}
        onSubmit={(pin, loginPassword) => {
          if (passwordMode === "set") {
            // First-time setup: persist the new PIN, then continue the trade
            // flow with it (confirm dialog → order).
            void (async () => {
              try {
                await setTradePw.mutateAsync({ pin });
                onPinCaptured(pin);
              } catch (err) {
                setPasswordError(
                  err instanceof Error && err.message
                    ? err.message
                    : tPw("saveFailed"),
                );
              }
            })();
          } else if (passwordMode === "forgot") {
            // Forgot PIN: verify the login password, set the new PIN, then
            // continue the trade flow with it.
            void (async () => {
              try {
                await resetTradePw.mutateAsync({
                  loginPassword: loginPassword ?? "",
                  pin,
                });
                onPinCaptured(pin);
              } catch (err) {
                const code = (err as Error & { code?: string }).code;
                setPasswordError(
                  code === "INVALID_LOGIN_PASSWORD"
                    ? tPw("errLoginPassword")
                    : tPw("saveFailed"),
                );
              }
            })();
          } else {
            onPinCaptured(pin);
          }
        }}
      />
    </form>
  );
}
