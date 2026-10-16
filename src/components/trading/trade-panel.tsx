"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import { useMounted } from "@/hooks/use-mounted";
import { formatNumber } from "@/lib/format-number";
import { summarizeOrderRisk } from "@/lib/trading/risk-math";
import type { EmotionTagId } from "@/components/symbol/symbol-emotion-check";
import { TradeAccountStrip } from "@/components/trading/trade-account-strip";
import { TradeAiLinks } from "@/components/trading/trade-ai-links";
import { TradeBidAsk } from "@/components/trading/trade-bid-ask";
import { TradeCalmFields } from "@/components/trading/trade-calm-fields";
import { TradeOpenOrders } from "@/components/trading/trade-open-orders";
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
  bid = null,
  ask = null,
  aiDraft = null,
  onDismissAiDraft,
  onCashBalance,
  onOpenCalm,
  onOpenAi,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  bid?: number | null;
  ask?: number | null;
  aiDraft?: TradeAiDraft | null;
  onDismissAiDraft?: () => void;
  onCashBalance?: (cash: number | null) => void;
  onOpenCalm?: () => void;
  onOpenAi?: () => void;
}) {
  const t = useTranslations("trading");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [invalidationPrice, setInvalidationPrice] = useState("");
  const [emotionTags, setEmotionTags] = useState<EmotionTagId[]>([]);
  const [strategyId, setStrategyId] = useState<string>("");
  const [strategies, setStrategies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<ToastTone>("neutral");
  const [msgKey, setMsgKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [a, p, o, st] = await Promise.all([
        fetch("/api/trading/account"),
        fetch("/api/trading/positions"),
        fetch(
          `/api/trading/orders?symbol=${symbol}&assetType=${assetType}&status=pending`,
        ),
        fetch("/api/strategies?mine=1").catch(() => null),
      ]);
      if (a.ok) {
        const aj = await a.json();
        setAccount(aj.account);
        onCashBalance?.(aj.account?.cashBalance ?? null);
      }
      if (p.ok) {
        const pj = await p.json();
        const pos = (pj.positions ?? []).find(
          (x: { symbol: string; assetType: string }) =>
            x.symbol === symbol && x.assetType === assetType,
        );
        setPosition(pos ? { qty: pos.qty, avgCost: pos.avgCost } : null);
      }
      if (o.ok) {
        const oj = await o.json();
        setOrders(oj.orders ?? []);
      }
      if (st && st.ok) {
        const sj = await st.json();
        setStrategies(
          (sj.strategies ?? []).map((x: { id: string; name: string }) => ({
            id: x.id,
            name: x.name,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user, symbol, assetType, onCashBalance]);

  useEffect(() => {
    void load();
  }, [load]);

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
    if (!session?.user) {
      showToast(t("loginRequired"), "neutral");
      return;
    }
    setBusy(true);
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

      const res = await fetch("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || t("orderFailed"), "error");
        return;
      }
      showToast(
        data.order?.status === "filled" ? t("orderFilled") : t("orderPending"),
        "success",
      );
      setEmotionTags([]);
      onDismissAiDraft?.();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/trading/orders?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  // Match SSR (session status is "loading") on the first client paint.
  if (!mounted || status === "loading") {
    return (
      <div className="p-4 text-sm text-[var(--muted)]">{t("loading")}</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-3 p-3">
        <p className="aw-caption-strong">{t("title")}</p>
        <p className="aw-caption">{t("loginRequired")}</p>
        <Link href="/login" className="aw-btn-pill inline-flex">
          {t("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <TopToast
        key={msgKey}
        message={msg}
        tone={msgTone}
        onDismiss={() => setMsg(null)}
      />
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <p className="aw-caption-strong">{t("title")}</p>
          <span className="aw-caption">{t("paperBadge")}</span>
        </div>
        {loading ? <span className="aw-caption">{t("loading")}</span> : null}
      </div>

      <TradeAccountStrip
        positionQty={position ? position.qty : 0}
        avgCost={position ? position.avgCost : null}
      />

      <SegmentedControl
        value={side}
        onChange={setSide}
        className="aw-side-seg border-b border-[var(--border)]"
        buttonClassName="flex-1"
        options={[
          {
            value: "buy",
            label: t("buy"),
            indicatorClassName:
              "bg-[color-mix(in_srgb,var(--up)_14%,transparent)]",
            activeTextClassName: "text-[var(--up)] font-semibold",
          },
          {
            value: "sell",
            label: t("sell"),
            indicatorClassName:
              "bg-[color-mix(in_srgb,var(--down)_14%,transparent)]",
            activeTextClassName: "text-[var(--down)] font-semibold",
          },
        ]}
      />

      <form onSubmit={onSubmit} className="space-y-2.5">
        <div>
          <label className="aw-metric-label mb-1 block">{t("orderType")}</label>
          <QtSelect
            value={orderType}
            onChange={(v) => setOrderType(v as OrderType)}
            options={[
              { value: "market", label: t("market") },
              { value: "limit", label: t("limit") },
              { value: "stop", label: t("stop") },
            ]}
          />
        </div>

        <div>
          <label className="aw-metric-label mb-1 block">{t("qty")}</label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="qt-input w-full px-2.5 py-2 tabular-nums"
          />
        </div>

        <TradeBidAsk
          bid={bid}
          ask={ask}
          lastPrice={lastPrice}
          onPick={(p) => {
            setLimitPrice(String(Number(p.toFixed(4))));
            setOrderType("limit");
          }}
        />

        {orderType === "limit" && (
          <div>
            <label className="aw-metric-label mb-1 block">{t("limitPrice")}</label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="qt-input w-full px-2.5 py-2 tabular-nums"
            />
          </div>
        )}

        {orderType === "stop" && (
          <div>
            <label className="aw-metric-label mb-1 block">{t("stopPrice")}</label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="qt-input w-full px-2.5 py-2 tabular-nums"
            />
          </div>
        )}

        <div className="flex items-baseline justify-between gap-2 border-t border-[var(--border)] pt-2">
          <span className="aw-metric-label">{t("estimate")}</span>
          <span className="aw-metric-value">${fmtMoney(estimate)}</span>
        </div>

        {aiDraft ? (
          <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2 text-[12px] text-[var(--brand-text)]">
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
          onStrategyId={setStrategyId}
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

        <SubmitButton
          type="submit"
          loading={busy}
          loadingLabel={t("loading")}
          disabled={!(qtyNum > 0)}
          className={`w-full !rounded-full !border-0 py-2.5 text-[14px] font-semibold !text-white hover:!opacity-100 ${
            side === "buy"
              ? "!bg-[var(--up)] hover:!brightness-110 hover:!bg-[var(--up)]"
              : "!bg-[var(--down)] hover:!brightness-110 hover:!bg-[var(--down)]"
          }`}
        >
          {side === "buy" ? t("submitBuy") : t("submitSell")}
        </SubmitButton>
      </form>

      <TradeOpenOrders
        orders={orders}
        busy={busy}
        onCancel={(id) => void cancel(id)}
      />
    </div>
  );
}
