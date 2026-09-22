"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { AssetType } from "@/lib/types";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

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
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TradePanel({
  symbol,
  assetType,
  lastPrice,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
}) {
  const t = useTranslations("trading");
  const { data: session, status } = useSession();
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [a, p, o] = await Promise.all([
        fetch("/api/trading/account"),
        fetch("/api/trading/positions"),
        fetch(
          `/api/trading/orders?symbol=${symbol}&assetType=${assetType}&status=pending`,
        ),
      ]);
      if (a.ok) {
        const aj = await a.json();
        setAccount(aj.account);
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
    } finally {
      setLoading(false);
    }
  }, [session?.user, symbol, assetType]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (lastPrice && lastPrice > 0) {
      setLimitPrice((prev) => prev || String(Number(lastPrice.toFixed(4))));
      setStopPrice((prev) => prev || String(Number(lastPrice.toFixed(4))));
    }
  }, [lastPrice]);

  const qtyNum = Number(qty) || 0;
  const estimatePrice = useMemo(() => {
    if (orderType === "limit") return Number(limitPrice) || lastPrice || 0;
    if (orderType === "stop") return Number(stopPrice) || lastPrice || 0;
    return lastPrice || 0;
  }, [orderType, limitPrice, stopPrice, lastPrice]);

  const estimate = qtyNum > 0 && estimatePrice > 0 ? qtyNum * estimatePrice : 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!session?.user) {
      setMsg(t("loginRequired"));
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        symbol,
        assetType,
        side,
        type: orderType,
        qty: qtyNum,
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
        setMsg(data.error || t("orderFailed"));
        return;
      }
      setMsg(
        data.order?.status === "filled" ? t("orderFilled") : t("orderPending"),
      );
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

  if (status === "loading") {
    return (
      <div className="qt-panel p-4 text-sm text-[var(--muted)]">{t("loading")}</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="qt-panel space-y-3 p-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted)]">
          {t("title")}
        </h2>
        <p className="text-sm text-[var(--muted)]">{t("loginRequired")}</p>
        <Link href="/login" className="qt-btn qt-btn-primary inline-flex px-3 py-1.5 text-sm">
          {t("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="qt-panel space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted)]">
          {t("title")}
        </h2>
        {loading && (
          <span className="text-[11px] text-[var(--muted)]">{t("loading")}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3 py-2">
          <div className="text-[11px] text-[var(--muted)]">{t("cash")}</div>
          <div className="mt-0.5 font-semibold tabular-nums">
            ${fmtMoney(account?.cashBalance ?? 0)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3 py-2">
          <div className="text-[11px] text-[var(--muted)]">{t("position")}</div>
          <div className="mt-0.5 font-semibold tabular-nums">
            {position ? position.qty : 0}
          </div>
          {position && (
            <div className="text-[11px] text-[var(--muted)] tabular-nums">
              {t("avgCost")} ${fmtMoney(position.avgCost)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface-2)] p-1">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`rounded-lg py-2 text-sm font-semibold ${
              side === s
                ? s === "buy"
                  ? "bg-[var(--up)] text-white"
                  : "bg-[var(--down)] text-white"
                : "text-[var(--muted)]"
            }`}
          >
            {t(s)}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] text-[var(--muted)]">
            {t("orderType")}
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="qt-input w-full px-2 py-2 text-sm"
          >
            <option value="market">{t("market")}</option>
            <option value="limit">{t("limit")}</option>
            <option value="stop">{t("stop")}</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-[var(--muted)]">
            {t("qty")}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="qt-input w-full px-2 py-2 text-sm tabular-nums"
          />
        </div>

        {orderType === "limit" && (
          <div>
            <label className="mb-1 block text-[11px] text-[var(--muted)]">
              {t("limitPrice")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="qt-input w-full px-2 py-2 text-sm tabular-nums"
            />
          </div>
        )}

        {orderType === "stop" && (
          <div>
            <label className="mb-1 block text-[11px] text-[var(--muted)]">
              {t("stopPrice")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="qt-input w-full px-2 py-2 text-sm tabular-nums"
            />
          </div>
        )}

        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>{t("estimate")}</span>
          <span className="tabular-nums font-medium text-[var(--foreground)]">
            ${fmtMoney(estimate)}
          </span>
        </div>

        <button
          type="submit"
          disabled={busy || !(qtyNum > 0)}
          className={`qt-btn w-full py-2.5 text-sm font-semibold disabled:opacity-50 ${
            side === "buy"
              ? "bg-[var(--up)] text-white hover:opacity-90"
              : "bg-[var(--down)] text-white hover:opacity-90"
          }`}
        >
          {busy ? t("loading") : side === "buy" ? t("submitBuy") : t("submitSell")}
        </button>

        {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
      </form>

      {orders.length > 0 && (
        <div className="border-t border-[var(--border)] pt-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            {t("openOrders")}
          </h3>
          <ul className="space-y-2 text-xs">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-start justify-between gap-2 border-b border-[var(--border)]/60 pb-2 last:border-0"
              >
                <div>
                  <div className="font-medium">
                    {t(o.side)} · {t(o.type)} · {o.qty}
                  </div>
                  <div className="text-[var(--muted)] tabular-nums">
                    {o.type === "limit" && o.limitPrice != null
                      ? `@ ${fmtMoney(o.limitPrice)}`
                      : o.type === "stop" && o.stopPrice != null
                        ? `stop ${fmtMoney(o.stopPrice)}`
                        : ""}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cancel(o.id)}
                  className="shrink-0 text-[var(--brand-text)] hover:underline disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
