"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Quote } from "@/lib/types";
import { normalizeSymbol } from "@/lib/market/symbols";
import {
  ANALYSIS_BASKET_MAX,
  basketKey,
  quoteToBasketItem,
  toAnalysisTableRow,
  type AnalysisBasketItem,
  type AnalysisCalcEnrich,
  type AnalysisEquityType,
  type AnalysisRecentItem,
  type AnalysisTableRow,
  type IndustryHeatCell,
} from "@/components/analysis/types";
import type { IndustryStock } from "@/lib/market/providers/longbridge-industry";
import type { SecurityCalcRow } from "@/lib/market/providers/longbridge-calc";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useIndustryRanks } from "@/hooks/query/use-market";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useAnalysisPageStore } from "@/stores/analysis-page-store";

type StocksPage = {
  stocks: IndustryStock[];
  nextKey: string | null;
  hasMore: boolean;
  total: number;
};

export function useAnalysisPage(initialIndustries: IndustryHeatCell[]) {
  const { data: session } = useSession();
  const assetType = useAnalysisPageStore((s) => s.assetType);
  const workspace = useAnalysisPageStore((s) => s.workspace);
  const industryId = useAnalysisPageStore((s) => s.industryId);
  const basket = useAnalysisPageStore((s) => s.basket);
  const recent = useAnalysisPageStore((s) => s.recent);
  const setAssetType = useAnalysisPageStore((s) => s.setAssetType);
  const setWorkspace = useAnalysisPageStore((s) => s.setWorkspace);
  const setIndustryId = useAnalysisPageStore((s) => s.setIndustryId);
  const setBasket = useAnalysisPageStore((s) => s.setBasket);
  const hydrateRecent = useAnalysisPageStore((s) => s.hydrateRecent);
  const pushRecent = useAnalysisPageStore((s) => s.pushRecent);

  const signedIn = Boolean(session?.user);
  const watchlist = useWatchlist({ enabled: signedIn });
  const addWatch = useAddWatchlistItem();
  const removeWatch = useRemoveWatchlistItem();
  const ranksQuery = useIndustryRanks(assetType, { limit: 40 });

  useEffect(() => {
    hydrateRecent();
  }, [hydrateRecent]);

  useEffect(() => {
    if (industryId == null && initialIndustries[0]?.id) {
      setIndustryId(initialIndustries[0].id);
    }
  }, [industryId, initialIndustries, setIndustryId]);

  const industries = useMemo(() => {
    const raw =
      (
        ranksQuery.data as
          | { industries?: IndustryHeatCell[]; degraded?: boolean }
          | undefined
      )?.industries ?? initialIndustries;
    return [...raw].sort((a, b) => b.weight - a.weight);
  }, [ranksQuery.data, initialIndustries]);

  useEffect(() => {
    if (!industries.length) return;
    if (!industryId || !industries.some((i) => i.id === industryId)) {
      setIndustryId(industries[0]!.id);
    }
  }, [industries, industryId, setIndustryId]);

  const error = useMemo(() => {
    if (ranksQuery.error instanceof Error) return ranksQuery.error.message;
    const data = ranksQuery.data as
      | { degraded?: boolean; industries?: IndustryHeatCell[] }
      | undefined;
    if (data?.degraded && !(data.industries?.length)) return "unavailable";
    return null;
  }, [ranksQuery.error, ranksQuery.data]);

  const watched = useMemo(() => {
    const items = watchlist.data?.items ?? [];
    return new Set(items.map((i) => `${i.assetType}:${i.symbol}`));
  }, [watchlist.data?.items]);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.id === industryId) ?? null,
    [industries, industryId],
  );

  const stocksQuery = useInfiniteQuery({
    queryKey: queryKeys.market.industryStocks(assetType, industryId ?? ""),
    enabled: Boolean(industryId),
    initialPageParam: { nextKey: "", loaded: 0 },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async ({ pageParam }) => {
      const { nextKey, loaded } = pageParam;
      return fetchJson<StocksPage>(
        `/api/industries/stocks?industryId=${encodeURIComponent(industryId!)}&assetType=${encodeURIComponent(assetType)}&nextKey=${encodeURIComponent(nextKey)}&loaded=${loaded}`,
      );
    },
    getNextPageParam: (last, pages) => {
      if (!last.hasMore || !last.nextKey) return undefined;
      const loaded = pages.reduce((n, p) => n + p.stocks.length, 0);
      return { nextKey: last.nextKey, loaded };
    },
  });

  const loadedStocks = useMemo(() => {
    const seen = new Set<string>();
    const out: IndustryStock[] = [];
    for (const page of stocksQuery.data?.pages ?? []) {
      for (const s of page.stocks) {
        const k = s.symbol.toUpperCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(s);
      }
    }
    // Soft fallback while first page is in flight: heatmap embed.
    if (!out.length && selectedIndustry?.stocks.length) {
      return selectedIndustry.stocks;
    }
    return out;
  }, [stocksQuery.data, selectedIndustry]);

  const stocksTotal =
    stocksQuery.data?.pages[0]?.total ?? loadedStocks.length;

  const peerSymbols = useMemo(
    () => loadedStocks.map((s) => s.symbol),
    [loadedStocks],
  );
  const allSymbolsKey = peerSymbols.join(",");

  const quotesQuery = useQuery({
    queryKey: queryKeys.market.industryQuotes(
      assetType,
      industryId ?? "",
      allSymbolsKey,
    ),
    enabled: peerSymbols.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Parallel chunks — capped concurrency keeps the 1GB host calm.
      const chunks: string[][] = [];
      for (let i = 0; i < peerSymbols.length; i += 24) {
        chunks.push(peerSymbols.slice(i, i + 24));
      }
      const pages = await Promise.all(
        chunks.slice(0, 4).map((chunk) =>
          fetchJson<{ quotes?: Quote[] }>(
            `/api/quotes?assetType=${encodeURIComponent(assetType)}&symbols=${encodeURIComponent(chunk.join(","))}`,
          ),
        ),
      );
      return pages.flatMap((p) => p.quotes ?? []);
    },
  });

  const calcQuery = useQuery({
    queryKey: queryKeys.market.industryCalc(
      assetType,
      industryId ?? "",
      allSymbolsKey,
    ),
    enabled: peerSymbols.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const chunks: string[][] = [];
      for (let i = 0; i < peerSymbols.length; i += 48) {
        chunks.push(peerSymbols.slice(i, i + 48));
      }
      const pages = await Promise.all(
        chunks.slice(0, 2).map((chunk) =>
          fetchJson<{ rows?: SecurityCalcRow[] }>(
            `/api/quotes/calc?assetType=${encodeURIComponent(assetType)}&symbols=${encodeURIComponent(chunk.join(","))}`,
          ).catch(() => ({ rows: [] as SecurityCalcRow[] })),
        ),
      );
      return pages.flatMap((p) => p.rows ?? []);
    },
  });

  const loading =
    ranksQuery.isLoading ||
    (Boolean(industryId) && stocksQuery.isPending && !loadedStocks.length);

  const quoteBySymbol = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const q of quotesQuery.data ?? []) {
      map.set(q.symbol.toUpperCase(), q);
    }
    return map;
  }, [quotesQuery.data]);

  const calcBySymbol = useMemo(() => {
    const map = new Map<string, AnalysisCalcEnrich>();
    for (const r of calcQuery.data ?? []) {
      const enrich: AnalysisCalcEnrich = {
        marketCap: r.marketCap,
        turnoverRate: r.turnoverRate,
        amplitude: r.amplitude,
        volumeRatio: r.volumeRatio,
        changeSpeed: r.changeSpeed,
        change5d: r.change5d,
        change10d: r.change10d,
        change20d: r.change20d,
        change60d: r.change60d,
        change120d: r.change120d,
        change250d: r.change250d,
        changeYtd: r.changeYtd,
      };
      const keys = [r.localSymbol, r.symbol]
        .filter(Boolean)
        .map((s) => s.toUpperCase());
      for (const k of keys) map.set(k, enrich);
    }
    return map;
  }, [calcQuery.data]);

  const items: AnalysisTableRow[] = useMemo(
    () =>
      loadedStocks.map((s) => {
        const sym = s.symbol.toUpperCase();
        const norm = normalizeSymbol(s.symbol, assetType).toUpperCase();
        const calc =
          calcBySymbol.get(norm) ?? calcBySymbol.get(sym) ?? null;
        return toAnalysisTableRow(
          s,
          assetType,
          quoteBySymbol.get(sym) ?? quoteBySymbol.get(norm) ?? null,
          calc,
        );
      }),
    [loadedStocks, assetType, quoteBySymbol, calcBySymbol],
  );

  const loadingMore = stocksQuery.isFetchingNextPage;
  const hasMore = Boolean(stocksQuery.hasNextPage);
  const loadMoreGuard = useRef(false);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loadMoreGuard.current) return;
    loadMoreGuard.current = true;
    void stocksQuery.fetchNextPage().finally(() => {
      loadMoreGuard.current = false;
    });
  }, [hasMore, loadingMore, stocksQuery]);

  const industryMeta = selectedIndustry
    ? { id: selectedIndustry.id, name: selectedIndustry.name }
    : undefined;

  function enrichBasketQuote(symbol: string, type: AnalysisEquityType) {
    void (async () => {
      try {
        const data = await fetchJson<{ quote?: Quote }>(
          `/api/quotes?symbol=${encodeURIComponent(symbol)}&assetType=${type}`,
        );
        if (!data.quote) return;
        const q = data.quote;
        setBasket((prev) =>
          prev.map((b) =>
            b.symbol === q.symbol && b.assetType === q.assetType
              ? {
                  ...quoteToBasketItem(q, industryMeta),
                  industryId: industryMeta?.id,
                  industryName: industryMeta?.name,
                }
              : b,
          ),
        );
      } catch {
        /* keep stub */
      }
    })();
  }

  function addToBasket(item: AnalysisBasketItem): boolean {
    if (!selectedIndustry) return false;
    const inIndustry = loadedStocks.some((s) => s.symbol === item.symbol);
    if (!inIndustry) return false;

    const key = basketKey(item);
    if (basket.some((b) => basketKey(b) === key)) return true;
    if (basket.length >= ANALYSIS_BASKET_MAX) return false;

    const enriched: AnalysisBasketItem = {
      ...item,
      assetType,
      industryId: selectedIndustry.id,
      industryName: selectedIndustry.name,
    };
    setBasket((prev) => [...prev, enriched]);
    pushRecent({ symbol: item.symbol, assetType });
    enrichBasketQuote(item.symbol, assetType);
    return true;
  }

  function removeFromBasket(
    symbol: string,
    type: AnalysisBasketItem["assetType"],
  ) {
    setBasket((prev) =>
      prev.filter((b) => !(b.symbol === symbol && b.assetType === type)),
    );
  }

  function toggleBasket(item: AnalysisBasketItem): boolean {
    const key = basketKey(item);
    if (basket.some((b) => basketKey(b) === key)) {
      removeFromBasket(item.symbol, item.assetType);
      return true;
    }
    return addToBasket(item);
  }

  function clearBasket() {
    setBasket([]);
  }

  async function toggleWatch(
    symbol: string,
    type: AnalysisBasketItem["assetType"],
  ) {
    if (!session?.user) return;
    const key = `${type}:${symbol}`;
    const isOn = watched.has(key);
    if (isOn) {
      await removeWatch.mutateAsync({ symbol, assetType: type });
    } else {
      await addWatch.mutateAsync({ symbol, assetType: type });
    }
  }

  function loadIndustries(_type: AnalysisEquityType) {
    void ranksQuery.refetch();
  }

  const basketKeys = new Set(basket.map(basketKey));
  const industrySymbols = new Set(loadedStocks.map((s) => s.symbol));

  return {
    session,
    assetType,
    setAssetType,
    workspace,
    setWorkspace,
    industries,
    industryId,
    setIndustryId,
    selectedIndustry,
    items,
    loadedCount: loadedStocks.length,
    stocksTotal,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    basket,
    basketKeys,
    industrySymbols,
    recent,
    watched,
    loadIndustries,
    toggleBasket,
    removeFromBasket,
    clearBasket,
    addToBasket,
    toggleWatch,
    pushRecent: (item: AnalysisRecentItem) => pushRecent(item),
  };
}
