"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  EarningsCalendarRow,
  EarningsMetric,
  EarningsSurprise,
} from "@/components/market/earnings-panel";
import type { CompanyOfficer, CompanyProfile } from "@/lib/company";
import type {
  CommentRow,
  NewsRow,
  PressRow,
  SymbolTab,
} from "@/components/symbol/tabs/symbol-tabs-panel";
import type { SymbolSentiment } from "@/components/symbol/quote/symbol-sentiment-chip";
import type { EarningsStatement } from "@/lib/earnings/types";
import type { AssetType } from "@/lib/types";

const TAB_LOADING: ReadonlySet<SymbolTab> = new Set([
  "news",
  "fundamentals",
  "press",
  "comments",
  "officers",
]);

type State = {
  news: NewsRow[];
  earnings: EarningsSurprise[];
  earningsUpcoming: EarningsCalendarRow[];
  earningsRecent: EarningsCalendarRow[];
  earningsMetrics: EarningsMetric[];
  earningsStatement: EarningsStatement | null;
  earningsBalance: EarningsStatement | null;
  earningsCashflow: EarningsStatement | null;
  earningsLoading: boolean;
  press: PressRow[];
  comments: CommentRow[];
  company: CompanyProfile | null;
  officers: CompanyOfficer[];
  tabLoading: boolean;
  sentiment: SymbolSentiment;
  degraded: boolean;
};

type Action =
  | { type: "reset" }
  | { type: "reset-degraded" }
  | { type: "set-tab-loading"; value: boolean }
  | { type: "set-earnings-loading"; value: boolean }
  | { type: "set-news"; news: NewsRow[]; degraded: boolean }
  | {
      type: "set-earnings";
      earnings: EarningsSurprise[];
      upcoming: EarningsCalendarRow[];
      recent: EarningsCalendarRow[];
      metrics: EarningsMetric[];
      statement: EarningsStatement | null;
      balance: EarningsStatement | null;
      cashflow: EarningsStatement | null;
      degraded: boolean;
    }
  | { type: "set-earnings-metrics"; metrics: EarningsMetric[] }
  | {
      type: "set-company";
      company: CompanyProfile | null;
      officers: CompanyOfficer[];
      degraded: boolean;
    }
  | { type: "set-press"; press: PressRow[]; degraded: boolean }
  | { type: "set-comments"; comments: CommentRow[] }
  | { type: "set-sentiment"; sentiment: SymbolSentiment };

const INITIAL_STATE: State = {
  news: [],
  earnings: [],
  earningsUpcoming: [],
  earningsRecent: [],
  earningsMetrics: [],
  earningsStatement: null,
  earningsBalance: null,
  earningsCashflow: null,
  earningsLoading: false,
  press: [],
  comments: [],
  company: null,
  officers: [],
  tabLoading: false,
  sentiment: null,
  degraded: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return INITIAL_STATE;
    case "reset-degraded":
      return { ...state, degraded: false };
    case "set-tab-loading":
      return { ...state, tabLoading: action.value };
    case "set-earnings-loading":
      return { ...state, earningsLoading: action.value };
    case "set-news":
      return { ...state, news: action.news, degraded: action.degraded };
    case "set-earnings":
      return {
        ...state,
        earnings: action.earnings,
        earningsUpcoming: action.upcoming,
        earningsRecent: action.recent,
        earningsMetrics: action.metrics,
        earningsStatement: action.statement,
        earningsBalance: action.balance,
        earningsCashflow: action.cashflow,
        degraded: state.degraded || action.degraded,
      };
    case "set-earnings-metrics":
      return { ...state, earningsMetrics: action.metrics };
    case "set-company":
      return {
        ...state,
        company: action.company,
        officers: action.officers,
        degraded: state.degraded || action.degraded,
      };
    case "set-press":
      return { ...state, press: action.press, degraded: action.degraded };
    case "set-comments":
      return { ...state, comments: action.comments };
    case "set-sentiment":
      return { ...state, sentiment: action.sentiment };
  }
}

type Args = {
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  locale: string;
  tab: SymbolTab;
  /** When true (e.g. side rail open), idle-prefetch metrics-only for rail stats. */
  prefetchEarnings?: boolean;
};

export function useSymbolTabData({
  symbol,
  assetType,
  isIndex,
  locale,
  tab,
  prefetchEarnings = false,
}: Args) {
  const [data, dispatch] = useReducer(reducer, INITIAL_STATE);
  const earningsLoadedRef = useRef(false);
  const companyLoadedRef = useRef(false);
  const identity = `${assetType}:${symbol}`;
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const isCurrentIdentity = useCallback(
    (requestIdentity: string) => identityRef.current === requestIdentity,
    [],
  );

  const loadEarningsMetrics = useCallback(async () => {
    if (isIndex || (assetType !== "stock" && assetType !== "hk")) {
      dispatch({ type: "set-earnings-metrics", metrics: [] });
      return;
    }
    // Full fundamentals already loaded — don't re-hit with lite scope.
    if (earningsLoadedRef.current) return;
    const requestIdentity = identity;
    try {
      // Lite: metrics only for rail stats (no calendar / statements fan-out).
      const res = await fetch(
        `/api/earnings?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&scope=metrics`,
      );
      const result = await res.json();
      if (!res.ok || !isCurrentIdentity(requestIdentity)) return;
      dispatch({
        type: "set-earnings-metrics",
        metrics: result.metrics ?? [],
      });
    } catch {
      // Earnings are optional for the quote panel.
    }
  }, [assetType, identity, isCurrentIdentity, isIndex, symbol]);

  const loadTab = useCallback(async () => {
    const requestIdentity = identity;
    dispatch({ type: "reset-degraded" });
    const fundamentalsCached =
      tab === "fundamentals" &&
      earningsLoadedRef.current &&
      companyLoadedRef.current;
    const showLoading = TAB_LOADING.has(tab) && !fundamentalsCached;
    if (showLoading) dispatch({ type: "set-tab-loading", value: true });
    try {
      if (tab === "news") {
        const res = await fetch(
          `/api/news?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}&limit=24`,
        );
        const result = await res.json();
        if (!isCurrentIdentity(requestIdentity)) return;
        dispatch({
          type: "set-news",
          news: result.news ?? [],
          degraded: !res.ok || Boolean(result.degraded),
        });
      } else if (tab === "fundamentals") {
        if (assetType === "crypto" || isIndex) {
          dispatch({
            type: "set-earnings",
            earnings: [],
            upcoming: [],
            recent: [],
            metrics: [],
            statement: null,
            balance: null,
            cashflow: null,
            degraded: false,
          });
          dispatch({
            type: "set-company",
            company: null,
            officers: [],
            degraded: false,
          });
          return;
        }
        if (fundamentalsCached) return;

        const tasks: Promise<void>[] = [];
        if (!earningsLoadedRef.current) {
          tasks.push(
            (async () => {
              dispatch({ type: "set-earnings-loading", value: true });
              try {
                const res = await fetch(
                  `/api/earnings?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
                );
                const result = await res.json();
                if (!isCurrentIdentity(requestIdentity)) return;
                dispatch({
                  type: "set-earnings",
                  earnings: result.surprises ?? result.earnings ?? [],
                  upcoming: result.calendar?.upcoming ?? [],
                  recent: result.calendar?.recent ?? [],
                  metrics: result.metrics ?? [],
                  statement: result.statement ?? null,
                  balance: result.balance ?? null,
                  cashflow: result.cashflow ?? null,
                  degraded: Boolean(result.degraded),
                });
                earningsLoadedRef.current = true;
              } finally {
                if (isCurrentIdentity(requestIdentity)) {
                  dispatch({ type: "set-earnings-loading", value: false });
                }
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
              const result = await res.json();
              if (!isCurrentIdentity(requestIdentity)) return;
              dispatch({
                type: "set-company",
                company: result.profile ?? null,
                officers: result.officers ?? [],
                degraded: !res.ok || Boolean(result.degraded),
              });
              companyLoadedRef.current = true;
            })(),
          );
        }
        await Promise.all(tasks);
      } else if (tab === "press") {
        if (assetType === "crypto" || isIndex) {
          dispatch({ type: "set-press", press: [], degraded: false });
          return;
        }
        const res = await fetch(
          `/api/press?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&locale=${encodeURIComponent(locale)}&limit=24`,
        );
        const result = await res.json();
        if (!isCurrentIdentity(requestIdentity)) return;
        dispatch({
          type: "set-press",
          press: result.press ?? [],
          degraded: Boolean(result.degraded),
        });
      } else if (tab === "comments") {
        const res = await fetch(
          `/api/comments?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const result = await res.json();
        if (!isCurrentIdentity(requestIdentity)) return;
        dispatch({ type: "set-comments", comments: result.comments ?? [] });
      }
    } finally {
      if (isCurrentIdentity(requestIdentity)) {
        dispatch({ type: "set-tab-loading", value: false });
      }
    }
  }, [assetType, identity, isCurrentIdentity, isIndex, locale, symbol, tab]);

  useEffect(() => {
    dispatch({ type: "reset" });
    earningsLoadedRef.current = false;
    companyLoadedRef.current = false;
  }, [identity]);

  useEffect(() => {
    if (!prefetchEarnings) return;
    let cancelled = false;
    const run = () => {
      if (!cancelled) void loadEarningsMetrics();
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 4500 });
    } else {
      timeoutId = setTimeout(run, 2200);
    }
    return () => {
      cancelled = true;
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [loadEarningsMetrics, prefetchEarnings]);

  useEffect(() => {
    if (tab !== "sentiment") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/sentiment?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const result = await res.json();
        if (!cancelled) {
          dispatch({ type: "set-sentiment", sentiment: result.sentiment ?? null });
        }
      } catch {
        if (!cancelled) dispatch({ type: "set-sentiment", sentiment: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetType, symbol, tab]);

  useEffect(() => {
    if (TAB_LOADING.has(tab)) void loadTab();
  }, [loadTab, tab]);

  return { ...data, loadTab };
}
