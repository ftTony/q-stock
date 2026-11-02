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

type BnValues = {
  apiKey: string;
  apiSecret: string;
};

type Props = {
  status: MarketCredsStatus | null;
  onSaved: (next: MarketCredsStatus | undefined) => void;
  onError: (msg: string) => void;
  onClear: () => void;
};

export function MarketBinanceForm({
  status,
  onSaved,
  onError,
  onClear,
}: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const saveMut = useSaveMarketCredentials();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<BnValues>({
    defaultValues: { apiKey: "", apiSecret: "" },
  });

  const apiKey = watch("apiKey");

  async function onSubmit(values: BnValues) {
    try {
      const next = await saveMut.mutateAsync({
        binance: {
          apiKey: values.apiKey.trim(),
          apiSecret: values.apiSecret.trim() || undefined,
        },
      });
      reset({ apiKey: "", apiSecret: "" });
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
        <h3 className="text-sm font-semibold">{t("credsBinance")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.binance?.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)]">{t("credsBinanceHint")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsBinanceApiKey")}
          </span>
          <input
            {...register("apiKey")}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={
              status?.binance?.configured ? t("credsKeepPlaceholder") : ""
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-xs text-[var(--muted)]">
            {t("credsBinanceApiSecret")}
          </span>
          <input
            type="password"
            {...register("apiSecret")}
            autoComplete="off"
            className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
            placeholder={t("credsBinanceSecretOptional")}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <SubmitButton
          loading={isSubmitting}
          loadingLabel={tCommon("loading")}
          className={SETTINGS_SUBMIT_PRIMARY}
          disabled={!apiKey.trim()}
        >
          {t("credsSaveBinance")}
        </SubmitButton>
        {status?.binance?.configured ? (
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
