"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  CREDS_DISMISS_KEY,
  hasAnyBrokerCreds,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";

type Status = MarketCredsStatus;

type FutuMode = "appkey" | "bearer";

export function MarketCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupKeys = searchParams.get("setupKeys") === "1";
  const panelRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLb, setSavingLb] = useState(false);
  const [savingFutu, setSavingFutu] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");

  const [lbKey, setLbKey] = useState("");
  const [lbSecret, setLbSecret] = useState("");
  const [lbToken, setLbToken] = useState("");

  const [futuMode, setFutuMode] = useState<FutuMode>("appkey");
  const [futuAppKey, setFutuAppKey] = useState("");
  const [futuPrivateKey, setFutuPrivateKey] = useState("");
  const [futuBearer, setFutuBearer] = useState("");

  async function refreshStatus() {
    const res = await fetch("/api/user/market-credentials");
    if (!res.ok) return;
    const data = (await res.json()) as Status;
    setStatus(data);
    if (data.futu.mode) setFutuMode(data.futu.mode);
    return data;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshStatus();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!setupKeys || loading) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setupKeys, loading]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  function onCredsSaved(next: Status | undefined) {
    try {
      sessionStorage.removeItem(CREDS_DISMISS_KEY);
    } catch {
      /* ignore */
    }
    if (setupKeys && hasAnyBrokerCreds(next)) {
      router.replace("/settings");
    }
  }

  async function saveLongbridge(e: FormEvent) {
    e.preventDefault();
    setSavingLb(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/market-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          longbridge: {
            appKey: lbKey.trim(),
            appSecret: lbSecret.trim(),
            accessToken: lbToken.trim(),
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
      setLbKey("");
      setLbSecret("");
      setLbToken("");
      const next = await refreshStatus();
      onCredsSaved(next);
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
    } finally {
      setSavingLb(false);
    }
  }

  async function saveFutu(e: FormEvent) {
    e.preventDefault();
    setSavingFutu(true);
    setMessage(null);
    try {
      const body =
        futuMode === "bearer"
          ? {
              futu: {
                mode: "bearer" as const,
                accessToken: futuBearer.trim(),
              },
            }
          : {
              futu: {
                mode: "appkey" as const,
                appKey: futuAppKey.trim(),
                privateKey: futuPrivateKey.trim(),
              },
            };
      const res = await fetch("/api/user/market-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setMessageKind("error");
        setMessage(data?.error || t("credsSaveError"));
        return;
      }
      setFutuAppKey("");
      setFutuPrivateKey("");
      setFutuBearer("");
      const next = await refreshStatus();
      onCredsSaved(next);
      setMessageKind("ok");
      setMessage(t("credsSaved"));
    } catch {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
    } finally {
      setSavingFutu(false);
    }
  }

  async function clearProvider(provider: "longbridge" | "futu") {
    setMessage(null);
    const res = await fetch(
      `/api/user/market-credentials?provider=${provider}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setMessageKind("error");
      setMessage(t("credsSaveError"));
      return;
    }
    await refreshStatus();
    setMessageKind("ok");
    setMessage(t("credsCleared"));
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>;
  }

  const highlight =
    setupKeys && !hasAnyBrokerCreds(status)
      ? "ring-2 ring-[var(--brand)]"
      : "";

  return (
    <div
      ref={panelRef}
      id="market-credentials"
      className={`qt-panel w-full space-y-6 p-5 sm:p-6 lg:p-8 ${highlight}`}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {t("credsTitle")}
        </h2>
        {setupKeys && !hasAnyBrokerCreds(status) ? (
          <p className="mt-2 rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            {t("credsSetupBanner")}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--muted)]">{t("credsHint")}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{t("credsCompliance")}</p>
      </div>

      {message && (
        <p
          role="status"
          className="animate-[qtFade_0.25s_ease] rounded-lg px-3 py-2 text-sm"
          style={
            messageKind === "ok"
              ? {
                  background: "color-mix(in srgb, var(--up) 12%, transparent)",
                  color: "var(--up)",
                }
              : {
                  background: "color-mix(in srgb, var(--down) 12%, transparent)",
                  color: "var(--down)",
                }
          }
        >
          {messageKind === "ok" ? "✓ " : ""}
          {message}
        </p>
      )}

      <form
        onSubmit={saveLongbridge}
        className="space-y-3 border-t border-[var(--border)] pt-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">{t("credsLongbridge")}</h3>
          <span className="text-xs text-[var(--muted)]">
            {status?.longbridge.configured
              ? t("credsConfigured")
              : t("credsNotConfigured")}
          </span>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("credsAppKey")}</span>
          <input
            value={lbKey}
            onChange={(e) => setLbKey(e.target.value)}
            autoComplete="off"
            className="qt-input w-full px-3 py-2.5 font-mono text-xs"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("credsAppSecret")}</span>
          <input
            type="password"
            value={lbSecret}
            onChange={(e) => setLbSecret(e.target.value)}
            autoComplete="off"
            className="qt-input w-full px-3 py-2.5 font-mono text-xs"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("credsAccessToken")}</span>
          <input
            type="password"
            value={lbToken}
            onChange={(e) => setLbToken(e.target.value)}
            autoComplete="off"
            className="qt-input w-full px-3 py-2.5 font-mono text-xs"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <SubmitButton
            loading={savingLb}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary px-4 py-2 text-sm"
            disabled={!lbKey.trim() || !lbSecret.trim() || !lbToken.trim()}
          >
            {t("credsSaveLongbridge")}
          </SubmitButton>
          {status?.longbridge.configured ? (
            <button
              type="button"
              onClick={() => clearProvider("longbridge")}
              className="qt-btn px-4 py-2 text-sm"
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>

      <form
        onSubmit={saveFutu}
        className="space-y-3 border-t border-[var(--border)] pt-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">{t("credsFutu")}</h3>
          <span className="text-xs text-[var(--muted)]">
            {status?.futu.configured
              ? t("credsConfigured")
              : t("credsNotConfigured")}
          </span>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("credsFutuMode")}</span>
          <QtSelect
            value={futuMode}
            onChange={(v) => setFutuMode(v as FutuMode)}
            options={[
              { value: "appkey", label: t("credsFutuModeAppKey") },
              { value: "bearer", label: t("credsFutuModeBearer") },
            ]}
          />
        </label>
        {futuMode === "appkey" ? (
          <>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("credsAppKey")}</span>
              <input
                value={futuAppKey}
                onChange={(e) => setFutuAppKey(e.target.value)}
                autoComplete="off"
                className="qt-input w-full px-3 py-2.5 font-mono text-xs"
                placeholder={
                  status?.futu.configured ? t("credsKeepPlaceholder") : ""
                }
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("credsPrivateKey")}</span>
              <textarea
                value={futuPrivateKey}
                onChange={(e) => setFutuPrivateKey(e.target.value)}
                rows={4}
                autoComplete="off"
                className="qt-input w-full px-3 py-2.5 font-mono text-xs"
                placeholder={
                  status?.futu.configured
                    ? t("credsKeepPlaceholder")
                    : t("credsPrivateKeyHint")
                }
              />
            </label>
          </>
        ) : (
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("credsAccessToken")}</span>
            <input
              type="password"
              value={futuBearer}
              onChange={(e) => setFutuBearer(e.target.value)}
              autoComplete="off"
              className="qt-input w-full px-3 py-2.5 font-mono text-xs"
              placeholder={
                status?.futu.configured ? t("credsKeepPlaceholder") : ""
              }
            />
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <SubmitButton
            loading={savingFutu}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary px-4 py-2 text-sm"
            disabled={
              futuMode === "bearer"
                ? !futuBearer.trim()
                : !futuAppKey.trim() || !futuPrivateKey.trim()
            }
          >
            {t("credsSaveFutu")}
          </SubmitButton>
          {status?.futu.configured ? (
            <button
              type="button"
              onClick={() => clearProvider("futu")}
              className="qt-btn px-4 py-2 text-sm"
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
