"use client";

import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Quote } from "@/lib/types";
import {
  ANALYSIS_BASKET_MAX,
  basketKey,
  industryStockToQuote,
  quoteToBasketItem,
  type AnalysisBasketItem,
  type AnalysisEquityType,
  type AnalysisRecentItem,
  type IndustryHeatCell,
} from "@/components/analysis/types";
import {
  useAddWatchlistItem,
  useRemoveWatchlistItem,
  useWatchlist,
} from "@/hooks/query/use-watchlist";
import { useIndustryRanks } from "@/hooks/query/use-market";
import { fetchJson } from "@/lib/query/fetch-json";
import { useAnalysisPageStore } from "@/stores/analysis-page-store";

export function useAnalysisPage(initialIndustries: IndustryHeatCell[]) {
  const { data: session } = useSession();
  const assetType = useAnalysisPageStore((s) => s.assetType);
  const workspace = useAnalysisPageStore((s) => s.workspace);
  const industryId = useAnalysisPageStore((s) => s.industryId);
  const basket = useAnalysisPageStore((s) => s.basket);
  const recent = useAnalysisPageStore((s) => s.recent);
  const sort = useAnalysisPageStore((s) => s.sort);
  const setAssetType = useAnalysisPageStore((s) => s.setAssetType);
  const setWorkspace = useAnalysisPageStore((s) => s.setWorkspace);
  const setIndustryId = useAnalysisPageStore((s) => s.setIndustryId);
  const setBasket = useAnalysisPageStore((s) => s.setBasket);
  const setSort = useAnalysisPageStore((s) => s.setSort);
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

  const loading = ranksQuery.isLoading;
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

  const items: Quote[] = useMemo(() => {
    if (!selectedIndustry) return [];
    const quotes = selectedIndustry.stocks.map((s) =>
      industryStockToQuote(s, assetType),
    );
    return [...quotes].sort((a, b) =>
      sort === "changeDesc"
        ? b.percentChange - a.percentChange
        : a.percentChange - b.percentChange,
    );
  }, [selectedIndustry, assetType, sort]);

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
    const inIndustry = selectedIndustry.stocks.some(
      (s) => s.symbol === item.symbol,
    );
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
  const industrySymbols = new Set(
    selectedIndustry?.stocks.map((s) => s.symbol) ?? [],
  );

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
    loading,
    error,
    basket,
    basketKeys,
    industrySymbols,
    recent,
    watched,
    sort,
    setSort,
    loadIndustries,
    toggleBasket,
    removeFromBasket,
    clearBasket,
    addToBasket,
    toggleWatch,
    pushRecent: (item: AnalysisRecentItem) => pushRecent(item),
  };
}
