"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { CryptoPopularTable } from "@/components/market/crypto-popular-table";
import { IndustryHeatmap } from "@/components/market/industry-heatmap";
import { IpoPanel } from "@/components/market/ipo-panel";
import { KpiCard } from "@/components/market/kpi-card";
import { MarketsHeaderToolbar } from "@/components/market/markets-header-toolbar";
import { RankBoardPanel } from "@/components/market/rank-board-panel";
import type { RankQuote } from "@/components/market/markets-types";
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

/** Client-only relative age — avoids Date.now() SSR/client hydration skew. */
function NewsAgeMinutes({ datetime }: { datetime: number }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const mins = Math.max(1, Math.round((Date.now() / 1000 - datetime) / 60));
    setLabel(`${mins}m`);
  }, [datetime]);
  if (!label) return null;
  return <span suppressHydrationWarning>{label}</span>;
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

  const signedIn = Boolean(session?.user);

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
    if (!signedIn) return;
    const key = `${assetType}:${symbol}`;
    if (watched.has(key)) {
      await removeWatch.mutateAsync({ symbol, assetType });
    } else {
      await addWatch.mutateAsync({ symbol, assetType });
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

  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  const boardMeta: { key: Board; title: string }[] = [
    { key: "hot", title: t("rankHot") },
    { key: "gainers", title: t("gainers") },
    { key: "losers", title: t("losers") },
  ];

  const sectionTitle = tab === "crypto" ? t("popular") : t("rankBoards");

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <MarketsHeaderToolbar
        tab={tab}
        q={q}
        results={results}
        onTabChange={setTab}
        onQueryChange={setQ}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("kpiTickers")}
          value={String(kpiQuotes.length || 0)}
        />
        <KpiCard
          label={t("kpiAvgChange")}
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          valueClass={avgChange >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}
        />
        <KpiCard
          label={t("kpiTop")}
          value={
            topPerformer
              ? `${topPerformer.symbol} ${topPerformer.percentChange >= 0 ? "+" : ""}${topPerformer.percentChange.toFixed(1)}%`
              : "-"
          }
          valueClass="text-[var(--brand-text)]"
        />
        <KpiCard
          label={t("kpiAlerts")}
          value={String(alertCount)}
          hint={t("kpiAlertsValue")}
          hintDot={alertCount > 0}
        />
      </section>

      {tab !== "crypto" && <IndustryHeatmap assetType={tab} />}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{sectionTitle}</h2>
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
            <div className="grid gap-3 xl:grid-cols-3">
              {boardMeta.map(({ key, title }) => (
                <RankBoardPanel
                  key={key}
                  title={title}
                  items={boards[key]}
                  loading={loading}
                  watched={watched}
                  onToggleWatch={toggleWatch}
                  t={t}
                />
              ))}
            </div>
          ))}
      </section>

      {tab !== "cn" && (
        <section className="grid items-stretch gap-4 lg:grid-cols-2">
          <div className="qt-panel flex h-full flex-col p-4">
            <div className="mb-3">
              <h2 className="font-semibold">{t("narrative")}</h2>
            </div>
            <ul className="space-y-3">
              {news.length === 0 && (
                <li className="text-sm text-[var(--muted)]">{t("unavailable")}</li>
              )}
              {news.map((n, i) => (
                <li
                  key={i}
                  className="flex gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                    {n.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                        NEWS
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                      <span>{n.category || n.source || "MARKET"}</span>
                      {n.datetime ? (
                        <NewsAgeMinutes datetime={n.datetime} />
                      ) : null}
                    </div>
                    <a
                      href={n.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="line-clamp-2 text-sm font-medium hover:text-[var(--brand-text)]"
                    >
                      {n.headline}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {tab === "hk" ? (
            <IpoPanel assetType="hk" />
          ) : (
            <div className="qt-panel flex h-full flex-col p-4">
              <h2 className="mb-4 font-semibold">{t("sentiment")}</h2>
              {sentiment?.available === false ? (
                <p className="text-sm text-[var(--muted)]">
                  {sentiment.message || t("unavailable")}
                </p>
              ) : (
                <>
                  <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="bg-[var(--up)]" style={{ width: `${bullish}%` }} />
                    <div
                      className="bg-[var(--muted)]"
                      style={{ width: `${neutral}%` }}
                    />
                    <div
                      className="bg-[var(--down)]"
                      style={{ width: `${bearish}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-semibold text-[var(--up)]">
                        {bullish.toFixed(0)}%
                      </div>
                      <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                        {t("bullish")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-[var(--muted)]">
                        {neutral.toFixed(0)}%
                      </div>
                      <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                        {t("neutral")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-[var(--down)]">
                        {bearish.toFixed(0)}%
                      </div>
                      <div className="text-xs tracking-wide text-[var(--muted)] uppercase">
                        {t("bearish")}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
                    {t("sentimentHint")}
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
