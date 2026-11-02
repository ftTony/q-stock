"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { QtSelect } from "@/components/ui/qt-select";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  presetModelsForVendor,
  type AiCredsStatus,
  type AiVendor,
} from "@/lib/user/service-creds-types";
import {
  useDeleteServiceCredentials,
  useSaveServiceCredentials,
  useServiceCredentials,
} from "@/hooks/query/use-credentials";
import { trackBillingClick } from "@/lib/billing/client-events";

const CUSTOM = "__custom__";

type AiFormValues = {
  vendor: AiVendor;
  apiKey: string;
  modelPick: string;
  modelCustom: string;
  baseUrl: string;
};

export function AiCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();
  const status: AiCredsStatus | null = credsQuery.data?.ai ?? null;
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
  } = useForm<AiFormValues>({
    defaultValues: {
      vendor: "deepseek",
      apiKey: "",
      modelPick: presetModelsForVendor("deepseek")[0],
      modelCustom: "",
      baseUrl: "",
    },
  });

  const vendor = watch("vendor");
  const modelPick = watch("modelPick");
  const showBaseUrl = vendor !== "openai";

  useEffect(() => {
    const ai = credsQuery.data?.ai;
    if (!ai?.configured) return;
    const nextVendor = ai.vendor ?? "deepseek";
    let nextPick = presetModelsForVendor(nextVendor)[0] || CUSTOM;
    let nextCustom = "";
    if (ai.model && ai.vendor) {
      const presets = presetModelsForVendor(ai.vendor);
      if ((presets as readonly string[]).includes(ai.model)) {
        nextPick = ai.model;
      } else {
        nextPick = CUSTOM;
        nextCustom = ai.model;
      }
    }
    reset({
      vendor: nextVendor,
      apiKey: "",
      modelPick: nextPick,
      modelCustom: nextCustom,
      baseUrl: ai.baseUrl ?? "",
    });
  }, [credsQuery.data?.ai, reset]);

  useEffect(() => {
    const presets = presetModelsForVendor(vendor);
    if (vendor === "openai_compat") {
      setValue("modelPick", CUSTOM);
      return;
    }
    const next =
      (presets as readonly string[]).includes(modelPick) ||
      modelPick === CUSTOM
        ? modelPick
        : presets[0] || CUSTOM;
    if (next !== modelPick) setValue("modelPick", next);
  }, [vendor, setValue, modelPick]);

  const presetModels = presetModelsForVendor(vendor);
  const modelOptions = [
    ...presetModels.map((m) => ({ value: m, label: m })),
    { value: CUSTOM, label: t("aiModelCustom") },
  ];

  async function onSubmit(values: AiFormValues) {
    clearFlash();
    const model =
      values.modelPick === CUSTOM
        ? values.modelCustom.trim()
        : values.modelPick.trim();
    try {
      await saveMut.mutateAsync({
        ai: {
          vendor: values.vendor,
          apiKey: values.apiKey.trim() || undefined,
          model,
          baseUrl:
            values.vendor !== "openai"
              ? values.baseUrl.trim() || undefined
              : undefined,
        },
      });
      setValue("apiKey", "");
      flash("ok", t("aiSaved"));
      void trackBillingClick("click_byok");
    } catch (err) {
      flash("error", err instanceof Error ? err.message : t("aiSaveError"));
    }
  }

  async function onClear() {
    clearFlash();
    try {
      await deleteMut.mutateAsync("ai");
      setValue("apiKey", "");
      flash("ok", t("aiCleared"));
    } catch {
      flash("error", t("aiSaveError"));
    }
  }

  if (loading) {
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

  const busy = isSubmitting || deleteMut.isPending;

  return (
    <div className="space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
          {t("aiTitle")}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          {t("credsTrustNote")}
        </p>
        <p className="mt-2 text-[11px]">
          <span
            className={
              status?.configured ? "text-[var(--up)]" : "text-[var(--muted)]"
            }
          >
            {status?.configured
              ? `${t("credsConfigured")}${status.vendor ? ` · ${status.vendor}` : ""}${status.model ? ` · ${status.model}` : ""}`
              : t("credsNotConfigured")}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiVendor")}
            </span>
            <Controller
              name="vendor"
              control={control}
              render={({ field }) => (
                <QtSelect
                  value={field.value}
                  onChange={(v) => field.onChange(v as AiVendor)}
                  options={[
                    { value: "deepseek", label: t("aiVendorDeepseek") },
                    { value: "openai", label: t("aiVendorOpenai") },
                    { value: "gemini", label: t("aiVendorGemini") },
                    { value: "anthropic", label: t("aiVendorAnthropic") },
                    { value: "openai_compat", label: t("aiVendorCompat") },
                  ]}
                  disabled={busy}
                />
              )}
            />
          </div>
          <label className="block space-y-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiApiKey")}
            </span>
            <input
              type="password"
              autoComplete="off"
              {...register("apiKey")}
              placeholder={
                status?.configured ? t("credsKeepPlaceholder") : undefined
              }
              className="qt-input h-9 w-full px-3 text-[14px] leading-none"
              disabled={busy}
            />
          </label>
          <div className="space-y-2">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiModel")}
            </span>
            <Controller
              name="modelPick"
              control={control}
              render={({ field }) => (
                <QtSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={modelOptions}
                  disabled={busy}
                />
              )}
            />
          </div>
          {showBaseUrl ? (
            <label className="block space-y-2">
              <span className="block text-xs text-[var(--muted)]">
                {t("aiBaseUrl")}
              </span>
              <input
                type="url"
                {...register("baseUrl", {
                  required: vendor === "openai_compat",
                })}
                placeholder={
                  vendor === "openai_compat"
                    ? "https://api.example.com/v1"
                    : t("aiBaseUrlOptional")
                }
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
              />
            </label>
          ) : null}
          {modelPick === CUSTOM ? (
            <label className="block space-y-2 sm:col-span-2">
              <span className="block text-xs text-[var(--muted)]">
                {t("aiModelId")}
              </span>
              <input
                {...register("modelCustom", { required: true })}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={busy}
                placeholder="claude-opus-4-20250514"
              />
            </label>
          ) : null}
        </div>

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
