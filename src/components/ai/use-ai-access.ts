"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { ToastTone } from "@/components/ui/top-toast";
import { emitAiQuotaChanged } from "@/lib/ai/quota-events";

type Quota = { used: number; limit: number; remaining: number };

/** Session + quota + toast helpers for AI UI. */
export function useAiAccess() {
  const { status } = useSession();
  const tAi = useTranslations("ai");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("neutral");
  const [toastKey, setToastKey] = useState(0);

  const loggedIn = status === "authenticated";
  const sessionLoading = status === "loading";

  const refreshQuota = useCallback(async () => {
    if (status !== "authenticated") {
      setQuota(null);
      return null;
    }
    try {
      const res = await fetch("/api/ai/quota");
      if (!res.ok) {
        setQuota(null);
        return null;
      }
      const data = (await res.json()) as Quota;
      setQuota(data);
      emitAiQuotaChanged();
      return data;
    } catch {
      setQuota(null);
      return null;
    }
  }, [status]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota]);

  const showToast = useCallback((message: string, tone: ToastTone = "neutral") => {
    setToastTone(tone);
    setToastMsg(message);
    setToastKey((k) => k + 1);
  }, []);

  const dismissToast = useCallback(() => setToastMsg(null), []);

  /** Toast on 429; returns true if caller should stop (401/429). */
  const handleAiHttpError = useCallback(
    (httpStatus: number): boolean => {
      if (httpStatus === 401) {
        showToast(tAi("loginRequired"), "neutral");
        return true;
      }
      if (httpStatus === 429) {
        showToast(tAi("quotaExceeded"), "error");
        void refreshQuota();
        return true;
      }
      return false;
    },
    [refreshQuota, showToast, tAi],
  );

  /** If logged in but no remaining uses, toast and return false. */
  const ensureQuota = useCallback(async (): Promise<boolean> => {
    if (!loggedIn) return false;
    const q = quota ?? (await refreshQuota());
    if (q && q.remaining <= 0) {
      showToast(tAi("quotaExceeded"), "error");
      return false;
    }
    return true;
  }, [loggedIn, quota, refreshQuota, showToast, tAi]);

  return {
    loggedIn,
    sessionLoading,
    quota,
    refreshQuota,
    showToast,
    dismissToast,
    toastMsg,
    toastTone,
    toastKey,
    handleAiHttpError,
    ensureQuota,
    tAi,
  };
}
