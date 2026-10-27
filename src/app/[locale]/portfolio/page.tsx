"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import type { Quote } from "@/lib/types";
import { MarketsKpiStrip } from "@/components/market/markets-kpi-strip";
import { PortfolioPaperSection } from "@/components/portfolio/portfolio-paper-section";
import { PortfolioHoldingsTable } from "@/components/portfolio/portfolio-holdings-table";
import { PortfolioAside } from "@/components/portfolio/portfolio-aside";
import { useAlerts } from "@/hooks/query/use-alerts";
import { useMarketNews, useMarketSentiment } from "@/hooks/query/use-market";
import {
  useAddWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import {
  useCancelOrder,
  useResetPaperAccount,
  useTradingAccount,
  useTradingOrders,
  useTradingPositions,
} from "@/hooks/query/use-trading";
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
  const tCommon = useTranslations("common");
  const tTrade = useTranslations("trading");
  const { data: session, status } = useSession();

  const [tradeMsg, setTradeMsg] = useState<string | null>(null);
  const signedIn = Boolean(session?.user);
  const poll = signedIn ? 45_000 : false;

  const watchlist = useWatchlist({
    quotes: true,
    enabled: signedIn,
    refetchInterval: poll,
  });
  const alertsQuery = useAlerts({ enabled: signedIn, refetchInterval: poll });
  const sentimentQuery = useMarketSentiment("stock", signedIn);
  const newsQuery = useMarketNews("stock", signedIn);
  const accountQuery = useTradingAccount(signedIn);
  const positionsQuery = useTradingPositions({
    quotes: true,
    enabled: signedIn,
  });
  const pendingQuery = useTradingOrders({
    status: "pending",
    enabled: signedIn,
  });
  const fillsQuery = useTradingOrders({ status: "filled", enabled: signedIn });
  const addItem = useAddWatchlistItem();
  const cancelOrderMut = useCancelOrder();
  const resetAccountMut = useResetPaperAccount();

  const rows = (watchlist.data?.items ?? []) as PortfolioRow[];
  const alerts = alertsQuery.data?.alerts ?? [];
  const alertActive = alerts.filter((x) => x.status === "active").length;
  const alertTriggered = alerts.filter((x) => x.status === "triggered").length;
  const sentiment =
    ((sentimentQuery.data as { market?: MarketSentiment } | undefined)
      ?.market ?? null);
  const news = (
    ((newsQuery.data as { news?: PortfolioNewsItem[] } | undefined)?.news ??
      []) as PortfolioNewsItem[]
  ).slice(0, 3);
  const cash =
    (accountQuery.data as { account?: { cashBalance?: number } } | undefined)
      ?.account?.cashBalance ?? 0;
  const positions =
    ((positionsQuery.data as { positions?: PaperPosition[] } | undefined)
      ?.positions ?? []) as PaperPosition[];
  const pendingOrders =
    ((pendingQuery.data as { orders?: PaperOrder[] } | undefined)?.orders ??
      []) as PaperOrder[];
  const fills = (
    ((fillsQuery.data as { orders?: PaperOrder[] } | undefined)?.orders ??
      []) as PaperOrder[]
  ).slice(0, 10);
  const loading = watchlist.isLoading;
  const seeding = addItem.isPending;
  const resetting = resetAccountMut.isPending;

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
    const popular = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMZN"];
    await Promise.all(
      popular.map((symbol) =>
        addItem.mutateAsync({ symbol, assetType: "stock" }),
      ),
    );
  }

  async function resetAccount() {
    if (!window.confirm(tTrade("resetConfirm"))) return;
    setTradeMsg(null);
    try {
      await resetAccountMut.mutateAsync();
      setTradeMsg(tTrade("resetDone"));
    } catch {
      /* ignore */
    }
  }

  async function cancelOrder(id: string) {
    await cancelOrderMut.mutateAsync(id);
  }

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <AuthLoginGate
        title={t("loginTitle")}
        body={t("loginBody")}
        hint={t("loginHint")}
      />
    );
  }

  const headerBtn =
    "qt-btn inline-flex h-8 items-center justify-center px-3 text-[13px] font-medium leading-none";

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
            {t("desc")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/review" className={`${headerBtn} qt-btn-ghost`}>
            {t("openReview")}
          </Link>
          <Link href="/watchlist" className={`${headerBtn} qt-btn-ghost`}>
            {t("openWatchlist")}
          </Link>
          <Link href="/alerts" className={`${headerBtn} qt-btn-primary`}>
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
          riskSettings: tTrade("riskSettings"),
          loading: tTrade("loading"),
          cash: tTrade("cash"),
          marketValue: tTrade("marketValue"),
          equity: tTrade("equity"),
          positions: tTrade("positions"),
          chartPnl: tTrade("chartPnl"),
          chartAllocation: tTrade("chartAllocation"),
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

      <MarketsKpiStrip
        items={[
          {
            key: "watch",
            label: t("watchlist"),
            value: String(rows.length),
          },
          {
            key: "avg",
            label: tMarket("kpiAvgChange"),
            value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`,
            valueClass:
              avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]",
          },
          {
            key: "top",
            label: tMarket("kpiTop"),
            value: top
              ? `${top.symbol} ${top.percentChange >= 0 ? "+" : ""}${top.percentChange.toFixed(1)}%`
              : "—",
            valueClass: "text-[var(--brand-text)]",
          },
          {
            key: "alerts",
            label: t("activeAlerts"),
            value: `${alertActive} / ${alertTriggered}`,
            hint: t("triggeredAlerts"),
            hintDot: alertActive > 0,
          },
        ]}
      />

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
          view: tMarket("view"),
          alert: tMarket("alert"),
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
