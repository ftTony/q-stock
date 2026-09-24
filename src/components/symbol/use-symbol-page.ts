"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type IndicatorFlags } from "@/components/charts/candle-chart";
import { type AiTrendAnalysis } from "@/components/market/ai-analysis-panel";
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
import { useSymbolCandles } from "@/components/symbol/use-symbol-candles";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";

const TAB_LOADING: ReadonlySet<SymbolTab> = new Set([
  "news",
  "earnings",
  "press",
  "profile",
  "officers",
]);

export function useSymbolPage(symbol: string, assetType: AssetType, isIndex: boolean) {
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tAlerts = useTranslations("alerts");
  const tEarnings = useTranslations("earnings");
  const { data: session } = useSession();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [resolution, setResolution] = useState<CandleResolution>("D");
  const [flags, setFlags] = useState<IndicatorFlags>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false,
    macd: false,
  });
  const candles = useSymbolCandles(symbol, assetType, resolution);
  const [tab, setTab] = useState<SymbolTab>("news");
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
  const earningsLoadedRef = useRef(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
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
    const showLoading =
      TAB_LOADING.has(tab) && !(tab === "earnings" && earningsLoadedRef.current);
    if (showLoading) setTabLoading(true);
    try {
      if (tab === "news") {
        const res = await fetch(
          `/api/news?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        setNews(data.news ?? []);
        if (!res.ok || data.degraded) setDegraded(true);
      } else if (tab === "earnings") {
        if (assetType === "crypto" || isIndex) {
          setEarnings([]);
          setEarningsUpcoming([]);
          setEarningsRecent([]);
          setEarningsMetrics([]);
          return;
        }
        if (earningsLoadedRef.current) return;
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
      } else if (tab === "press") {
        if (assetType === "crypto" || isIndex) {
          setPress([]);
          return;
        }
        const res = await fetch(
          `/api/press?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const data = await res.json();
        setPress(data.press ?? []);
        if (data.degraded) setDegraded(true);
      } else if (tab === "profile" || tab === "officers") {
        if (assetType === "crypto" || isIndex) {
          setCompany(null);
          setOfficers([]);
          return;
        }
        const res = await fetch(
          `/api/company?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}`,
        );
        const data = await res.json();
        setCompany(data.profile ?? null);
        setOfficers(data.officers ?? []);
        if (!res.ok || data.degraded) setDegraded(true);
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
    } finally {
      setTabLoading(false);
    }
  }, [tab, symbol, assetType, locale, isIndex]);

  useEffect(() => {
    setAlertPrice("");
    setAlertMsg(null);
    setQuote(null);
    setEarnings([]);
    setEarningsUpcoming([]);
    setEarningsRecent([]);
    setEarningsMetrics([]);
    setCompany(null);
    setOfficers([]);
    earningsLoadedRef.current = false;
    setTab("news");
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

  const tabs = useMemo(() => {
    const all: { id: SymbolTab; label: string }[] = [
      { id: "news", label: t("news") },
      { id: "earnings", label: t("earnings") },
      { id: "press", label: t("press") },
      { id: "profile", label: t("profile") },
      { id: "officers", label: t("officers") },
      { id: "comments", label: t("comments") },
      { id: "sentiment", label: t("sentiment") },
      { id: "ai", label: t("ai") },
    ];
    if (assetType === "crypto" || isIndex) {
      return all.filter(
        (x) =>
          x.id !== "earnings" &&
          x.id !== "press" &&
          x.id !== "profile" &&
          x.id !== "officers",
      );
    }
    if (assetType === "hk") {
      return all.filter((x) => x.id !== "sentiment");
    }
    return all;
  }, [t, assetType, isIndex]);

  useEffect(() => {
    if (
      (assetType === "crypto" || isIndex) &&
      (tab === "earnings" ||
        tab === "press" ||
        tab === "profile" ||
        tab === "officers")
    ) {
      setTab("news");
    }
    if (assetType === "hk" && tab === "sentiment") {
      setTab("news");
    }
  }, [assetType, isIndex, tab]);

  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || commentBusy) return;
    setCommentBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType, content: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        await loadTab();
      }
    } finally {
      setCommentBusy(false);
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
    if (alertBusy) return;
    setAlertBusy(true);
    try {
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
    } finally {
      setAlertBusy(false);
    }
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
    aiAnalysis,
    aiAvailable,
    aiMessage,
    aiDisclaimer,
    aiCached,
    aiLoading,
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
    postComment,
    deleteComment,
    createAlert,
    toggleWatchlist,
  };
}
