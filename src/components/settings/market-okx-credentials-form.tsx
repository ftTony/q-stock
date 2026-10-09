"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  MARKET_VENDORS_CHANGED,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";

type Status = MarketCredsStatus;

export function MarketOkxCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");

  async function refresh() {
    const res = await fetch("/api/user/market-credentials");
    if (!res.ok) return;
    setStatus((await res.json()) as Status);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onVendorsChanged(ev: Event) {
      const detail = (ev as CustomEvent<MarketCredsStatus>).detail;
      if (detail) {
        setStatus((prev) => (prev ? { ...prev, ...detail } : detail));
      } else {
        void refresh();
      }
    }
    window.addEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    return () => {
      window.removeEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    };
  }, []);

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
      const res = await fetch("/api/user/market-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          okx: {
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim() || undefined,
            passphrase: passphrase.trim() || undefined,
          },
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setMessageKind("error");
        setMessage(data?.error || t("credsSaveError"));
        return;
      }
      setApiKey("");
      setApiSecret("");
      setPassphrase("");
      await refresh();
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setMessage(null);
    const res = await fetch("/api/user/market-credentials?provider=okx", {
      method: "DELETE",
    });
    if (!res.ok) {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
      return;
    }
    await refresh();
    setMessageKind("ok");
    setMessage(t("credsCleared"));
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>;
  }

  if ((status?.cryptoVendor ?? "binance") !== "okx") {
    return null;
  }

  return (
    <div className="qt-panel w-full space-y-3 p-4">
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
