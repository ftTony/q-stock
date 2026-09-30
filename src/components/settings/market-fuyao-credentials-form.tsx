"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  MARKET_VENDORS_CHANGED,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";

type Status = MarketCredsStatus;

export function MarketFuyaoCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");
  const [apiKey, setApiKey] = useState("");

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
        body: JSON.stringify({ fuyao: { apiKey: apiKey.trim() } }),
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
    const res = await fetch("/api/user/market-credentials?provider=fuyao", {
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

  return (
    <div className="qt-panel w-full space-y-4 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{t("credsFuyao")}</h3>
        <span className="text-xs text-[var(--muted)]">
          {status?.fuyao?.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">{t("credsFuyaoHint")}</p>
      {message ? (
        <p
          className="text-sm"
          style={{
            color: messageKind === "ok" ? "var(--up)" : "var(--down)",
          }}
        >
          {message}
        </p>
      ) : null}
      <form onSubmit={onSave} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("credsFuyaoApiKey")}</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            className="qt-input w-full px-3 py-2.5 font-mono text-xs"
            placeholder={
              status?.fuyao?.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary h-[42px] px-4 text-sm"
            disabled={!apiKey.trim()}
          >
            {t("credsSaveFuyao")}
          </SubmitButton>
          {status?.fuyao?.configured ? (
            <button
              type="button"
              onClick={() => void onClear()}
              className="qt-btn h-[42px] px-4 text-sm"
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
