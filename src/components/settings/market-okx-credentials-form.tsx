"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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

export function MarketOkxCredentialsForm() {
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
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");

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
      await saveMut.mutateAsync({
        okx: {
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim() || undefined,
          passphrase: passphrase.trim() || undefined,
        },
      });
      setApiKey("");
      setApiSecret("");
      setPassphrase("");
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
      await deleteMut.mutateAsync("okx");
      setMessageKind("ok");
      setMessage(t("credsCleared"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

  if ((status?.cryptoVendor ?? "binance") !== "okx") {
    return null;
  }

  return (
    <div className="w-full space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("credsOkx")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.okx?.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)]">{t("credsOkxHint")}</p>
      {message ? (
        <p
          role="status"
          className="animate-[qtFade_0.25s_ease] rounded-lg px-3 py-1.5 text-xs"
          style={
            messageKind === "ok"
              ? {
                  background:
                    "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                }
              : {
                  background:
                    "color-mix(in srgb, var(--danger) 12%, transparent)",
                  color: "var(--danger)",
                }
          }
        >
          {messageKind === "ok" ? "✓ " : ""}
          {message}
        </p>
      ) : null}
      <form onSubmit={onSave} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsBinanceApiKey")}
            </span>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsBinanceApiSecret")}
            </span>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
              placeholder={t("credsOkxOptional")}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsOkxPassphrase")}
            </span>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
              placeholder={t("credsOkxOptional")}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary h-9 px-3 font-medium"
            disabled={!apiKey.trim()}
          >
            {t("credsSaveOkx")}
          </SubmitButton>
          {status?.okx?.configured ? (
            <button
              type="button"
              onClick={onClear}
              className="qt-btn qt-btn-ghost h-9 px-3 font-medium"
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
