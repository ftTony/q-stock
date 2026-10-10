"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type AiTrendAnalysis } from "@/components/market/ai-analysis-panel";
import { emitAiQuotaChanged } from "@/lib/ai/quota-events";
import type { AssetType } from "@/lib/types";

function analysisKey(
  assetType: AssetType,
  symbol: string,
  locale: string,
) {
  return `${assetType}:${symbol.toUpperCase()}:${locale}`;
}

/** Load AI tab analysis at most once per day (server cache); optional force refresh. */
export function useSymbolAiAnalysis(
  symbol: string,
  assetType: AssetType,
  active: boolean,
) {
  const locale = useLocale();
  const tAi = useTranslations("ai");
  const { data: session } = useSession();
  const [aiAnalysis, setAiAnalysis] = useState<AiTrendAnalysis | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiDisclaimer, setAiDisclaimer] = useState<string | null>(null);
  const [aiCached, setAiCached] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRefreshing, setAiRefreshing] = useState(false);
  const [aiToast, setAiToast] = useState<string | null>(null);
  const [aiToastKey, setAiToastKey] = useState(0);
  const [degraded, setDegraded] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);

  const load = useCallback(
    async (opts?: { refresh?: boolean }) => {
      const key = analysisKey(assetType, symbol, locale);
      const refresh = Boolean(opts?.refresh);

      if (!session?.user) {
        setAiAvailable(null);
        setAiAnalysis(null);
        setAiMessage(null);
        setAiCached(false);
        loadedKeyRef.current = null;
        return { degraded: false };
      }

      if (!refresh && loadedKeyRef.current === key) {
        return { degraded: false };
      }

      setAiLoading(true);
      if (refresh) setAiRefreshing(true);

      try {
        const qs = new URLSearchParams({
          symbol,
          assetType,
          locale,
        });
        if (refresh) qs.set("refresh", "1");

        const res = await fetch(`/api/ai/analyze?${qs.toString()}`);
        const data = await res.json();

        if (res.status === 401) {
          setAiAvailable(null);
          setAiAnalysis(null);
          setAiMessage(null);
          loadedKeyRef.current = null;
          return { degraded: false };
        }
        if (res.status === 429) {
          setAiToast(tAi("quotaExceeded"));
          setAiToastKey((k) => k + 1);
          setAiAvailable(null);
          setAiMessage(null);
          emitAiQuotaChanged();
          return { degraded: false };
        }

        setAiAvailable(data.available !== false);
        setAiAnalysis(data.analysis ?? null);
        setAiMessage(data.message ?? data.error ?? null);
        setAiDisclaimer(data.disclaimer ?? null);
        setAiCached(Boolean(data.cached));
        loadedKeyRef.current = key;
        if (refresh || data.quota) emitAiQuotaChanged();

        const nextDegraded = Boolean(
          data.degraded || (!res.ok && data.available !== false),
        );
        setDegraded(nextDegraded);
        return { degraded: nextDegraded };
      } finally {
        setAiLoading(false);
        setAiRefreshing(false);
      }
    },
    [assetType, locale, session?.user, symbol, tAi],
  );

  useEffect(() => {
    loadedKeyRef.current = null;
    setAiAnalysis(null);
    setAiAvailable(null);
    setAiMessage(null);
    setAiDisclaimer(null);
    setAiCached(false);
    setAiRefreshing(false);
    setDegraded(false);
  }, [symbol, assetType, locale]);

  useEffect(() => {
    if (!active) return;
    void load();
  }, [active, load]);

  return {
    aiAnalysis,
    aiAvailable,
    aiMessage,
    aiDisclaimer,
    aiCached,
    aiLoading,
    aiRefreshing,
    aiToast,
    aiToastKey,
    aiDegraded: degraded,
    clearAiToast: () => setAiToast(null),
    regenerateAi: () => load({ refresh: true }),
  };
}
