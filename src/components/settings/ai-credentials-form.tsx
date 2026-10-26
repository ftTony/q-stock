"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { QtSelect } from "@/components/ui/qt-select";
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

const CUSTOM = "__custom__";

export function AiCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const credsQuery = useServiceCredentials();
  const saveMut = useSaveServiceCredentials();
  const deleteMut = useDeleteServiceCredentials();
  const status: AiCredsStatus | null = credsQuery.data?.ai ?? null;
  const loading = credsQuery.isLoading;

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");

  const [vendor, setVendor] = useState<AiVendor>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [modelPick, setModelPick] = useState<string>(
    presetModelsForVendor("deepseek")[0],
  );
  const [modelCustom, setModelCustom] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const ai = credsQuery.data?.ai;
    if (!ai?.configured) return;
    if (ai.vendor) setVendor(ai.vendor);
    if (ai.baseUrl) setBaseUrl(ai.baseUrl);
    if (ai.model && ai.vendor) {
      const presets = presetModelsForVendor(ai.vendor);
      if ((presets as readonly string[]).includes(ai.model)) {
        setModelPick(ai.model);
        setModelCustom("");
      } else {
        setModelPick(CUSTOM);
        setModelCustom(ai.model);
      }
    }
  }, [credsQuery.data?.ai]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const presets = presetModelsForVendor(vendor);
    if (vendor === "openai_compat") {
      setModelPick(CUSTOM);
      return;
    }
    setModelPick((p) =>
      (presets as readonly string[]).includes(p) || p === CUSTOM
        ? p
        : presets[0] || CUSTOM,
    );
  }, [vendor]);

  const presetModels = presetModelsForVendor(vendor);
  const modelOptions = [
    ...presetModels.map((m) => ({ value: m, label: m })),
    { value: CUSTOM, label: t("aiModelCustom") },
  ];

  const showBaseUrl = vendor !== "openai";

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const model =
      modelPick === CUSTOM ? modelCustom.trim() : modelPick.trim();
    try {
      await saveMut.mutateAsync({
        ai: {
          vendor,
          apiKey: apiKey.trim() || undefined,
          model,
          baseUrl: showBaseUrl ? baseUrl.trim() || undefined : undefined,
        },
      });
      setApiKey("");
      setMessageKind("ok");
      setMessage(t("aiSaved"));
    } catch (err) {
      setMessageKind("error");
      setMessage(err instanceof Error ? err.message : t("aiSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    setMessage(null);
    try {
      await deleteMut.mutateAsync("ai");
      setApiKey("");
      setMessageKind("ok");
      setMessage(t("aiCleared"));
    } catch {
      setMessageKind("error");
      setMessage(t("aiSaveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PanelSkeleton rows={3} label={tCommon("loading")} />;
  }

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

      <form onSubmit={onSave} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiVendor")}
            </span>
            <QtSelect
              value={vendor}
              onChange={(v) => setVendor(v as AiVendor)}
              options={[
                { value: "deepseek", label: t("aiVendorDeepseek") },
                { value: "openai", label: t("aiVendorOpenai") },
                { value: "gemini", label: t("aiVendorGemini") },
                { value: "anthropic", label: t("aiVendorAnthropic") },
                { value: "openai_compat", label: t("aiVendorCompat") },
              ]}
              disabled={saving}
            />
          </div>
          <label className="block space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiApiKey")}
            </span>
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                status?.configured ? t("credsKeepPlaceholder") : undefined
              }
              className="qt-input h-9 w-full px-3 text-[14px] leading-none"
              disabled={saving}
            />
          </label>
          <div className="space-y-1.5">
            <span className="block text-xs text-[var(--muted)]">
              {t("aiModel")}
            </span>
            <QtSelect
              value={modelPick}
              onChange={setModelPick}
              options={modelOptions}
              disabled={saving}
            />
          </div>
          {showBaseUrl ? (
            <label className="block space-y-1.5">
              <span className="block text-xs text-[var(--muted)]">
                {t("aiBaseUrl")}
              </span>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={
                  vendor === "openai_compat"
                    ? "https://api.example.com/v1"
                    : t("aiBaseUrlOptional")
                }
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={saving}
                required={vendor === "openai_compat"}
              />
            </label>
          ) : null}
          {modelPick === CUSTOM ? (
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-xs text-[var(--muted)]">
                {t("aiModelId")}
              </span>
              <input
                required
                value={modelCustom}
                onChange={(e) => setModelCustom(e.target.value)}
                className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                disabled={saving}
                placeholder="claude-opus-4-20250514"
              />
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary h-9 px-3 font-medium"
          >
            {t("aiSave")}
          </SubmitButton>
          {status?.configured ? (
            <button
              type="button"
              onClick={onClear}
              disabled={saving}
              className="qt-btn qt-btn-ghost h-9 px-3 font-medium"
            >
              {t("credsClear")}
            </button>
          ) : null}
          {message ? (
            <p
              className={`text-xs ${messageKind === "ok" ? "text-[var(--up)]" : "text-[var(--down)]"}`}
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
