"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { QtSelect } from "@/components/ui/qt-select";
import { SettingsHint } from "@/components/settings/settings-hint";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import type { EmailChannel, EmailCredsStatus } from "@/lib/user/service-creds-types";
import {
  useDeleteServiceCredentials,
  useSaveServiceCredentials,
  useServiceCredentials,
} from "@/hooks/query/use-credentials";

type Props = {
  /** Match settings modal density (通知 tab). */
  compact?: boolean;
};

export function EmailCredentialsForm({ compact = false }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();
  const status: EmailCredsStatus | null = credsQuery.data?.email ?? null;
  const loading = credsQuery.isLoading;

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

  useEffect(() => {
    const email = credsQuery.data?.email;
    if (!email?.configured) return;
    if (email.channel) setChannel(email.channel);
    if (email.from) setFrom(email.from);
  }, [credsQuery.data?.email]);

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
      await saveMut.mutateAsync(body);
      setResendApiKey("");
      setSmtpPass("");
      setMessageKind("ok");
      setMessage(t("emailSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("emailSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    setMessage(null);
    try {
      await deleteMut.mutateAsync("email");
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
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

  return (
    <div
      className={
        compact
          ? "space-y-2.5 pb-4"
          : "space-y-4"
      }
    >
      <div>
        <h2
          className={
            compact
              ? "text-[15px] font-semibold tracking-[-0.2px]"
              : "text-lg font-semibold"
          }
        >
          {t("emailTitle")}
        </h2>
        {compact ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
            {t("emailHint")}
          </p>
        ) : (
          <SettingsHint tone="trust" className="mt-2">
            {t("credsTrustNote")}
          </SettingsHint>
        )}
        <p className={compact ? "mt-1.5 text-[12px]" : "mt-2 text-xs"}>
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

      <form onSubmit={onSave} className="space-y-3.5">
        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("emailChannel")}
          </span>
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

        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("emailFrom")}
          </span>
          <input
            type="email"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="qt-input h-9 w-full px-3 text-[14px] leading-none"
            disabled={saving}
            placeholder="alerts@example.com"
          />
        </label>

        {channel === "resend" ? (
          <label className="block space-y-2 text-sm">
            <span className="block leading-snug text-[var(--muted)]">
              {t("emailResendKey")}
            </span>
            <input
              type="password"
              autoComplete="off"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              placeholder={
                status?.configured ? t("credsKeepPlaceholder") : undefined
              }
              className="qt-input h-9 w-full px-3 text-[14px] leading-none"
              disabled={saving}
            />
          </label>
        ) : (
          <>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpHost")}
              </span>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={saving}
                placeholder="smtp.example.com"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpPort")}
              </span>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={saving}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpUser")}
              </span>
              <input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={saving}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpPass")}
              </span>
              <input
                type="password"
                autoComplete="off"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={
                  status?.configured ? t("credsKeepPlaceholder") : undefined
                }
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
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

        <div className="flex flex-wrap items-center gap-2.5">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
          >
            {compact ? t("save") : t("emailSave")}
          </SubmitButton>
          {status?.configured ? (
            <button
              type="button"
              onClick={onClear}
              disabled={saving}
              className={SETTINGS_BTN_GHOST}
            >
              {t("credsClear")}
            </button>
          ) : null}
          {message ? (
            <p
              role="status"
              className={`text-xs leading-none ${messageKind === "ok" ? "text-[var(--up)]" : "text-[var(--down)]"}`}
            >
              {messageKind === "ok" ? "✓ " : ""}
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
