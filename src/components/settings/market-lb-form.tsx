"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SubmitButton } from "@/components/ui/submit-button";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";
import { useSaveMarketCredentials } from "@/hooks/query/use-credentials";

type LbValues = {
  appKey: string;
  appSecret: string;
  accessToken: string;
};

type Props = {
  status: MarketCredsStatus | null;
  onSaved: (next: MarketCredsStatus | undefined) => void;
  onError: (msg: string) => void;
  onClear: () => void;
};

export function MarketLbForm({ status, onSaved, onError, onClear }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const saveMut = useSaveMarketCredentials();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<LbValues>({
    defaultValues: { appKey: "", appSecret: "", accessToken: "" },
  });

  const appKey = watch("appKey");
  const appSecret = watch("appSecret");
  const accessToken = watch("accessToken");

  async function onSubmit(values: LbValues) {
    try {
      const next = await saveMut.mutateAsync({
        longbridge: {
          appKey: values.appKey.trim(),
          appSecret: values.appSecret.trim(),
          accessToken: values.accessToken.trim(),
        },
      });
      reset({ appKey: "", appSecret: "", accessToken: "" });
      onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : t("credsSaveError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 border-t border-[var(--border)] pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("credsLongbridge")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.longbridge.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsAppKey")}
          </span>
          <input
            {...register("appKey")}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsAppSecret")}
          </span>
          <input
            type="password"
            {...register("appSecret")}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsAccessToken")}
          </span>
          <input
            type="password"
            {...register("accessToken")}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={
              status?.longbridge.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <SubmitButton
          loading={isSubmitting}
          loadingLabel={tCommon("loading")}
          className={SETTINGS_SUBMIT_PRIMARY}
          disabled={
            !appKey.trim() || !appSecret.trim() || !accessToken.trim()
          }
        >
          {t("credsSaveLongbridge")}
        </SubmitButton>
        {status?.longbridge.configured ? (
          <button
            type="button"
            onClick={onClear}
            className={SETTINGS_BTN_GHOST}
          >
            {t("credsClear")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
