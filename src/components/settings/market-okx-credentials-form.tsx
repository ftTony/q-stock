"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  MARKET_VENDORS_CHANGED,
  type MarketCredsStatus,
} from "@/lib/market/creds-status-client";
import {
  useDeleteMarketCredentials,
  useMarketCredentials,
  useSaveMarketCredentials,
} from "@/hooks/query/use-credentials";
import { queryKeys } from "@/lib/query/keys";

type Status = MarketCredsStatus;

type OkxValues = {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
};

export function MarketOkxCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const qc = useQueryClient();
  const { data: statusData, isLoading: loading, refetch } =
    useMarketCredentials();
  const saveMut = useSaveMarketCredentials();
  const deleteMut = useDeleteMarketCredentials();
  const status = statusData ?? null;
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<OkxValues>({
    defaultValues: { apiKey: "", apiSecret: "", passphrase: "" },
  });

  const apiKey = watch("apiKey");

  useEffect(() => {
    function onVendorsChanged(ev: Event) {
      const detail = (ev as CustomEvent<MarketCredsStatus>).detail;
      if (detail) {
        qc.setQueryData<Status>(queryKeys.credentials.market, (prev) =>
          prev ? { ...prev, ...detail } : detail,
        );
      } else {
        void refetch();
      }
    }
    window.addEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    return () => {
      window.removeEventListener(MARKET_VENDORS_CHANGED, onVendorsChanged);
    };
  }, [qc, refetch]);

  async function onSubmit(values: OkxValues) {
    clearFlash();
    try {
      await saveMut.mutateAsync({
        okx: {
          apiKey: values.apiKey.trim(),
          apiSecret: values.apiSecret.trim() || undefined,
          passphrase: values.passphrase.trim() || undefined,
        },
      });
      reset({ apiKey: "", apiSecret: "", passphrase: "" });
      flash("ok", t("credsSaved"));
    } catch (err) {
      flash(
        "error",
        err instanceof Error ? err.message : t("credsSaveError"),
      );
    }
  }

  async function onClear() {
    clearFlash();
    try {
      await deleteMut.mutateAsync("okx");
      flash("ok", t("credsCleared"));
    } catch {
      flash("error", t("credsSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

  if ((status?.cryptoVendor ?? "binance") !== "okx") {
    return null;
  }

  return (
    <div className="w-full space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("credsOkx")}</h3>
        <span className="text-[11px] text-[var(--muted)]">
          {status?.okx?.configured
            ? t("credsConfigured")
            : t("credsNotConfigured")}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)]">{t("credsOkxHint")}</p>
      {message ? (
        <p
          role="status"
          className="animate-[qtFade_0.25s_ease] rounded-lg px-3 py-1.5 text-xs"
          style={
            messageKind === "ok"
              ? {
                  background:
                    "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                }
              : {
                  background:
                    "color-mix(in srgb, var(--danger) 12%, transparent)",
                  color: "var(--danger)",
                }
          }
        >
          {messageKind === "ok" ? "✓ " : ""}
          {message}
        </p>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsBinanceApiKey")}
            </span>
            <input
              {...register("apiKey")}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
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
              placeholder={t("credsOkxOptional")}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("credsOkxPassphrase")}
            </span>
            <input
              type="password"
              {...register("passphrase")}
              autoComplete="off"
              className="qt-input h-9 w-full px-3 font-mono text-[14px] leading-none"
              placeholder={t("credsOkxOptional")}
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
            {t("credsSaveOkx")}
          </SubmitButton>
          {status?.okx?.configured ? (
            <button
              type="button"
              onClick={() => void onClear()}
              className={SETTINGS_BTN_GHOST}
            >
              {t("credsClear")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
