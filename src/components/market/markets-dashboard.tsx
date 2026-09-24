"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CryptoPopularTable } from "@/components/market/crypto-popular-table";
import { IndexStrip } from "@/components/market/index-strip";
import { IndustryHeatmap } from "@/components/market/industry-heatmap";
import { IpoPanel } from "@/components/market/ipo-panel";
import { KpiCard } from "@/components/market/kpi-card";
import { RankBoardPanel } from "@/components/market/rank-board-panel";
import type { IndexQuote, RankQuote } from "@/components/market/markets-types";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { AssetType } from "@/lib/types";

type Tab = AssetType;
type Board = "hot" | "gainers" | "losers";

type NewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

type Boards = Record<Board, RankQuote[]>;

const EMPTY_BOARDS: Boards = { hot: [], gainers: [], losers: [] };

export default function MarketsDashboard() {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list");
  const initialTab: Tab =
    listParam === "crypto" ? "crypto" : listParam === "hk" ? "hk" : "stock";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState("");
  const [boards, setBoards] = useState<Boards>(EMPTY_BOARDS);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<
    { symbol: string; description: string; assetType: AssetType }[]
  >([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [sentiment, setSentiment] = useState<{
    buzz_score?: number;
    sentiment_score?: number;
    bullish_pct?: number;
    bearish_pct?: number;
    trend?: string | null;
    available?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!session?.user) {
      setWatched(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setWatched(
        new Set(
          (data.items ?? []).map(
            (i: { symbol: string; assetType: string }) =>
              `${i.assetType}:${i.symbol}`,
          ),
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function toggleWatch(symbol: string, assetType: AssetType) {
    if (!session?.user) return;
    const key = `${assetType}:${symbol}`;
    const isOn = watched.has(key);
    if (isOn) {
      await fetch(`/api/watchlist?symbol=${symbol}&assetType=${assetType}`, {
        method: "DELETE",
      });
      setWatched((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType }),
      });
      if (res.ok) {
        setWatched((prev) => new Set(prev).add(key));
      }
    }
  }

  const loadBoards = useCallback(
    async (assetType: Tab, silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
        setBoards(EMPTY_BOARDS);
        if (assetType !== "crypto") setIndices([]);
      }
      try {
        const quoteUrl =
          assetType === "crypto"
            ? `/api/quotes?popular=1&assetType=crypto`
            : `/api/ranks?assetType=${assetType}&board=all&limit=7`;
        const indexPromise =
          assetType === "crypto"
            ? Promise.resolve(null)
            : fetch(`/api/indices?assetType=${assetType}`).catch(() => null);
        const [qr, sr, nr, ar, ir] = await Promise.all([
          fetch(quoteUrl),
          assetType === "hk"
            ? Promise.resolve(null)
            : fetch(`/api/sentiment?assetType=${assetType}`),
          fetch(`/api/news?assetType=${assetType}`),
          fetch("/api/alerts").catch(() => null),
          indexPromise,
        ]);
        const qj = await qr.json();
        const sj = sr ? await sr.json() : null;
        const nj = await nr.json();
        if (!qr.ok) throw new Error(qj.error || "quotes failed");
        if (assetType === "crypto") {
          const quotes = (qj.quotes ?? []) as RankQuote[];
          setBoards({ hot: quotes, gainers: [], losers: [] });
          setIndices([]);
        } else {
          setBoards({
            hot: qj.boards?.hot ?? [],
            gainers: qj.boards?.gainers ?? [],
            losers: qj.boards?.losers ?? [],
          });
          if (ir && ir.ok) {
            const ij = await ir.json();
            setIndices(ij.indices ?? []);
          }
        }
        setSentiment(assetType === "hk" ? null : (sj?.market ?? null));
        setNews((nj.news ?? []).slice(0, 4));
        setUpdatedAt(new Date());
        if (ar && ar.ok) {
          const aj = await ar.json();
          setAlertCount(
            (aj.alerts ?? []).filter(
              (a: { status: string }) => a.status === "active",
            ).length,
          );
        }
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : tCommon("error"));
          setBoards(EMPTY_BOARDS);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tCommon],
  );

  useEffect(() => {
    void loadBoards(tab);
    const timer = setInterval(() => void loadBoards(tab, true), 45000);
    return () => clearInterval(timer);
  }, [tab, loadBoards]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&assetType=${tab}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, tab]);

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
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {tab === "crypto"
              ? t("titleCrypto")
              : tab === "hk"
                ? t("titleHk")
                : t("titleStock")}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {tab === "crypto"
              ? t("descCrypto")
              : tab === "hk"
                ? t("descHk")
                : t("descStock")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={tab}
            onChange={(key) => {
              setTab(key);
              setQ("");
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1"
            buttonClassName="px-3 py-1.5 text-xs font-semibold sm:text-sm"
            options={[
              { value: "stock", label: t("stocks") },
              { value: "hk", label: t("hk") },
              { value: "crypto", label: t("crypto") },
            ]}
          />

          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="qt-input w-full px-3 py-2.5 text-sm"
            />
            {results.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
                {results.map((r) => (
                  <li key={`${r.assetType}-${r.symbol}`}>
                    <Link
                      href={`/symbol/${r.assetType}/${r.symbol}`}
                      className="block px-3 py-2.5 text-sm hover:bg-[var(--sidebar-hover)]"
                      onClick={() => setQ("")}
                    >
                      <span className="font-semibold">{r.symbol}</span>
                      <span className="ml-2 text-[var(--muted)]">
                        {r.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link href="/alerts" className="qt-btn qt-btn-primary h-10 px-3 text-sm">
            + {t("create")}
          </Link>
        </div>
      </section>

      {tab !== "crypto" && (
        <IndexStrip indices={indices} loading={loading} t={t} />
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("kpiTickers")}
          value={String(kpiQuotes.length || 0)}
          hint={`${kpiQuotes.length ? `+${Math.min(3, kpiQuotes.length)}` : "0"} ${t("today")}`}
          hintClass="text-[var(--up)]"
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
          value={`${alertCount} ${t("kpiAlertsValue")}`}
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
                ? `${t("updated")} ${updatedAt.toLocaleTimeString()}`
                : ""}
          </span>
        </div>

        {error && (
          <div className="qt-panel space-y-2 p-4 text-sm">
            <p className="text-[var(--down)]">{error}</p>
            <button
              type="button"
              className="qt-btn qt-btn-ghost px-3 py-1.5"
              onClick={() => void loadBoards(tab)}
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

      <section className="grid items-stretch gap-4 lg:grid-cols-2">
        <div className="qt-panel flex h-full flex-col p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t("narrative")}</h2>
            <span className="text-xs text-[var(--brand-text)]">{t("viewAll")}</span>
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
                      <span>
                        {Math.max(
                          1,
                          Math.round((Date.now() / 1000 - n.datetime) / 60),
                        )}
                        m
                      </span>
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
    </div>
  );
}
