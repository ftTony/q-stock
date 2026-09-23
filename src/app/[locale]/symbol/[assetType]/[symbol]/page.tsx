"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  CandleChart,
  type IndicatorFlags,
} from "@/components/charts/candle-chart";
import {
  AiAnalysisPanel,
  type AiTrendAnalysis,
} from "@/components/market/ai-analysis-panel";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  EarningsPanel,
  type EarningsCalendarRow,
  type EarningsMetric,
  type EarningsSurprise,
} from "@/components/market/earnings-panel";
import { QuoteStatsPanel } from "@/components/market/quote-stats";
import { TradePanel } from "@/components/trading/trade-panel";
import { displayName } from "@/lib/market-names";
import type { AssetType, CandleResolution, OhlcvBar, Quote } from "@/lib/types";
import { parseAssetType } from "@/lib/types";
import { computeIndicators, type IndicatorBundle } from "@/lib/indicators";

type Tab = "news" | "earnings" | "press" | "comments" | "sentiment" | "ai";

export default function SymbolPage() {
  const params = useParams<{ assetType: string; symbol: string }>();
  const assetType = parseAssetType(params.assetType);
  const symbol = String(params.symbol || "").toUpperCase();
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tAlerts = useTranslations("alerts");
  const tEarnings = useTranslations("earnings");
  const { data: session } = useSession();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [bars, setBars] = useState<OhlcvBar[]>([]);
  const [indicators, setIndicators] = useState<IndicatorBundle | undefined>();
  const [resolution, setResolution] = useState<CandleResolution>("D");
  const [flags, setFlags] = useState<IndicatorFlags>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false,
    macd: false,
  });
  const [tab, setTab] = useState<Tab>("news");
  const [news, setNews] = useState<
    { headline: string; summary?: string; url?: string; datetime?: number; source?: string }[]
  >([]);
  const [earnings, setEarnings] = useState<EarningsSurprise[]>([]);
  const [earningsUpcoming, setEarningsUpcoming] = useState<EarningsCalendarRow[]>([]);
  const [earningsRecent, setEarningsRecent] = useState<EarningsCalendarRow[]>([]);
  const [earningsMetrics, setEarningsMetrics] = useState<EarningsMetric[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [press, setPress] = useState<
    { headline?: string; datetime?: string; url?: string; description?: string }[]
  >([]);
  const [comments, setComments] = useState<
    { id: string; content: string; author: string; userId: string; createdAt: string }[]
  >([]);
  const [commentText, setCommentText] = useState("");
  const [sentiment, setSentiment] = useState<{
    news?: Record<string, unknown>;
    reddit?: Record<string, unknown>;
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiTrendAnalysis | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiDisclaimer, setAiDisclaimer] = useState<string | null>(null);
  const [aiCached, setAiCached] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMoreCandles, setLoadingMoreCandles] = useState(false);
  const [hasMoreCandles, setHasMoreCandles] = useState(true);
  const loadMoreLock = useRef(false);
  const earningsLoadedRef = useRef(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadQuote = useCallback(async () => {
    const res = await fetch(`/api/quotes?symbol=${symbol}&assetType=${assetType}`);
    const data = await res.json();
    if (res.ok) {
      setQuote(data.quote);
      setUpdatedAt(new Date());
      setAlertPrice((prev) => {
        if (prev) return prev;
        const p = data.quote?.price;
        return p ? String(Number(p.toFixed(4))) : prev;
      });
    }
  }, [symbol, assetType]);

  /** Prefetch earnings for quote panel (stocks only); shared with earnings tab. */
  const loadEarningsMetrics = useCallback(async () => {
    if (assetType !== "stock") {
      setEarningsMetrics([]);
      earningsLoadedRef.current = false;
      return;
    }
    try {
      const res = await fetch(`/api/earnings?symbol=${symbol}`);
      const data = await res.json();
      if (!res.ok) return;
      setEarnings(data.surprises ?? data.earnings ?? []);
      setEarningsUpcoming(data.calendar?.upcoming ?? []);
      setEarningsRecent(data.calendar?.recent ?? []);
      setEarningsMetrics(data.metrics ?? []);
      earningsLoadedRef.current = true;
      if (data.degraded) setDegraded(true);
    } catch {
      /* optional for quote panel */
    }
  }, [symbol, assetType]);

  const loadCandles = useCallback(async () => {
    setLoadingChart(true);
    setHasMoreCandles(true);
    loadMoreLock.current = false;
    try {
      const res = await fetch(
        `/api/candles?symbol=${symbol}&assetType=${assetType}&resolution=${resolution}`,
      );
      const data = await res.json();
      if (res.ok) {
        const next = (data.bars ?? []) as OhlcvBar[];
        setBars(next);
        setIndicators(data.indicators);
        setHasMoreCandles(next.length > 0);
      }
    } finally {
      setLoadingChart(false);
    }
  }, [symbol, assetType, resolution]);

  const loadMoreCandles = useCallback(
    async (earliestTime: number): Promise<OhlcvBar[]> => {
      if (loadMoreLock.current || !hasMoreCandles || !earliestTime) return [];
      loadMoreLock.current = true;
      setLoadingMoreCandles(true);
      try {
        const chunkDays =
          resolution === "D" ? 280 : resolution === "Q" ? 1200 : 2500;
        const to = earliestTime - 86400;
        const from = to - chunkDays * 86400;
        if (to <= 0 || from >= to) {
          setHasMoreCandles(false);
          return [];
        }
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&resolution=${resolution}&from=${from}&to=${to}&indicators=0`,
        );
        const data = await res.json();
        if (!res.ok) {
          setHasMoreCandles(false);
          return [];
        }
        const older = (data.bars ?? []) as OhlcvBar[];
        if (!older.length) {
          setHasMoreCandles(false);
          return [];
        }
        setBars((prev) => {
          const byTime = new Map<number, OhlcvBar>();
          for (const b of older) byTime.set(b.time, b);
          for (const b of prev) byTime.set(b.time, b);
          const merged = [...byTime.values()].sort((a, b) => a.time - b.time);
          setIndicators(computeIndicators(merged));
          if (older.length < 5) setHasMoreCandles(false);
          return merged;
        });
        return older;
      } finally {
        setLoadingMoreCandles(false);
        setTimeout(() => {
          loadMoreLock.current = false;
        }, 400);
      }
    },
    [symbol, assetType, resolution, hasMoreCandles],
  );
  const loadTab = useCallback(async () => {
    setDegraded(false);
    if (tab === "news") {
      const res = await fetch(`/api/news?symbol=${symbol}&assetType=${assetType}`);
      const data = await res.json();
      setNews(data.news ?? []);
      if (!res.ok) setDegraded(true);
    } else if (tab === "earnings") {
      if (assetType !== "stock") {
        setEarnings([]);
        setEarningsUpcoming([]);
        setEarningsRecent([]);
        setEarningsMetrics([]);
        return;
      }
      if (earningsLoadedRef.current) return;
      setEarningsLoading(true);
      try {
        const res = await fetch(`/api/earnings?symbol=${symbol}`);
        const data = await res.json();
        setEarnings(data.surprises ?? data.earnings ?? []);
        setEarningsUpcoming(data.calendar?.upcoming ?? []);
        setEarningsRecent(data.calendar?.recent ?? []);
        setEarningsMetrics(data.metrics ?? []);
        earningsLoadedRef.current = true;
        if (data.degraded) setDegraded(true);
      } finally {
        setEarningsLoading(false);
      }
    } else if (tab === "press") {
      if (assetType !== "stock") {
        setPress([]);
        return;
      }
      const res = await fetch(`/api/press?symbol=${symbol}`);
      const data = await res.json();
      setPress(data.press ?? []);
      if (data.degraded) setDegraded(true);
    } else if (tab === "comments") {
      const res = await fetch(`/api/comments?symbol=${symbol}&assetType=${assetType}`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } else if (tab === "sentiment") {
      const res = await fetch(`/api/sentiment?symbol=${symbol}&assetType=${assetType}`);
      const data = await res.json();
      setSentiment(data.sentiment ?? null);
    } else if (tab === "ai") {
      setAiLoading(true);
      setAiAnalysis(null);
      setAiAvailable(null);
      setAiMessage(null);
      try {
        const res = await fetch(
          `/api/ai/analyze?symbol=${symbol}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        setAiAvailable(data.available !== false);
        setAiAnalysis(data.analysis ?? null);
        setAiMessage(data.message ?? data.error ?? null);
        setAiDisclaimer(data.disclaimer ?? null);
        setAiCached(Boolean(data.cached));
        if (data.degraded) setDegraded(true);
        if (!res.ok && data.available !== false) setDegraded(true);
      } finally {
        setAiLoading(false);
      }
    }
  }, [tab, symbol, assetType, locale]);

  useEffect(() => {
    setAlertPrice("");
    setAlertMsg(null);
    setQuote(null);
    setEarnings([]);
    setEarningsUpcoming([]);
    setEarningsRecent([]);
    setEarningsMetrics([]);
    earningsLoadedRef.current = false;
  }, [symbol, assetType]);

  useEffect(() => {
    void loadQuote();
    const timer = setInterval(() => void loadQuote(), 20000);
    return () => clearInterval(timer);
  }, [loadQuote]);

  useEffect(() => {
    void loadEarningsMetrics();
  }, [loadEarningsMetrics]);

  useEffect(() => {
    void loadCandles();
  }, [loadCandles]);

  useEffect(() => {
    void loadTab();
  }, [loadTab]);

  useEffect(() => {
    if (!session?.user) {
      setInWatchlist(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const found = (data.items ?? []).some(
        (i: { symbol: string; assetType: string }) =>
          i.symbol === symbol && i.assetType === assetType,
      );
      setInWatchlist(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, symbol, assetType]);

  const tabs = useMemo(
    () =>
      [
        { id: "news" as const, label: t("news") },
        { id: "earnings" as const, label: t("earnings") },
        { id: "press" as const, label: t("press") },
        { id: "comments" as const, label: t("comments") },
        { id: "sentiment" as const, label: t("sentiment") },
        { id: "ai" as const, label: t("ai") },
      ] as const,
    [t],
  );

  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, assetType, content: commentText }),
    });
    if (res.ok) {
      setCommentText("");
      await loadTab();
    }
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    await loadTab();
  }

  async function createAlert(e: FormEvent) {
    e.preventDefault();
    setAlertMsg(null);
    if (!session?.user) {
      setAlertMsg(tAlerts("loginRequired"));
      return;
    }
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        assetType,
        condition: alertCondition,
        triggerPrice: Number(alertPrice),
      }),
    });
    if (!res.ok) {
      setAlertMsg(tCommon("error"));
      return;
    }
    setAlertMsg("OK");
    setAlertPrice("");
  }

  async function toggleWatchlist() {
    if (!session?.user) {
      setAlertMsg(tAlerts("loginRequired"));
      return;
    }
    setWatchBusy(true);
    try {
      if (inWatchlist) {
        await fetch(
          `/api/watchlist?symbol=${symbol}&assetType=${assetType}`,
          { method: "DELETE" },
        );
        setInWatchlist(false);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, assetType }),
        });
        if (res.ok) setInWatchlist(true);
      }
    } finally {
      setWatchBusy(false);
    }
  }

  return (
    <div className="space-y-4 animate-[qtFade_0.45s_ease]">
      <div className="qt-panel flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <div className="text-xs text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--brand-text)]">
              ← Markets
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {symbol}{" "}
            <span className="text-sm font-normal text-[var(--muted)]">
              {displayName(symbol, assetType)}
            </span>
          </h1>
          {quote && (
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold">
                <PriceText value={quote.price} change={quote.change} />
              </span>
              <ChangePct value={quote.percentChange} />
              {updatedAt && (
                <span className="text-xs text-[var(--muted)]">
                  {updatedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
        {quote && (
          <div className="flex flex-col items-end gap-3">
            <QuoteStatsPanel quote={quote} metrics={earningsMetrics} />
            <button
              type="button"
              disabled={watchBusy}
              onClick={() => void toggleWatchlist()}
              className={`qt-btn px-3 py-1.5 text-xs ${
                inWatchlist
                  ? "qt-btn-ghost text-[var(--brand-text)]"
                  : "qt-btn-primary"
              }`}
            >
              {inWatchlist ? t("inWatchlist") : t("addWatchlist")}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4 min-w-0 lg:col-start-1">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["D", t("day")],
                ["Q", t("quarter")],
                ["Y", t("year")],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setResolution(key)}
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  resolution === key
                    ? "bg-[var(--brand)] text-[#0b1220] font-semibold"
                    : "qt-btn-ghost border border-[var(--border)] bg-[var(--panel)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="self-center text-[var(--muted)]">{t("indicators")}:</span>
            {(
              [
                ["ma", "MA"],
                ["ema", "EMA"],
                ["boll", "BOLL"],
                ["rsi", "RSI"],
                ["macd", "MACD"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFlags((f) => ({ ...f, [key]: !f[key] }))}
                className={`rounded-full border px-2.5 py-1 ${
                  flags[key]
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loadingChart ? (
            <div className="qt-panel flex h-[360px] items-center justify-center text-sm text-[var(--muted)] sm:h-[440px]">
              {tCommon("loading")}
            </div>
          ) : (
            <CandleChart
              bars={bars}
              flags={flags}
              resetKey={`${assetType}:${symbol}:${resolution}`}
              resolution={resolution}
              symbol={symbol}
              onLoadMore={loadMoreCandles}
              loadingMore={loadingMoreCandles}
              hasMore={hasMoreCandles}
            />
          )}
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:sticky lg:top-20">
          <TradePanel
            symbol={symbol}
            assetType={assetType}
            lastPrice={quote?.price ?? null}
          />
        </aside>

        <div className="space-y-4 min-w-0 lg:col-start-1">
          <form
            onSubmit={createAlert}
            className="qt-panel flex flex-wrap items-end gap-2 p-4"
          >
            <div className="text-sm font-medium">{t("setAlert")}</div>
            <select
              value={alertCondition}
              onChange={(e) => setAlertCondition(e.target.value as "gte" | "lte")}
              className="qt-input px-2 py-1.5 text-sm"
            >
              <option value="gte">{tAlerts("gte")}</option>
              <option value="lte">{tAlerts("lte")}</option>
            </select>
            <input
              type="number"
              step="any"
              required
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              placeholder={tAlerts("triggerPrice")}
              className="qt-input w-32 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="qt-btn qt-btn-primary px-3 py-1.5 text-sm"
            >
              {tAlerts("create")}
            </button>
            {alertMsg && (
              <span className="text-xs text-[var(--muted)]">{alertMsg}</span>
            )}
          </form>

          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-1 border-b border-[var(--border)]">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`px-3 py-2 text-sm ${
                    tab === item.id
                      ? "border-b-2 border-[var(--brand)] font-medium text-[var(--foreground)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {degraded && (
            <p className="text-xs text-[var(--muted)]">{tCommon("degraded")}</p>
          )}

          <div className="qt-panel p-4">
            {tab === "news" && (
              <ul className="space-y-3">
                {news.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">{tCommon("error")}</li>
                )}
                {news.map((n, i) => (
                  <li key={i} className="border-b border-[var(--border)] pb-3 last:border-0">
                    <a
                      href={n.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-[var(--brand)]"
                    >
                      {n.headline}
                    </a>
                    {n.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {n.summary}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {n.source}
                      {n.datetime
                        ? ` · ${new Date(n.datetime * 1000).toLocaleDateString()}`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "earnings" && (
              assetType !== "stock" ? (
                <p className="text-sm text-[var(--muted)]">
                  {assetType === "hk" ? tEarnings("hkNa") : tEarnings("cryptoNa")}
                </p>
              ) : (
                <EarningsPanel
                  surprises={earnings}
                  upcoming={earningsUpcoming}
                  recent={earningsRecent}
                  metrics={earningsMetrics}
                  degraded={degraded}
                  loading={earningsLoading}
                />
              )
            )}

            {tab === "press" && (
              <ul className="space-y-3">
                {assetType !== "stock" && (
                  <li className="text-sm text-[var(--muted)]">
                    {assetType === "hk" ? tEarnings("hkNa") : "N/A for crypto"}
                  </li>
                )}
                {press.map((p, i) => (
                  <li key={i} className="border-b border-[var(--border)] pb-3">
                    <a
                      href={p.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-[var(--brand)]"
                    >
                      {p.headline || p.description || "Press release"}
                    </a>
                    <div className="text-xs text-[var(--muted)]">{p.datetime}</div>
                  </li>
                ))}
                {assetType === "stock" && press.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">{tCommon("degraded")}</li>
                )}
              </ul>
            )}

            {tab === "comments" && (
              <div className="space-y-3">
                {session?.user ? (
                  <form onSubmit={postComment} className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={tComments("placeholder")}
                      className="flex-1 qt-input px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="qt-btn qt-btn-primary px-3 py-2 text-sm"
                    >
                      {tComments("post")}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    {tComments("loginRequired")}
                  </p>
                )}
                <ul className="space-y-3">
                  {comments.length === 0 && (
                    <li className="text-sm text-[var(--muted)]">
                      {tComments("empty")}
                    </li>
                  )}
                  {comments.map((c) => (
                    <li key={c.id} className="border-b border-[var(--border)] pb-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                        <span>
                          {c.author} · {new Date(c.createdAt).toLocaleString()}
                        </span>
                        {session?.user?.id === c.userId && (
                          <button
                            type="button"
                            className="text-[var(--down)]"
                            onClick={() => void deleteComment(c.id)}
                          >
                            {tComments("delete")}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "sentiment" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {(["news", "reddit"] as const).map((key) => {
                  const s = sentiment?.[key] as
                    | {
                        available?: boolean;
                        message?: string;
                        buzz_score?: number;
                        sentiment_score?: number;
                        bullish_pct?: number;
                        bearish_pct?: number;
                        trend?: string | null;
                        source?: string;
                      }
                    | undefined;
                  if (!s) {
                    return (
                      <div
                        key={key}
                        className="rounded-md border border-[var(--border)] p-3 text-sm text-[var(--muted)]"
                      >
                        {key}: N/A
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="rounded-md border border-[var(--border)] p-3 text-sm"
                    >
                      <div className="mb-2 font-medium capitalize">
                        {s.source || key}
                      </div>
                      {s.available === false ? (
                        <p className="text-[var(--muted)]">
                          {s.message || tCommon("degraded")}
                        </p>
                      ) : (
                        <dl className="grid grid-cols-2 gap-2">
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Buzz</dt>
                            <dd>{s.buzz_score?.toFixed?.(1) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Score</dt>
                            <dd>{s.sentiment_score?.toFixed?.(3) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Bullish %</dt>
                            <dd>{s.bullish_pct?.toFixed?.(1) ?? "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-[var(--muted)]">Trend</dt>
                            <dd>{s.trend ?? "-"}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "ai" && (
              <AiAnalysisPanel
                available={aiAvailable}
                message={aiMessage}
                analysis={aiAnalysis}
                disclaimer={aiDisclaimer}
                cached={aiCached}
                degraded={degraded}
                loading={aiLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
