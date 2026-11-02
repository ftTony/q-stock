"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { QtSelect } from "@/components/ui/qt-select";
import { SettingsHint } from "@/components/settings/settings-hint";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import type {
  EmailChannel,
  EmailCredsStatus,
} from "@/lib/user/service-creds-types";
import {
  useDeleteServiceCredentials,
  useSaveServiceCredentials,
  useServiceCredentials,
} from "@/hooks/query/use-credentials";

type Props = {
  /** Match settings modal density (通知 tab). */
  compact?: boolean;
};

type EmailFormValues = {
  channel: EmailChannel;
  from: string;
  resendApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
};

export function EmailCredentialsForm({ compact = false }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();
  const status: EmailCredsStatus | null = credsQuery.data?.email ?? null;
  const loading = credsQuery.isLoading;
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<EmailFormValues>({
    defaultValues: {
      channel: "resend",
      from: "",
      resendApiKey: "",
      smtpHost: "",
      smtpPort: "587",
      smtpUser: "",
      smtpPass: "",
      smtpSecure: false,
    },
  });

  const channel = watch("channel");

  useEffect(() => {
    const email = credsQuery.data?.email;
    if (!email?.configured) return;
    reset({
      channel: email.channel ?? "resend",
      from: email.from ?? "",
      resendApiKey: "",
      smtpHost: "",
      smtpPort: "587",
      smtpUser: "",
      smtpPass: "",
      smtpSecure: false,
    });
  }, [credsQuery.data?.email, reset]);

  async function onSubmit(values: EmailFormValues) {
    clearFlash();
    try {
      const body =
        values.channel === "resend"
          ? {
              email: {
                channel: "resend" as const,
                from: values.from.trim(),
                resendApiKey: values.resendApiKey.trim() || undefined,
              },
            }
          : {
              email: {
                channel: "smtp" as const,
                from: values.from.trim(),
                smtpHost: values.smtpHost.trim() || undefined,
                smtpPort: Number(values.smtpPort) || 587,
                smtpUser: values.smtpUser.trim() || undefined,
                smtpPass: values.smtpPass.trim() || undefined,
                smtpSecure: values.smtpSecure,
              },
            };
      await saveMut.mutateAsync(body);
      setValue("resendApiKey", "");
      setValue("smtpPass", "");
      flash("ok", t("emailSaved"));
    } catch (err) {
      flash(
        "error",
        err instanceof Error ? err.message : t("emailSaveError"),
      );
    }
  }

  async function onClear() {
    clearFlash();
    try {
      await deleteMut.mutateAsync("email");
      setValue("resendApiKey", "");
      setValue("smtpPass", "");
      flash("ok", t("emailCleared"));
    } catch {
      flash("error", t("emailSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

  const busy = isSubmitting || deleteMut.isPending;

  return (
    <div className={compact ? "space-y-2.5 pb-4" : "space-y-4"}>
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
              status?.configured ? "text-[var(--up)]" : "text-[var(--muted)]"
            }
          >
            {status?.configured
              ? `${t("credsConfigured")}${status.channel ? ` · ${status.channel}` : ""}${status.from ? ` · ${status.from}` : ""}`
              : t("credsNotConfigured")}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("emailChannel")}
          </span>
          <Controller
            name="channel"
            control={control}
            render={({ field }) => (
              <QtSelect
                value={field.value}
                onChange={(v) => field.onChange(v as EmailChannel)}
                options={[
                  { value: "resend", label: t("emailChannelResend") },
                  { value: "smtp", label: t("emailChannelSmtp") },
                ]}
                disabled={busy}
              />
            )}
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("emailFrom")}
          </span>
          <input
            type="email"
            {...register("from", { required: true })}
            className="qt-input h-9 w-full px-3 text-[14px] leading-none"
            disabled={busy}
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
              {...register("resendApiKey")}
              placeholder={
                status?.configured ? t("credsKeepPlaceholder") : undefined
              }
              className="qt-input h-9 w-full px-3 text-[14px] leading-none"
              disabled={busy}
            />
          </label>
        ) : (
          <>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpHost")}
              </span>
              <input
                {...register("smtpHost")}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
                placeholder="smtp.example.com"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpPort")}
              </span>
              <input
                {...register("smtpPort")}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpUser")}
              </span>
              <input
                {...register("smtpUser")}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="block leading-snug text-[var(--muted)]">
                {t("emailSmtpPass")}
              </span>
              <input
                type="password"
                autoComplete="off"
                {...register("smtpPass")}
                placeholder={
                  status?.configured ? t("credsKeepPlaceholder") : undefined
                }
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("smtpSecure")}
                disabled={busy}
              />
              <span className="text-[var(--muted)]">{t("emailSmtpSecure")}</span>
            </label>
          </>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <SubmitButton
            loading={isSubmitting}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
          >
            {compact ? t("save") : t("emailSave")}
          </SubmitButton>
          {status?.configured ? (
            <button
              type="button"
              onClick={() => void onClear()}
              disabled={busy}
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
