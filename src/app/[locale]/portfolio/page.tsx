"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Quote } from "@/lib/types";
import { PortfolioPaperSection } from "@/components/portfolio/portfolio-paper-section";
import { PortfolioHoldingsTable } from "@/components/portfolio/portfolio-holdings-table";
import { PortfolioAside } from "@/components/portfolio/portfolio-aside";
import type {
  MarketSentiment,
  PaperOrder,
  PaperPosition,
  PortfolioNewsItem,
  PortfolioRow,
} from "@/components/portfolio/types";

export default function PortfolioPage() {
  const t = useTranslations("portfolio");
  const tMarket = useTranslations("market");
  const tAlerts = useTranslations("alerts");
  const tCommon = useTranslations("common");
  const tTrade = useTranslations("trading");
  const tNav = useTranslations("nav");
  const { data: session, status } = useSession();

  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [alertActive, setAlertActive] = useState(0);
  const [alertTriggered, setAlertTriggered] = useState(0);
  const [news, setNews] = useState<PortfolioNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [cash, setCash] = useState(0);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PaperOrder[]>([]);
  const [fills, setFills] = useState<PaperOrder[]>([]);
  const [tradeMsg, setTradeMsg] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, a, s, n, acc, pos, pend, filled] = await Promise.all([
        fetch("/api/watchlist?quotes=1"),
        fetch("/api/alerts"),
        fetch("/api/sentiment?assetType=stock"),
        fetch("/api/news?assetType=stock"),
        fetch("/api/trading/account"),
        fetch("/api/trading/positions?quotes=1"),
        fetch("/api/trading/orders?status=pending"),
        fetch("/api/trading/orders?status=filled"),
      ]);
      if (w.ok) {
        const wj = await w.json();
        setRows(wj.items ?? []);
      }
      if (a.ok) {
        const aj = await a.json();
        const alerts = aj.alerts ?? [];
        setAlertActive(alerts.filter((x: { status: string }) => x.status === "active").length);
        setAlertTriggered(
          alerts.filter((x: { status: string }) => x.status === "triggered").length,
        );
      }
      if (s.ok) {
        const sj = await s.json();
        setSentiment(sj.market ?? null);
      }
      if (n.ok) {
        const nj = await n.json();
        setNews((nj.news ?? []).slice(0, 3));
      }
      if (acc.ok) {
        const aj = await acc.json();
        setCash(aj.account?.cashBalance ?? 0);
      }
      if (pos.ok) {
        const pj = await pos.json();
        setPositions(pj.positions ?? []);
      }
      if (pend.ok) {
        const oj = await pend.json();
        setPendingOrders(oj.orders ?? []);
      }
      if (filled.ok) {
        const fj = await filled.json();
        setFills((fj.orders ?? []).slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => clearInterval(timer);
  }, [session, load]);

  const quotes = useMemo(
    () => rows.map((r) => r.quote).filter((q): q is Quote => Boolean(q)),
    [rows],
  );

  const avgChange = useMemo(() => {
    if (!quotes.length) return 0;
    return quotes.reduce((s, q) => s + q.percentChange, 0) / quotes.length;
  }, [quotes]);

  const top = useMemo(() => {
    if (!quotes.length) return null;
    return [...quotes].sort((a, b) => b.percentChange - a.percentChange)[0];
  }, [quotes]);

  const positionsValue = useMemo(
    () =>
      positions.reduce(
        (s, p) => s + (p.marketValue ?? p.qty * p.avgCost),
        0,
      ),
    [positions],
  );

  const equity = cash + positionsValue;

  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  async function seedPopular() {
    setSeeding(true);
    try {
      const popular = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN"];
      await Promise.all(
        popular.map((symbol) =>
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, assetType: "stock" }),
          }),
        ),
      );
      await load();
    } finally {
      setSeeding(false);
    }
  }

  async function resetAccount() {
    if (!window.confirm(tTrade("resetConfirm"))) return;
    setResetting(true);
    setTradeMsg(null);
    try {
      const res = await fetch("/api/trading/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        setTradeMsg(tTrade("resetDone"));
        await load();
      }
    } finally {
      setResetting(false);
    }
  }

  async function cancelOrder(id: string) {
    await fetch(`/api/trading/orders?id=${id}`, { method: "DELETE" });
    await load();
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{tAlerts("loginRequired")}</p>
        <Link href="/login" className="qt-btn qt-btn-primary mt-3 inline-flex px-3 py-1.5 text-sm">
          {tNav("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("desc")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/watchlist" className="qt-btn qt-btn-ghost h-10 px-3 text-sm">
            {t("openWatchlist")}
          </Link>
          <Link href="/alerts" className="qt-btn qt-btn-primary h-10 px-3 text-sm">
            + {tMarket("create")}
          </Link>
        </div>
      </section>

      <PortfolioPaperSection
        cash={cash}
        positionsValue={positionsValue}
        equity={equity}
        positions={positions}
        pendingOrders={pendingOrders}
        fills={fills}
        tradeMsg={tradeMsg}
        resetting={resetting}
        onReset={() => void resetAccount()}
        onCancelOrder={cancelOrder}
        labels={{
          accountTitle: tTrade("accountTitle"),
          accountDesc: tTrade("accountDesc"),
          reset: tTrade("reset"),
          loading: tTrade("loading"),
          cash: tTrade("cash"),
          marketValue: tTrade("marketValue"),
          equity: tTrade("equity"),
          positions: tTrade("positions"),
          emptyPositions: tTrade("emptyPositions"),
          symbol: tMarket("symbol"),
          qty: tTrade("qty"),
          avgCost: tTrade("avgCost"),
          price: tMarket("price"),
          pnl: tTrade("pnl"),
          pendingOrders: tTrade("pendingOrders"),
          emptyOrders: tTrade("emptyOrders"),
          recentFills: tTrade("recentFills"),
          emptyFills: tTrade("emptyFills"),
          cancel: tTrade("cancel"),
          side: (key) => tTrade(key),
          type: (key) => tTrade(key),
        }}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{t("watchlist")}</div>
          <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{tMarket("kpiAvgChange")}</div>
          <div
            className={`mt-2 text-2xl font-semibold ${
              avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
            }`}
          >
            {avgChange >= 0 ? "+" : ""}
            {avgChange.toFixed(2)}%
          </div>
        </div>
        <div className="qt-card p-4">
          <div className="text-xs text-[var(--muted)]">{tMarket("kpiTop")}</div>
          <div className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
            {top
              ? `${top.symbol} ${top.percentChange >= 0 ? "+" : ""}${top.percentChange.toFixed(1)}%`
              : "-"}
          </div>
        </div>
        <div className="qt-card p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>{t("activeAlerts")}</span>
            {alertActive > 0 && (
              <span className="h-2 w-2 rounded-full bg-[var(--down)] shadow-[0_0_8px_var(--down)]" />
            )}
          </div>
          <div className="text-2xl font-semibold">
            {alertActive}
            <span className="ml-2 text-sm font-normal text-[var(--muted)]">
              / {alertTriggered} {t("triggeredAlerts")}
            </span>
          </div>
        </div>
      </section>

      <PortfolioHoldingsTable
        rows={rows}
        loading={loading}
        seeding={seeding}
        onSeedPopular={() => void seedPopular()}
        labels={{
          holdings: t("holdings"),
          loading: tCommon("loading"),
          watchlistEmpty: tMarket("watchlistEmpty"),
          seedPopular: t("seedPopular"),
          symbol: tMarket("symbol"),
          price: tMarket("price"),
          change: tMarket("change"),
          last24h: tMarket("last24h"),
          actions: tMarket("actions"),
          buy: tMarket("buy"),
          sell: tMarket("sell"),
        }}
      />

      <PortfolioAside
        news={news}
        sentiment={sentiment}
        bullish={bullish}
        bearish={bearish}
        neutral={neutral}
        labels={{
          narrative: tMarket("narrative"),
          viewAll: tMarket("viewAll"),
          unavailable: tMarket("unavailable"),
          sentiment: tMarket("sentiment"),
          bullish: tMarket("bullish"),
          neutral: tMarket("neutral"),
          bearish: tMarket("bearish"),
          sentimentHint: tMarket("sentimentHint"),
        }}
      />
    </div>
  );
}
