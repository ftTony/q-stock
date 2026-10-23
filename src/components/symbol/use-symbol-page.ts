"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type IndicatorFlags } from "@/components/charts/candle-chart";
import type { SymbolTab } from "@/components/symbol/symbol-tabs-panel";
import { useSymbolAiAnalysis } from "@/components/symbol/use-symbol-ai-analysis";
import { useSymbolCandles } from "@/components/symbol/use-symbol-candles";
import {
  buildSymbolTabs,
  fallbackSymbolTab,
} from "@/components/symbol/symbol-page-tabs";
import { symbolPageMutations } from "@/components/symbol/use-symbol-page-mutations";
import { useSymbolTabData } from "@/components/symbol/use-symbol-tab-data";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";

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
  const tabData = useSymbolTabData({ symbol, assetType, isIndex, locale, tab });
  const [commentText, setCommentText] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
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

  useEffect(() => {
    setQuote(initialQuote);
    setUpdatedAt(quoteTimestamp(initialQuote));
    setAlertPrice(
      initialQuote?.price ? String(Number(initialQuote.price.toFixed(4))) : "",
    );
    setAlertMsg(null);
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
      loadTab: tabData.loadTab,
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
    news: tabData.news,
    earnings: tabData.earnings,
    earningsUpcoming: tabData.earningsUpcoming,
    earningsRecent: tabData.earningsRecent,
    earningsMetrics: tabData.earningsMetrics,
    earningsLoading: tabData.earningsLoading,
    press: tabData.press,
    comments: tabData.comments,
    commentText,
    setCommentText,
    company: tabData.company,
    officers: tabData.officers,
    tabLoading: tabData.tabLoading,
    sentiment: tabData.sentiment,
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
    degraded: tabData.degraded || ai.aiDegraded,
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
