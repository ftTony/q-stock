"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import {
  MARKET_VENDORS_CHANGED,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";
import {
  useDeleteMarketCredentials,
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";
import { queryKeys } from "@/lib/query/keys";

type Status = MarketCredsStatus;

export function MarketFuyaoCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const qc = useQueryClient();
  const { data: statusData, isLoading: loading, refetch } =
    useMarketCredentials();
  const saveMut = useSaveMarketCredentials();
  const deleteMut = useDeleteMarketCredentials();
  const status = statusData ?? null;

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    function onVendorsChanged(ev: Event) {
      const detail = (ev as CustomEvent<MarketCredsStatus>).detail;
      if (detail) {
        qc.setQueryData<Status>(queryKeys.credentials.market, (prev) =>
          prev ? { ...prev, ...detail } : detail,
        );
      } else {
        void refetch();
      }
    }
    window.addEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    return () => {
      window.removeEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    };
  }, [qc, refetch]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveMut.mutateAsync({ fuyao: { apiKey: apiKey.trim() } });
      setApiKey("");
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("credsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setMessage(null);
    try {
      await deleteMut.mutateAsync("fuyao");
      setMessageKind("ok");
      setMessage(t("credsCleared"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={2} label={tCommon("loading")} />;
  }

  return (
    <div className="w-full space-y-4 border-t border-[var(--aw-hairline,var(--border))] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("credsFuyao")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.fuyao?.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)]">{t("credsFuyaoHint")}</p>
      {message ? (
        <p
          className="text-xs"
          style={{
            color: messageKind === "ok" ? "var(--up)" : "var(--down)",
          }}
        >
          {message}
        </p>
      ) : null}
      <form onSubmit={onSave} className="space-y-3">
        <label className="block max-w-md space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsFuyaoApiKey")}
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={
              status?.fuyao?.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
            disabled={!apiKey.trim()}
          >
            {t("credsSaveFuyao")}
          </SubmitButton>
          {status?.fuyao?.configured ? (
            <button
              type="button"
              onClick={() => void onClear()}
              className={SETTINGS_BTN_GHOST}
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
