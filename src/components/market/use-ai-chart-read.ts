"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAiAccess } from "@/components/ai/use-ai-access";
import {
  clearChartReadHistory,
  loadChartReadHistory,
  saveChartReadHistory,
  type StoredChartRead,
} from "@/lib/ai/chart-read-history";
import type { AssetType } from "@/lib/types";

export type ChartReadPayload = StoredChartRead & { error?: string };

/** Shared chart-read state for header trigger + results body. */
export function useAiChartRead(symbol: string, assetType: AssetType) {
  const t = useTranslations("aiChart");
  const locale = useLocale();
  const access = useAiAccess();
  const [data, setData] = useState<ChartReadPayload | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadChartReadHistory(assetType, symbol, locale);
    setData(saved);
    setFromHistory(Boolean(saved));
    setError(null);
  }, [symbol, assetType, locale]);

  async function run() {
    if (!access.loggedIn) return;
    if (!(await access.ensureQuota())) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/chart-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, assetType, locale }),
      });
      const json = (await res.json()) as ChartReadPayload;
      if (!res.ok) {
        if (access.handleAiHttpError(res.status)) return;
        throw new Error(json.error || t("error"));
      }
      setData(json);
      setFromHistory(false);
      saveChartReadHistory(assetType, symbol, locale, json);
      void access.refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    if (busy) return;
    clearChartReadHistory(assetType, symbol, locale);
    setData(null);
    setFromHistory(false);
    setError(null);
  }

  return {
    access,
    data,
    fromHistory,
    busy,
    error,
    run,
    clear,
    hasResult: Boolean(data),
  };
}

export type AiChartReadController = ReturnType<typeof useAiChartRead>;
