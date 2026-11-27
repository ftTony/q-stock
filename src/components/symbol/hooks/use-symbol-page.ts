"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type IndicatorFlags } from "@/components/charts/candle-chart";
import { useSymbolCandles } from "@/components/symbol/hooks/use-symbol-candles";
import {
  buildSymbolTabs,
  fallbackSymbolTab,
} from "@/components/symbol/tabs/build-symbol-tabs";
import { useSymbolPageMutations } from "@/components/symbol/hooks/use-symbol-page-mutations";
import { useSymbolTabData } from "@/components/symbol/hooks/use-symbol-tab-data";
import type { ToastTone } from "@/components/ui/top-toast";
import { useCreateAlert } from "@/hooks/query/use-alerts";
import {
  useCreateComment,
  useDeleteComment,
} from "@/hooks/query/use-comments";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useSymbolQuote } from "@/hooks/query/use-symbol-quote";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import {
  readChartUiSettings,
  writeChartUiSettings,
} from "@/components/charts/candle-chart-settings";
import { getUsMarketPhase } from "@/lib/market/session";
import { queryKeys } from "@/lib/query/keys";
import { useSymbolWorkbenchStore } from "@/stores/symbol-workbench-store";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type {
  AssetType,
  CandleResolution,
  OhlcvBar,
  Quote,
} from "@/lib/types";

function quoteTimestamp(quote: Quote | null | undefined): Date | null {
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
  opts?: {
    prefetchEarnings?: boolean;
    prefetchNews?: boolean;
    prefetchPress?: boolean;
    initialBars?: OhlcvBar[] | null;
  },
) {
  const prefetchEarnings = opts?.prefetchEarnings ?? false;
  const prefetchNews = opts?.prefetchNews ?? false;
  const prefetchPress = opts?.prefetchPress ?? false;
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tAlerts = useTranslations("alerts");
  const tEarnings = useTranslations("earnings");
  const tab = useSymbolWorkbenchStore((state) =>
    state.identity.symbol === symbol && state.identity.assetType === assetType
      ? state.tab
      : "chart",
  );
  const setTab = useSymbolWorkbenchStore((state) => state.setTab);
  const { data: session } = useSession();
  const qc = useQueryClient();

  const [resolution, setResolution] = useState<CandleResolution>("D");
  const [flags, setFlags] = useState<IndicatorFlags>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false,
    macd: false,
  });
  const [includeExtendedHours, setIncludeExtendedHoursState] = useState(
    () => readChartUiSettings().includeExtendedHours,
  );
  const setIncludeExtendedHours = useCallback((next: boolean) => {
    setIncludeExtendedHoursState(next);
    writeChartUiSettings({
      ...readChartUiSettings(),
      includeExtendedHours: next,
    });
  }, []);
  const candles = useSymbolCandles(symbol, assetType, resolution, {
    initialBars: opts?.initialBars,
    includeExtendedHours:
      assetType === "stock" ? includeExtendedHours : false,
  });
  const tabData = useSymbolTabData({
    symbol,
    assetType,
    isIndex,
    locale,
    tab,
    prefetchEarnings,
    prefetchNews,
    prefetchPress,
  });
  const [commentText, setCommentText] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertFrequency, setAlertFrequency] = useState<
    "once" | "daily" | "always"
  >("always");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("neutral");
  const [toastKey, setToastKey] = useState(0);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    setToastMsg(message);
    setToastTone(tone);
    setToastKey((k) => k + 1);
  }, []);
  const clearToast = useCallback(() => setToastMsg(null), []);

  const quoteKey = queryKeys.symbol.quote(assetType, symbol);

  // WS quote ticks can arrive several times per second. Writing each tick to
  // the query cache re-renders the whole page (quote flows through `s`). Buffer
  // the newest tick and flush at most once per animation frame (~100ms cap),
  // collapsing bursts into a single render while keeping the UI responsive.
  const pendingQuoteRef = useRef<Quote | null>(null);
  const quoteRafRef = useRef<number | null>(null);
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuoteFlushRef = useRef(0);

  useEffect(
    () => () => {
      if (quoteRafRef.current != null) cancelAnimationFrame(quoteRafRef.current);
      if (quoteTimerRef.current != null) clearTimeout(quoteTimerRef.current);
    },
    [],
  );

  // Drop any buffered tick for the previous symbol when navigating to another.
  useEffect(() => {
    pendingQuoteRef.current = null;
    if (quoteRafRef.current != null) {
      cancelAnimationFrame(quoteRafRef.current);
      quoteRafRef.current = null;
    }
    if (quoteTimerRef.current != null) {
      clearTimeout(quoteTimerRef.current);
      quoteTimerRef.current = null;
    }
  }, [symbol, assetType]);

  const flushQuote = useCallback(() => {
    quoteRafRef.current = null;
    quoteTimerRef.current = null;
    const incoming = pendingQuoteRef.current;
    pendingQuoteRef.current = null;
    if (!incoming) return;
    lastQuoteFlushRef.current = performance.now();
    qc.setQueryData(
      quoteKey,
      (prev: { quote?: Quote | null } | undefined) => {
        const previous = prev?.quote;
        return {
          quote: {
            ...incoming,
            ...(incoming.name?.trim() || previous?.name
              ? { name: incoming.name?.trim() || previous?.name }
              : {}),
            ...(incoming.nameZh?.trim() || previous?.nameZh
              ? { nameZh: incoming.nameZh?.trim() || previous?.nameZh }
              : {}),
            ...(incoming.nameEn?.trim() || previous?.nameEn
              ? { nameEn: incoming.nameEn?.trim() || previous?.nameEn }
              : {}),
            ...(incoming.preMarket || previous?.preMarket
              ? { preMarket: incoming.preMarket ?? previous?.preMarket }
              : {}),
            ...(incoming.postMarket || previous?.postMarket
              ? { postMarket: incoming.postMarket ?? previous?.postMarket }
              : {}),
            ...(incoming.overnight || previous?.overnight
              ? { overnight: incoming.overnight ?? previous?.overnight }
              : {}),
            ...(incoming.regularSession || previous?.regularSession
              ? {
                  regularSession:
                    incoming.regularSession ?? previous?.regularSession,
                }
              : {}),
            ...(incoming.activeSession
              ? { activeSession: incoming.activeSession }
              : previous?.activeSession
                ? { activeSession: previous.activeSession }
                : {}),
          },
        };
      },
    );
  }, [qc, quoteKey]);

  const scheduleQuoteFlush = useCallback(() => {
    if (quoteRafRef.current != null || quoteTimerRef.current != null) return;
    const wait = Math.max(0, 100 - (performance.now() - lastQuoteFlushRef.current));
    quoteTimerRef.current = setTimeout(() => {
      quoteTimerRef.current = null;
      quoteRafRef.current = requestAnimationFrame(flushQuote);
    }, wait);
  }, [flushQuote]);

  const onWsMessage = useCallback(
    (msg: ServerMessage) => {
      let hit: Quote | undefined;
      if (msg.op === "quote") {
        hit = msg.quote;
      } else if (msg.op === "snapshot" && msg.quotes?.length) {
        hit = msg.quotes.find((q) => q.price > 0);
      }
      if (
        !hit ||
        hit.price <= 0 ||
        hit.symbol.toUpperCase() !== symbol.toUpperCase() ||
        hit.assetType !== assetType
      ) {
        return;
      }
      pendingQuoteRef.current = hit;
      scheduleQuoteFlush();
    },
    [symbol, assetType, scheduleQuoteFlush],
  );

  const {
    enabled: wsEnabled,
    connected: wsConnected,
    degraded: wsDegraded,
    push: wsPush,
  } = useQuoteChannels([{ type: "symbol", assetType, symbol }], onWsMessage);

  const quoteQuery = useSymbolQuote(symbol, assetType, {
    initialQuote,
    refetchInterval: (query) => {
      const q = query.state.data?.quote;
      const hasPrice = q != null && q.price > 0;
      const phase = assetType === "stock" ? getUsMarketPhase() : "regular";
      if (phase === "pre" || phase === "post") {
        // The WS feed carries regular quotes, so refresh REST extended quotes
        // during pre/post-market instead of waiting for the regular session.
        return 15_000;
      }
      // No quote yet: mild poll. Otherwise trust quotePollIntervalMs
      // (5s degraded / 60s when push is live) — avoid a 3s storm.
      if (!hasPrice) return 5_000;
      return quotePollIntervalMs({
        enabled: wsEnabled,
        connected: wsConnected,
        degraded: wsDegraded,
        push: wsPush,
      });
    },
  });

  const quote = quoteQuery.data?.quote ?? null;
  const updatedAt =
    quoteTimestamp(quote) ??
    (quoteQuery.dataUpdatedAt ? new Date(quoteQuery.dataUpdatedAt) : null);

  const watchlist = useWatchlist({ enabled: Boolean(session?.user) });
  const inWatchlist = useMemo(
    () =>
      (watchlist.data?.items ?? []).some(
        (i) => i.symbol === symbol && i.assetType === assetType,
      ),
    [watchlist.data, symbol, assetType],
  );

  const createAlertMut = useCreateAlert();
  const addWatch = useAddWatchlistItem();
  const removeWatch = useRemoveWatchlistItem();
  const createCommentMut = useCreateComment();
  const deleteCommentMut = useDeleteComment();

  useEffect(() => {
    setAlertPrice(
      initialQuote?.price ? String(Number(initialQuote.price.toFixed(4))) : "",
    );
    setAlertMsg(null);
    setTab("chart");
  }, [symbol, assetType, initialQuote, setTab]);

  useEffect(() => {
    if (!quote?.price || !(quote.price > 0)) return;
    setAlertPrice((prev) => {
      if (prev) return prev;
      return String(Number(quote.price.toFixed(4)));
    });
  }, [quote]);

  const tabs = useMemo(
    () => buildSymbolTabs(t, assetType, isIndex),
    [t, assetType, isIndex],
  );

  useEffect(() => {
    const next = fallbackSymbolTab(tabs, tab);
    if (next !== tab) setTab(next);
  }, [assetType, isIndex, setTab, tab, tabs]);

  const loadQuote = useCallback(async () => {
    await quoteQuery.refetch();
  }, [quoteQuery]);

  const { postComment, deleteComment, createAlert, toggleWatchlist } =
    useSymbolPageMutations({
      session: session ?? null,
      symbol,
      assetType,
      commentText,
      commentBusy,
      setCommentBusy,
      setCommentText,
      alertPrice,
      alertCondition,
      alertFrequency,
      alertBusy,
      setAlertBusy,
      setAlertMsg,
      setAlertPrice,
      inWatchlist,
      setWatchBusy,
      loadTab: tabData.loadTab,
      tCommon,
      showToast,
      createAlertMut,
      addWatch,
      removeWatch,
      createCommentMut,
      deleteCommentMut,
    });

  return {
    session,
    t,
    tCommon,
    tComments,
    tAlerts,
    tEarnings,
    toastMsg,
    toastTone,
    toastKey,
    clearToast,
    quote,
    bars: candles.bars,
    resolution,
    setResolution,
    includeExtendedHours,
    setIncludeExtendedHours,
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
    earningsStatement: tabData.earningsStatement,
    earningsBalance: tabData.earningsBalance,
    earningsCashflow: tabData.earningsCashflow,
    earningsLoading: tabData.earningsLoading,
    press: tabData.press,
    comments: tabData.comments,
    commentText,
    setCommentText,
    company: tabData.company,
    officers: tabData.officers,
    tabLoading: tabData.tabLoading,
    newsReady: tabData.newsReady,
    pressReady: tabData.pressReady,
    commentsReady: tabData.commentsReady,
    sentiment: tabData.sentiment,
    loadingChart: candles.loadingChart,
    loadingMoreCandles: candles.loadingMoreCandles,
    hasMoreCandles: candles.hasMoreCandles,
    loadMoreCandles: candles.loadMoreCandles,
    alertPrice,
    setAlertPrice,
    alertCondition,
    setAlertCondition,
    alertFrequency,
    setAlertFrequency,
    alertMsg,
    alertBusy,
    commentBusy,
    degraded: tabData.degraded,
    wsEnabled,
    wsConnected,
    wsDegraded,
    wsPush,
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
