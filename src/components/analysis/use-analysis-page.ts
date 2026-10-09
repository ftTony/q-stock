"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { Quote } from "@/lib/types";
import {
  ANALYSIS_BASKET_MAX,
  ANALYSIS_RECENT_KEY,
  ANALYSIS_RECENT_MAX,
  basketKey,
  industryStockToQuote,
  quoteToBasketItem,
  type AnalysisBasketItem,
  type AnalysisEquityType,
  type AnalysisRecentItem,
  type AnalysisWorkspace,
  type IndustryHeatCell,
} from "@/components/analysis/types";

function readRecent(): AnalysisRecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANALYSIS_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisRecentItem[];
    return Array.isArray(parsed) ? parsed.slice(0, ANALYSIS_RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: AnalysisRecentItem[]) {
  try {
    localStorage.setItem(ANALYSIS_RECENT_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function useAnalysisPage(initialIndustries: IndustryHeatCell[]) {
  const { data: session } = useSession();
  const [assetType, setAssetTypeState] = useState<AnalysisEquityType>("stock");
  const [workspace, setWorkspace] = useState<AnalysisWorkspace>("boards");
  const [industries, setIndustries] =
    useState<IndustryHeatCell[]>(initialIndustries);
  const [industryId, setIndustryIdState] = useState<string | null>(
    initialIndustries[0]?.id ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [basket, setBasket] = useState<AnalysisBasketItem[]>([]);
  const [recent, setRecent] = useState<AnalysisRecentItem[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"changeDesc" | "changeAsc">("changeDesc");
  const skipFirstLoad = useRef(true);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

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

  const loadIndustries = useCallback(async (type: AnalysisEquityType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/industry-ranks?assetType=${type}&limit=40`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load industries");
      const list = (data.industries ?? []) as IndustryHeatCell[];
      // weight ≈ industry market cap (treemap area)
      const sorted = [...list].sort((a, b) => b.weight - a.weight);
      setIndustries(sorted);
      setIndustryIdState(sorted[0]?.id ?? null);
      setBasket([]);
      if (data.degraded && sorted.length === 0) {
        setError("unavailable");
      }
    } catch (err) {
      setIndustries([]);
      setIndustryIdState(null);
      setBasket([]);
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    void loadIndustries(assetType);
  }, [assetType, loadIndustries]);

  function setAssetType(type: AnalysisEquityType) {
    setAssetTypeState(type);
    setWorkspace("boards");
  }

  function setIndustryId(id: string) {
    if (id === industryId) return;
    setIndustryIdState(id);
    setBasket([]);
    setWorkspace("boards");
  }

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

  function pushRecent(item: AnalysisRecentItem) {
    setRecent((prev) => {
      const next = [
        item,
        ...prev.filter(
          (r) =>
            !(r.symbol === item.symbol && r.assetType === item.assetType),
        ),
      ].slice(0, ANALYSIS_RECENT_MAX);
      writeRecent(next);
      return next;
    });
  }

  function enrichBasketQuote(symbol: string, type: AnalysisEquityType) {
    void (async () => {
      try {
        const res = await fetch(
          `/api/quotes?symbol=${encodeURIComponent(symbol)}&assetType=${type}`,
        );
        const data = await res.json();
        if (!res.ok || !data.quote) return;
        const q = data.quote as Quote;
        setBasket((prev) =>
          prev.map((b) =>
            b.symbol === q.symbol && b.assetType === q.assetType
              ? { ...quoteToBasketItem(q, industryMeta), industryId: industryMeta?.id, industryName: industryMeta?.name }
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

  function removeFromBasket(symbol: string, type: AnalysisBasketItem["assetType"]) {
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

  async function toggleWatch(symbol: string, type: AnalysisBasketItem["assetType"]) {
    if (!session?.user) return;
    const key = `${type}:${symbol}`;
    const isOn = watched.has(key);
    if (isOn) {
      await fetch(`/api/watchlist?symbol=${symbol}&assetType=${type}`, {
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
        body: JSON.stringify({ symbol, assetType: type }),
      });
      if (res.ok) {
        setWatched((prev) => new Set(prev).add(key));
      }
    }
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
    pushRecent,
  };
}
