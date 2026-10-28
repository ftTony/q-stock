"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type IndicatorFlags } from "@/components/charts/candle-chart";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-panel";
import { useSymbolCandles } from "@/components/symbol/hooks/use-symbol-candles";
import {
  buildSymbolTabs,
  fallbackSymbolTab,
} from "@/components/symbol/tabs/build-symbol-tabs";
import { useSymbolPageMutations } from "@/components/symbol/hooks/use-symbol-page-mutations";
import { useSymbolTabData } from "@/components/symbol/hooks/use-symbol-tab-data";
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
import { queryKeys } from "@/lib/query/keys";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType, CandleResolution, Quote } from "@/lib/types";

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
  opts?: { prefetchEarnings?: boolean },
) {
  const prefetchEarnings = opts?.prefetchEarnings ?? false;
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");
  const tAlerts = useTranslations("alerts");
  const tEarnings = useTranslations("earnings");
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
  const candles = useSymbolCandles(symbol, assetType, resolution);
  const [tab, setTab] = useState<SymbolTab>("chart");
  const tabData = useSymbolTabData({
    symbol,
    assetType,
    isIndex,
    locale,
    tab,
    prefetchEarnings,
  });
  const [commentText, setCommentText] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"gte" | "lte">("gte");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertBusy, setAlertBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);

  const quoteKey = queryKeys.symbol.quote(assetType, symbol);

  const onWsMessage = useCallback(
    (msg: ServerMessage) => {
      const mergeQuote = (incoming: Quote) => {
        qc.setQueryData(
          quoteKey,
          (prev: { quote?: Quote | null } | undefined) => {
            const name = incoming.name?.trim() || prev?.quote?.name;
            return { quote: name ? { ...incoming, name } : incoming };
          },
        );
      };
      if (msg.op === "quote") {
        if (
          msg.quote.symbol.toUpperCase() === symbol.toUpperCase() &&
          msg.quote.assetType === assetType &&
          msg.quote.price > 0
        ) {
          mergeQuote(msg.quote);
        }
        return;
      }
      if (msg.op === "snapshot" && msg.quotes?.length) {
        const hit = msg.quotes.find(
          (q) =>
            q.symbol.toUpperCase() === symbol.toUpperCase() &&
            q.assetType === assetType &&
            q.price > 0,
        );
        if (hit) mergeQuote(hit);
      }
    },
    [symbol, assetType, qc, quoteKey],
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
  }, [symbol, assetType, initialQuote]);

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
  }, [assetType, isIndex, tab, tabs]);

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
      alertBusy,
      setAlertBusy,
      setAlertMsg,
      setAlertPrice,
      inWatchlist,
      setWatchBusy,
      loadTab: tabData.loadTab,
      tAlerts,
      tCommon,
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
    sentiment: tabData.sentiment,
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
    degraded: tabData.degraded,
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
