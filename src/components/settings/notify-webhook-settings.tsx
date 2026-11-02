"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  useDeleteServiceCredentials,
  useSaveServiceCredentials,
  useServiceCredentials,
} from "@/hooks/query/use-credentials";
import type { OverseasNotifyPlatform } from "@/lib/user/service-creds-types";

type Kind = "feishu" | "overseas";

type Props = {
  kind: Kind;
};

type WebhookValues = {
  webhookUrl: string;
  platform: OverseasNotifyPlatform;
};

/** Feishu or overseas (Slack / Discord / Telegram) incoming webhook. */
export function NotifyWebhookSettings({ kind }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const status =
    kind === "feishu"
      ? credsQuery.data?.feishu
      : credsQuery.data?.notifyWebhook;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<WebhookValues>({
    defaultValues: {
      webhookUrl: "",
      platform: "slack",
    },
  });

  useEffect(() => {
    if (kind === "overseas" && status?.platform) {
      setValue("platform", status.platform);
    }
  }, [kind, status?.platform, setValue]);

  async function onSubmit(values: WebhookValues) {
    clearFlash();
    try {
      if (kind === "feishu") {
        await saveMut.mutateAsync({
          feishu: {
            webhookUrl: values.webhookUrl.trim() || undefined,
          },
        });
      } else {
        await saveMut.mutateAsync({
          notifyWebhook: {
            platform: values.platform,
            webhookUrl: values.webhookUrl.trim() || undefined,
          },
        });
      }
      setValue("webhookUrl", "");
      flash("ok", t("notifyWebhookSaved"));
    } catch {
      flash("error", t("notifyWebhookSaveError"));
    }
  }

  async function onClear() {
    clearFlash();
    try {
      await deleteMut.mutateAsync(
        kind === "feishu" ? "feishu" : "notify_webhook",
      );
      setValue("webhookUrl", "");
      flash("ok", t("notifyWebhookCleared"));
    } catch {
      flash("error", t("notifyWebhookSaveError"));
    }
  }

  const title =
    kind === "feishu" ? t("notifyFeishuTitle") : t("notifyOverseasTitle");
  const hint =
    kind === "feishu" ? t("notifyFeishuHint") : t("notifyOverseasHint");
  const busy = isSubmitting || deleteMut.isPending;

  return (
    <section className="space-y-2.5 border-t border-[var(--aw-hairline,var(--border))] pb-4 pt-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.2px]">{title}</h2>
      <p className="text-[13px] leading-relaxed text-[var(--muted)]">{hint}</p>
      <p className="text-[12px] text-[var(--muted)]">
        {status?.configured
          ? `${t("credsConfigured")}${status.hostHint ? ` · ${status.hostHint}` : ""}${
              status.platform ? ` · ${status.platform}` : ""
            }`
          : t("credsNotConfigured")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {kind === "overseas" ? (
          <label className="block space-y-2 text-sm">
            <span className="block leading-snug text-[var(--muted)]">
              {t("notifyOverseasPlatform")}
            </span>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <QtSelect
                  value={field.value}
                  onChange={(v) =>
                    field.onChange(v as OverseasNotifyPlatform)
                  }
                  options={[
                    { value: "slack", label: t("notifyPlatformSlack") },
                    { value: "discord", label: t("notifyPlatformDiscord") },
                    { value: "telegram", label: t("notifyPlatformTelegram") },
                    { value: "generic", label: t("notifyPlatformGeneric") },
                  ]}
                  disabled={busy}
                />
              )}
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("notifyWebhookUrl")}
          </span>
          <input
            type="url"
            {...register("webhookUrl", {
              required: !status?.configured,
            })}
            placeholder={
              status?.configured
                ? t("credsKeepPlaceholder")
                : kind === "feishu"
                  ? "https://open.feishu.cn/open-apis/bot/v2/hook/…"
                  : "https://hooks.slack.com/services/…"
            }
            className="qt-input h-9 w-full px-3 text-[14px] leading-none"
            disabled={busy}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <SubmitButton
            loading={isSubmitting}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
          >
            {t("save")}
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
              className="text-xs"
              style={{
                color: messageKind === "ok" ? "var(--up)" : "var(--down)",
              }}
            >
              {messageKind === "ok" ? "✓ " : ""}
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
