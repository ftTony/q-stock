"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
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

/** Feishu or overseas (Slack / Discord / Telegram) incoming webhook. */
export function NotifyWebhookSettings({ kind }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();

  const status =
    kind === "feishu"
      ? credsQuery.data?.feishu
      : credsQuery.data?.notifyWebhook;

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [platform, setPlatform] = useState<OverseasNotifyPlatform>("slack");

  useEffect(() => {
    if (kind === "overseas" && status?.platform) {
      setPlatform(status.platform);
    }
  }, [kind, status?.platform]);

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
      if (kind === "feishu") {
        await saveMut.mutateAsync({
          feishu: {
            webhookUrl: webhookUrl.trim() || undefined,
          },
        });
      } else {
        await saveMut.mutateAsync({
          notifyWebhook: {
            platform,
            webhookUrl: webhookUrl.trim() || undefined,
          },
        });
      }
      setWebhookUrl("");
      setMessageKind("ok");
      setMessage(t("notifyWebhookSaved"));
    } catch {
      setMessageKind("err");
      setMessage(t("notifyWebhookSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    setMessage(null);
    try {
      await deleteMut.mutateAsync(
        kind === "feishu" ? "feishu" : "notify_webhook",
      );
      setWebhookUrl("");
      setMessageKind("ok");
      setMessage(t("notifyWebhookCleared"));
    } catch {
      setMessageKind("err");
      setMessage(t("notifyWebhookSaveError"));
    } finally {
      setSaving(false);
    }
  }

  const title =
    kind === "feishu" ? t("notifyFeishuTitle") : t("notifyOverseasTitle");
  const hint =
    kind === "feishu" ? t("notifyFeishuHint") : t("notifyOverseasHint");

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

      <form onSubmit={onSave} className="space-y-3">
        {kind === "overseas" ? (
          <label className="block space-y-2 text-sm">
            <span className="block leading-snug text-[var(--muted)]">
              {t("notifyOverseasPlatform")}
            </span>
            <QtSelect
              value={platform}
              onChange={(v) => setPlatform(v as OverseasNotifyPlatform)}
              options={[
                { value: "slack", label: t("notifyPlatformSlack") },
                { value: "discord", label: t("notifyPlatformDiscord") },
                { value: "telegram", label: t("notifyPlatformTelegram") },
                { value: "generic", label: t("notifyPlatformGeneric") },
              ]}
              disabled={saving}
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm">
          <span className="block leading-snug text-[var(--muted)]">
            {t("notifyWebhookUrl")}
          </span>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder={
              status?.configured
                ? t("credsKeepPlaceholder")
                : kind === "feishu"
                  ? "https://open.feishu.cn/open-apis/bot/v2/hook/…"
                  : "https://hooks.slack.com/services/…"
            }
            className="qt-input h-9 w-full px-3 text-[14px] leading-none"
            disabled={saving}
            required={!status?.configured}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className={SETTINGS_SUBMIT_PRIMARY}
          >
            {t("save")}
          </SubmitButton>
          {status?.configured ? (
            <button
              type="button"
              onClick={() => void onClear()}
              disabled={saving}
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
