"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type IndicatorFlags } from "@/components/charts/candle-chart";
import {
  type EarningsCalendarRow,
  type EarningsMetric,
  type EarningsSurprise,
} from "@/components/market/earnings-panel";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import {
  type CommentRow,
  type NewsRow,
  type PressRow,
  type SymbolTab,
} from "@/components/symbol/symbol-tabs-panel";
import { useSymbolAiAnalysis } from "@/components/symbol/use-symbol-ai-analysis";
import { useSymbolCandles } from "@/components/symbol/use-symbol-candles";
import {
  buildSymbolTabs,
  fallbackSymbolTab,
} from "@/components/symbol/symbol-page-tabs";
import { symbolPageMutations } from "@/components/symbol/use-symbol-page-mutations";
import type { SymbolSentiment } from "@/components/symbol/symbol-sentiment-chip";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";

const TAB_LOADING: ReadonlySet<SymbolTab> = new Set([
  "news",
  "fundamentals",
  "press",
  "comments",
  "officers",
]);

function quoteTimestamp(quote: Quote | null): Date | null {
  if (!quote?.timestamp) return null;
  const ms =
    quote.timestamp > 1e12 ? quote.timestamp : quote.timestamp * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function useSymbolPage(
  symbol: string,
  assetType: AssetType,
  isIndex: boolean,
  initialQuote: Quote | null = null,
) {
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tAlerts = useTranslations("alerts");
  const tEarnings = useTranslations("earnings");
  const { data: session } = useSession();

  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  const [resolution, setResolution] = useState<CandleResolution>("D");
  const [flags, setFlags] = useState<IndicatorFlags>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false,
    macd: false,
  });
  const candles = useSymbolCandles(symbol, assetType, resolution);
  const [tab, setTab] = useState<SymbolTab>("chart");
  /** Trend AI tab removed from secondary; desk is QuoteBar / FAB drawer. */
  const ai = useSymbolAiAnalysis(symbol, assetType, false);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [earnings, setEarnings] = useState<EarningsSurprise[]>([]);
  const [earningsUpcoming, setEarningsUpcoming] = useState<EarningsCalendarRow[]>([]);
  const [earningsRecent, setEarningsRecent] = useState<EarningsCalendarRow[]>([]);
  const [earningsMetrics, setEarningsMetrics] = useState<EarningsMetric[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [press, setPress] = useState<PressRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [officers, setOfficers] = useState<CompanyOfficer[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [sentiment, setSentiment] = useState<SymbolSentiment>(null);
  const earningsLoadedRef = useRef(false);
  const companyLoadedRef = useRef(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(() =>
    quoteTimestamp(initialQuote),
  );

  const applyQuote = useCallback((q: Quote | null | undefined) => {
    if (!q || !(q.price > 0)) return;
    setQuote(q);
    setUpdatedAt(quoteTimestamp(q) ?? new Date());
    setAlertPrice((prev) => {
      if (prev) return prev;
      return String(Number(q.price.toFixed(4)));
    });
  }, []);

  const loadQuote = useCallback(async () => {
    const res = await fetch(`/api/quotes?symbol=${symbol}&assetType=${assetType}`);
    const data = await res.json();
    if (res.ok) applyQuote(data.quote);
  }, [symbol, assetType, applyQuote]);

  const onWsMessage = useCallback(
    (msg: ServerMessage) => {
      if (msg.op === "quote") {
        if (
          msg.quote.symbol.toUpperCase() === symbol.toUpperCase() &&
          msg.quote.assetType === assetType
        ) {
          applyQuote(msg.quote);
        }
        return;
      }
      if (msg.op === "snapshot" && msg.quotes?.length) {
        const hit = msg.quotes.find(
          (q) =>
            q.symbol.toUpperCase() === symbol.toUpperCase() &&
            q.assetType === assetType,
        );
        applyQuote(hit);
      }
    },
    [symbol, assetType, applyQuote],
  );

  const {
    enabled: wsEnabled,
    connected: wsConnected,
    degraded: wsDegraded,
    push: wsPush,
  } = useQuoteChannels([{ type: "symbol", assetType, symbol }], onWsMessage);

  const loadEarningsMetrics = useCallback(async () => {
    if (isIndex || (assetType !== "stock" && assetType !== "hk")) {
      setEarningsMetrics([]);
      earningsLoadedRef.current = false;
      return;
    }
    try {
      const res = await fetch(
        `/api/earnings?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
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
  }, [symbol, assetType, isIndex]);

  const loadTab = useCallback(async () => {
    setDegraded(false);
    const fundamentalsCached =
      tab === "fundamentals" &&
      earningsLoadedRef.current &&
      companyLoadedRef.current;
    const showLoading = TAB_LOADING.has(tab) && !fundamentalsCached;
    if (showLoading) setTabLoading(true);
    try {
      if (tab === "news") {
        const res = await fetch(
          `/api/news?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        setNews(data.news ?? []);
        if (!res.ok || data.degraded) setDegraded(true);
      } else if (tab === "fundamentals") {
        if (assetType === "crypto" || isIndex) {
          setEarnings([]);
          setEarningsUpcoming([]);
          setEarningsRecent([]);
          setEarningsMetrics([]);
          setCompany(null);
          setOfficers([]);
          return;
        }
        if (fundamentalsCached) return;
        const tasks: Promise<void>[] = [];
        if (!earningsLoadedRef.current) {
          tasks.push(
            (async () => {
              setEarningsLoading(true);
              try {
                const res = await fetch(
                  `/api/earnings?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
                );
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
            })(),
          );
        }
        if (!companyLoadedRef.current) {
          tasks.push(
            (async () => {
              const res = await fetch(
                `/api/company?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
              );
              const data = await res.json();
              setCompany(data.profile ?? null);
              setOfficers(data.officers ?? []);
              companyLoadedRef.current = true;
              if (!res.ok || data.degraded) setDegraded(true);
            })(),
          );
        }
        await Promise.all(tasks);
      } else if (tab === "press") {
        if (assetType === "crypto" || isIndex) {
          setPress([]);
          return;
        }
        const res = await fetch(
          `/api/press?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        setPress(data.press ?? []);
        if (data.degraded) setDegraded(true);
      } else if (tab === "comments") {
        const res = await fetch(
          `/api/comments?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } finally {
      setTabLoading(false);
    }
  }, [tab, symbol, assetType, locale, isIndex]);

  useEffect(() => {
    setQuote(initialQuote);
    setUpdatedAt(quoteTimestamp(initialQuote));
    setAlertPrice(
      initialQuote?.price ? String(Number(initialQuote.price.toFixed(4))) : "",
    );
    setAlertMsg(null);
    setEarnings([]);
    setEarningsUpcoming([]);
    setEarningsRecent([]);
    setEarningsMetrics([]);
    setCompany(null);
    setOfficers([]);
    earningsLoadedRef.current = false;
    companyLoadedRef.current = false;
    setTab("chart");
  }, [symbol, assetType, initialQuote]);

  const hasQuotePrice = quote != null && quote.price > 0;

  useEffect(() => {
    // SSR already painted a quote — skip the duplicate REST kickoff; poll/WS refresh.
    const ssrOk = initialQuote != null && initialQuote.price > 0;
    if (!ssrOk) void loadQuote();
    const ms =
      !hasQuotePrice || !wsPush || wsDegraded
        ? 3_000
        : quotePollIntervalMs({
            enabled: wsEnabled,
            connected: wsConnected,
            degraded: wsDegraded,
            push: wsPush,
          });
    const timer = setInterval(() => void loadQuote(), ms);
    return () => clearInterval(timer);
  }, [
    loadQuote,
    initialQuote,
    hasQuotePrice,
    wsEnabled,
    wsConnected,
    wsDegraded,
    wsPush,
  ]);

  // Rail market-cap can wait; chart + quote first. Idle or ~1.2s fallback.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void loadEarningsMetrics();
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(run, 1200);
    }
    return () => {
      cancelled = true;
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [loadEarningsMetrics]);

  // Sentiment tab is not in the main tab bar — fetch only if selected.
  useEffect(() => {
    if (tab !== "sentiment") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/sentiment?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const data = await res.json();
        if (!cancelled) setSentiment(data.sentiment ?? null);
      } catch {
        if (!cancelled) setSentiment(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, symbol, assetType]);

  useEffect(() => {
    if (!TAB_LOADING.has(tab)) return;
    void loadTab();
  }, [loadTab, tab]);

  useEffect(() => {
    if (ai.aiDegraded) setDegraded(true);
  }, [ai.aiDegraded]);

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
    () => buildSymbolTabs(t, assetType, isIndex),
    [t, assetType, isIndex],
  );

  useEffect(() => {
    const next = fallbackSymbolTab(tabs, tab);
    if (next !== tab) setTab(next);
  }, [assetType, isIndex, tab, tabs]);

  const { postComment, deleteComment, createAlert, toggleWatchlist } =
    symbolPageMutations({
      session: session ?? null,
      symbol,
      assetType,
      commentText,
      commentBusy,
      setCommentBusy,
      setCommentText,
      alertPrice,
      alertCondition,
      alertBusy,
      setAlertBusy,
      setAlertMsg,
      setAlertPrice,
      inWatchlist,
      setInWatchlist,
      setWatchBusy,
      loadTab,
      tAlerts,
      tCommon,
    });

  return {
    session,
    t,
    tCommon,
    tComments,
    tAlerts,
    tEarnings,
    quote,
    bars: candles.bars,
    resolution,
    setResolution,
    flags,
    setFlags,
    tab,
    setTab,
    tabs,
    news,
    earnings,
    earningsUpcoming,
    earningsRecent,
    earningsMetrics,
    earningsLoading,
    press,
    comments,
    commentText,
    setCommentText,
    company,
    officers,
    tabLoading,
    sentiment,
    ...ai,
    loadingChart: candles.loadingChart,
    loadingMoreCandles: candles.loadingMoreCandles,
    hasMoreCandles: candles.hasMoreCandles,
    loadMoreCandles: candles.loadMoreCandles,
    alertPrice,
    setAlertPrice,
    alertCondition,
    setAlertCondition,
    alertMsg,
    alertBusy,
    commentBusy,
    degraded,
    inWatchlist,
    watchBusy,
    updatedAt,
    loadQuote,
    postComment,
    deleteComment,
    createAlert,
    toggleWatchlist,
  };
}
