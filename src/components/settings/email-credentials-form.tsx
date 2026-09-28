"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import type {
  EmailChannel,
  EmailCredsStatus,
  ServiceCredsStatus,
} from "@/lib/user/service-creds-types";

export function EmailCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<EmailCredsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");

  const [channel, setChannel] = useState<EmailChannel>("resend");
  const [from, setFrom] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);

  async function refresh() {
    const res = await fetch("/api/user/service-credentials");
    if (!res.ok) return;
    const data = (await res.json()) as ServiceCredsStatus;
    setStatus(data.email);
    if (data.email.configured) {
      if (data.email.channel) setChannel(data.email.channel);
      if (data.email.from) setFrom(data.email.from);
    }
    return data.email;
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
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body =
        channel === "resend"
          ? {
              email: {
                channel: "resend" as const,
                from: from.trim(),
                resendApiKey: resendApiKey.trim() || undefined,
              },
            }
          : {
              email: {
                channel: "smtp" as const,
                from: from.trim(),
                smtpHost: smtpHost.trim() || undefined,
                smtpPort: Number(smtpPort) || 587,
                smtpUser: smtpUser.trim() || undefined,
                smtpPass: smtpPass.trim() || undefined,
                smtpSecure,
              },
            };
      const res = await fetch("/api/user/service-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessageKind("error");
        setMessage(
          typeof data.error === "string" ? data.error : t("emailSaveError"),
        );
        return;
      }
      setStatus((data as ServiceCredsStatus).email);
      setResendApiKey("");
      setSmtpPass("");
      setMessageKind("ok");
      setMessage(t("emailSaved"));
    } catch {
      setMessageKind("error");
      setMessage(t("emailSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        "/api/user/service-credentials?provider=email",
        { method: "DELETE" },
      );
      if (!res.ok) {
        setMessageKind("error");
        setMessage(t("emailSaveError"));
        return;
      }
      const data = (await res.json()) as ServiceCredsStatus;
      setStatus(data.email);
      setResendApiKey("");
      setSmtpPass("");
      setMessageKind("ok");
      setMessage(t("emailCleared"));
    } catch {
      setMessageKind("error");
      setMessage(t("emailSaveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="qt-panel space-y-3 p-5 sm:p-6">
        <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="qt-panel space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{t("emailTitle")}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("emailHint")}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{t("emailCompliance")}</p>
        <p className="mt-2 text-xs">
          <span
            className={
              status?.configured
                ? "text-[var(--up)]"
                : "text-[var(--muted)]"
            }
          >
            {status?.configured
              ? `${t("credsConfigured")}${status.channel ? ` · ${status.channel}` : ""}${status.from ? ` · ${status.from}` : ""}`
              : t("credsNotConfigured")}
          </span>
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("emailChannel")}</span>
          <QtSelect
            value={channel}
            onChange={(v) => setChannel(v as EmailChannel)}
            options={[
              { value: "resend", label: t("emailChannelResend") },
              { value: "smtp", label: t("emailChannelSmtp") },
            ]}
            disabled={saving}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("emailFrom")}</span>
          <input
            type="email"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
            disabled={saving}
            placeholder="alerts@example.com"
          />
        </label>

        {channel === "resend" ? (
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("emailResendKey")}</span>
            <input
              type="password"
              autoComplete="off"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder={
                status?.configured ? t("credsKeepPlaceholder") : undefined
              }
              className="qt-input w-full px-3 py-2.5"
              disabled={saving}
            />
          </label>
        ) : (
          <>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("emailSmtpHost")}</span>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="qt-input w-full px-3 py-2.5"
                disabled={saving}
                placeholder="smtp.example.com"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("emailSmtpPort")}</span>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="qt-input w-full px-3 py-2.5"
                disabled={saving}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("emailSmtpUser")}</span>
              <input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="qt-input w-full px-3 py-2.5"
                disabled={saving}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">{t("emailSmtpPass")}</span>
              <input
                type="password"
                autoComplete="off"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={
                  status?.configured ? t("credsKeepPlaceholder") : undefined
                }
                className="qt-input w-full px-3 py-2.5"
                disabled={saving}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
                disabled={saving}
              />
              <span className="text-[var(--muted)]">{t("emailSmtpSecure")}</span>
            </label>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary h-[42px] px-4 text-sm"
          >
            {t("emailSave")}
          </SubmitButton>
          {status?.configured ? (
            <button
              type="button"
              onClick={onClear}
              disabled={saving}
              className="qt-btn h-[42px] px-4 text-sm"
            >
              {t("credsClear")}
            </button>
          ) : null}
          {message ? (
            <p
              className={`text-sm ${messageKind === "ok" ? "text-[var(--up)]" : "text-[var(--down)]"}`}
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
