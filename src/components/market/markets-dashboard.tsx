"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import { CryptoPopularTable } from "@/components/market/crypto-popular-table";
import { IndustryHeatmap } from "@/components/market/industry-heatmap";
import { MarketsAsidePanels } from "@/components/market/markets-aside-panels";
import { MarketsHeaderToolbar } from "@/components/market/markets-header-toolbar";
import { MarketsKpiStrip } from "@/components/market/markets-kpi-strip";
import { RankBoardPanel } from "@/components/market/rank-board-panel";
import type { RankQuote } from "@/components/market/markets-types";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useAlerts } from "@/hooks/query/use-alerts";
import {
  useMarketBoards,
  useMarketNews,
  useMarketSentiment,
} from "@/hooks/query/use-market";
import { useSymbolSearch } from "@/hooks/query/use-symbol-search";
import { formatTime } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";

type Tab = AssetType;
type Board = "hot" | "gainers" | "losers";

type Boards = Record<Board, RankQuote[]>;

const EMPTY_BOARDS: Boards = { hot: [], gainers: [], losers: [] };

function boardsHaveData(boards: Boards, assetType: Tab): boolean {
  if (assetType === "crypto") return boards.hot.length > 0;
  return (
    boards.hot.length > 0 ||
    boards.gainers.length > 0 ||
    boards.losers.length > 0
  );
}

export default function MarketsDashboard() {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list");
  const initialTab: Tab =
    listParam === "crypto"
      ? "crypto"
      : listParam === "hk"
        ? "hk"
        : listParam === "cn"
          ? "cn"
          : "stock";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("success");
  const [toastKey, setToastKey] = useState(0);

  const signedIn = Boolean(session?.user);
  const loginModal = useLoginModalOptional();

  const boardsQuery = useMarketBoards(tab, {
    refetchInterval: (query) => {
      const data = query.state.data?.boards;
      if (!data) return 45_000;
      const boards: Boards = {
        hot: data.hot ?? [],
        gainers: data.gainers ?? [],
        losers: data.losers ?? [],
      };
      return boardsHaveData(boards, tab) ? false : 45_000;
    },
  });
  const newsQuery = useMarketNews(tab, tab !== "cn");
  const sentimentQuery = useMarketSentiment(
    tab,
    tab !== "hk" && tab !== "cn",
  );
  const alertsQuery = useAlerts({ enabled: true });
  const watchlistQuery = useWatchlist({ enabled: signedIn });
  const addWatch = useAddWatchlistItem();
  const removeWatch = useRemoveWatchlistItem();
  const searchQuery = useSymbolSearch(debouncedQ, tab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(handle);
  }, [q]);

  const boards: Boards = useMemo(() => {
    const raw = boardsQuery.data?.boards;
    if (!raw) return EMPTY_BOARDS;
    return {
      hot: raw.hot ?? [],
      gainers: raw.gainers ?? [],
      losers: raw.losers ?? [],
    };
  }, [boardsQuery.data]);

  const watched = useMemo(() => {
    if (!signedIn) return new Set<string>();
    return new Set(
      (watchlistQuery.data?.items ?? []).map(
        (i) => `${i.assetType}:${i.symbol}`,
      ),
    );
  }, [signedIn, watchlistQuery.data]);

  const results = !q.trim() ? [] : (searchQuery.data?.results ?? []);
  const news = (newsQuery.data?.news ?? []).slice(0, 4);
  const sentiment = sentimentQuery.data?.market ?? null;
  const alertCount = (alertsQuery.data?.alerts ?? []).filter(
    (a) => a.status === "active",
  ).length;

  const loading = boardsQuery.isLoading && !boardsQuery.data;
  const error =
    boardsQuery.error instanceof Error
      ? boardsQuery.error.message
      : boardsQuery.error
        ? tCommon("error")
        : null;
  const updatedAt = boardsQuery.dataUpdatedAt
    ? new Date(boardsQuery.dataUpdatedAt)
    : null;

  async function toggleWatch(symbol: string, assetType: AssetType) {
    if (!signedIn) {
      loginModal?.openLogin();
      return;
    }
    const key = `${assetType}:${symbol}`;
    try {
      if (watched.has(key)) {
        await removeWatch.mutateAsync({ symbol, assetType });
        setToastTone("success");
        setToastMsg(tCommon("watchRemoved"));
        setToastKey((k) => k + 1);
      } else {
        await addWatch.mutateAsync({ symbol, assetType });
        setToastTone("success");
        setToastMsg(tCommon("watchAdded"));
        setToastKey((k) => k + 1);
      }
    } catch {
      setToastTone("error");
      setToastMsg(tCommon("error"));
      setToastKey((k) => k + 1);
    }
  }

  const kpiQuotes = boards.hot;
  const avgChange = useMemo(() => {
    if (!kpiQuotes.length) return 0;
    return (
      kpiQuotes.reduce((s, item) => s + (item.percentChange || 0), 0) /
      kpiQuotes.length
    );
  }, [kpiQuotes]);

  const topPerformer = useMemo(() => {
    if (tab === "crypto") {
      if (!boards.hot.length) return null;
      return [...boards.hot].sort(
        (a, b) => b.percentChange - a.percentChange,
      )[0];
    }
    if (!boards.gainers.length) return null;
    return boards.gainers[0];
  }, [boards.gainers, boards.hot, tab]);

  const boardMeta: { key: Board; title: string }[] = [
    { key: "hot", title: t("rankHot") },
    { key: "gainers", title: t("gainers") },
    { key: "losers", title: t("losers") },
  ];

  const sectionTitle = tab === "crypto" ? t("popular") : t("rankBoards");

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <TopToast
        key={toastKey}
        message={toastMsg}
        tone={toastTone}
        onDismiss={() => setToastMsg(null)}
      />
      <MarketsHeaderToolbar
        tab={tab}
        q={q}
        results={results}
        onTabChange={setTab}
        onQueryChange={setQ}
      />

      <MarketsKpiStrip
        items={[
          {
            key: "tickers",
            label: t("kpiTickers"),
            value: String(kpiQuotes.length || 0),
          },
          {
            key: "avg",
            label: t("kpiAvgChange"),
            value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`,
            valueClass:
              avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]",
          },
          {
            key: "top",
            label: t("kpiTop"),
            value: topPerformer
              ? `${topPerformer.symbol} ${topPerformer.percentChange >= 0 ? "+" : ""}${topPerformer.percentChange.toFixed(1)}%`
              : "-",
            valueClass: "text-[var(--brand-text)]",
          },
          {
            key: "alerts",
            label: t("kpiAlerts"),
            value: String(alertCount),
            hint: t("kpiAlertsValue"),
            hintDot: alertCount > 0,
          },
        ]}
      />

      {tab !== "crypto" && <IndustryHeatmap assetType={tab} />}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            {sectionTitle}
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {loading
              ? tCommon("loading")
              : updatedAt
                ? `${t("updated")} ${formatTime(updatedAt)}`
                : ""}
          </span>
        </div>

        {error && (
          <div className="qt-panel space-y-2 p-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost px-3 py-1.5"
              onClick={() => void boardsQuery.refetch()}
            >
              {tCommon("retry")}
            </button>
          </div>
        )}

        {!error &&
          (tab === "crypto" ? (
            <CryptoPopularTable
              items={boards.hot}
              loading={loading}
              watched={watched}
              onToggleWatch={toggleWatch}
              t={t}
            />
          ) : (
            <div className="qt-panel grid divide-y divide-[var(--border)] overflow-hidden xl:grid-cols-3 xl:divide-x xl:divide-y-0">
              {boardMeta.map(({ key, title }) => (
                <RankBoardPanel
                  key={key}
                  title={title}
                  items={boards[key]}
                  loading={loading}
                  watched={watched}
                  onToggleWatch={toggleWatch}
                  t={t}
                  framed={false}
                />
              ))}
            </div>
          ))}
      </section>

      {tab !== "cn" && (
        <MarketsAsidePanels tab={tab} news={news} sentiment={sentiment} />
      )}
    </div>
  );
}
