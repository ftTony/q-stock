"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  presetModelsForVendor,
  type AiCredsStatus,
  type AiVendor,
  type ServiceCredsStatus,
} from "@/lib/user/service-creds-types";

const CUSTOM = "__custom__";

export function AiCredentialsForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<AiCredsStatus | null>(null);
  const [loading, setLoading] = useState(true);
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

  async function refresh() {
    const res = await fetch("/api/user/service-credentials");
    if (!res.ok) return;
    const data = (await res.json()) as ServiceCredsStatus;
    setStatus(data.ai);
    if (data.ai.configured) {
      if (data.ai.vendor) setVendor(data.ai.vendor);
      if (data.ai.baseUrl) setBaseUrl(data.ai.baseUrl);
      if (data.ai.model && data.ai.vendor) {
        const presets = presetModelsForVendor(data.ai.vendor);
        if ((presets as readonly string[]).includes(data.ai.model)) {
          setModelPick(data.ai.model);
          setModelCustom("");
        } else {
          setModelPick(CUSTOM);
          setModelCustom(data.ai.model);
        }
      }
    }
    return data.ai;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const res = await fetch("/api/user/service-credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai: {
            vendor,
            apiKey: apiKey.trim() || undefined,
            model,
            baseUrl: showBaseUrl ? baseUrl.trim() || undefined : undefined,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessageKind("error");
        setMessage(
          typeof data.error === "string" ? data.error : t("aiSaveError"),
        );
        return;
      }
      setStatus((data as ServiceCredsStatus).ai);
      setApiKey("");
      setMessageKind("ok");
      setMessage(t("aiSaved"));
    } catch {
      setMessageKind("error");
      setMessage(t("aiSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/service-credentials?provider=ai", {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessageKind("error");
        setMessage(t("aiSaveError"));
        return;
      }
      const data = (await res.json()) as ServiceCredsStatus;
      setStatus(data.ai);
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
    return (
      <div className="qt-panel space-y-3 p-4">
        <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="qt-panel space-y-3 p-4">
      <div>
        <h2 className="text-sm font-semibold">{t("aiTitle")}</h2>
        <p className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--brand-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--foreground)]">
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
