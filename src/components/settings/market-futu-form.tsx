"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import type { MarketCredsStatus } from "@/lib/market/creds-status-client";
import { useSaveMarketCredentials } from "@/hooks/query/use-credentials";

export type FutuMode = "appkey" | "bearer";

type FutuValues = {
  mode: FutuMode;
  appKey: string;
  privateKey: string;
  bearer: string;
};

type Props = {
  status: MarketCredsStatus | null;
  onSaved: (next: MarketCredsStatus | undefined) => void;
  onError: (msg: string) => void;
  onClear: () => void;
};

export function MarketFutuForm({ status, onSaved, onError, onClear }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const saveMut = useSaveMarketCredentials();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FutuValues>({
    defaultValues: {
      mode: status?.futu?.mode ?? "appkey",
      appKey: "",
      privateKey: "",
      bearer: "",
    },
  });

  useEffect(() => {
    if (status?.futu?.mode) setValue("mode", status.futu.mode);
  }, [status?.futu?.mode, setValue]);

  const mode = watch("mode");
  const appKey = watch("appKey");
  const privateKey = watch("privateKey");
  const bearer = watch("bearer");

  async function onSubmit(values: FutuValues) {
    try {
      const body =
        values.mode === "bearer"
          ? {
              futu: {
                mode: "bearer" as const,
                accessToken: values.bearer.trim(),
              },
            }
          : {
              futu: {
                mode: "appkey" as const,
                appKey: values.appKey.trim(),
                privateKey: values.privateKey.trim(),
              },
            };
      const next = await saveMut.mutateAsync(body);
      reset({
        mode: values.mode,
        appKey: "",
        privateKey: "",
        bearer: "",
      });
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
        <h3 className="text-sm font-semibold">{t("credsFutu")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.futu.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsFutuMode")}
          </span>
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <QtSelect
                value={field.value}
                onChange={(v) => field.onChange(v as FutuMode)}
                options={[
                  { value: "appkey", label: t("credsFutuModeAppKey") },
                  { value: "bearer", label: t("credsFutuModeBearer") },
                ]}
              />
            )}
          />
        </div>
        {mode === "appkey" ? (
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsAppKey")}
            </span>
            <input
              {...register("appKey")}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
              placeholder={
                status?.futu.configured ? t("credsKeepPlaceholder") : ""
              }
            />
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsAccessToken")}
            </span>
            <input
              type="password"
              {...register("bearer")}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
              placeholder={
                status?.futu.configured ? t("credsKeepPlaceholder") : ""
              }
            />
          </label>
        )}
        {mode === "appkey" ? (
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsPrivateKey")}
            </span>
            <textarea
              {...register("privateKey")}
              rows={3}
              autoComplete="off"
              className="qt-input w-full px-3 py-2 font-mono text-[14px] leading-relaxed"
              placeholder={
                status?.futu.configured
                  ? t("credsKeepPlaceholder")
                  : t("credsPrivateKeyHint")
              }
            />
          </label>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <SubmitButton
          loading={isSubmitting}
          loadingLabel={tCommon("loading")}
          className={SETTINGS_SUBMIT_PRIMARY}
          disabled={
            mode === "bearer"
              ? !bearer.trim()
              : !appKey.trim() || !privateKey.trim()
          }
        >
          {t("credsSaveFutu")}
        </SubmitButton>
        {status?.futu.configured ? (
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
