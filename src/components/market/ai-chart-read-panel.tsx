"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AiLoginButton } from "@/components/ai/ai-login-button";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import {
  clearChartReadHistory,
  loadChartReadHistory,
  saveChartReadHistory,
  type StoredChartRead,
} from "@/lib/ai/chart-read-history";
import type { AssetType } from "@/lib/types";

type ChartReadPayload = StoredChartRead & { error?: string };

export function AiChartReadPanel(props: {
  symbol: string;
  assetType: AssetType;
  /** `page` = dedicated AI desk (no top border). */
  layout?: "embed" | "page";
}) {
  const t = useTranslations("aiChart");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const access = useAiAccess();
  const [data, setData] = useState<ChartReadPayload | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = props.layout === "page";

  useEffect(() => {
    const saved = loadChartReadHistory(props.assetType, props.symbol, locale);
    setData(saved);
    setFromHistory(Boolean(saved));
    setError(null);
  }, [props.symbol, props.assetType, locale]);

  async function run() {
    if (!access.loggedIn) return;
    if (!(await access.ensureQuota())) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/chart-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: props.symbol,
          assetType: props.assetType,
          locale,
        }),
      });
      const json = (await res.json()) as ChartReadPayload;
      if (!res.ok) {
        if (access.handleAiHttpError(res.status)) return;
        throw new Error(json.error || t("error"));
      }
      setData(json);
      setFromHistory(false);
      saveChartReadHistory(props.assetType, props.symbol, locale, json);
      void access.refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  function onClear() {
    if (busy) return;
    clearChartReadHistory(props.assetType, props.symbol, locale);
    setData(null);
    setFromHistory(false);
    setError(null);
  }

  return (
    <div
      className={
        page
          ? "space-y-3"
          : "mt-6 space-y-3 border-t border-[var(--border)] pt-4"
      }
    >
      <TopToast
        key={access.toastKey}
        message={access.toastMsg}
        tone={access.toastTone}
        onDismiss={access.dismissToast}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{t("title")}</h3>
          <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
            {t("subtitle")}
          </p>
          {fromHistory && data ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{t("historyHint")}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {data ? (
            <button
              type="button"
              onClick={onClear}
              disabled={busy}
              className="qt-btn-ghost rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
            >
              {t("clearHistory")}
            </button>
          ) : null}
          {access.loggedIn ? (
            <SubmitButton
              type="button"
              loading={busy}
              showElapsed={(s) => tAi("elapsed", { seconds: s })}
              onClick={() => void run()}
              className="qt-btn-ghost border border-[var(--border)] px-4 py-2"
            >
              {data ? t("rerun") : t("run")}
            </SubmitButton>
          ) : (
            <AiLoginButton className="qt-btn-primary inline-flex h-10 items-center justify-center px-4 text-[14px] font-medium" />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-[var(--down)]">{error}</p>}

      {data && (
        <div className="space-y-3 text-[15px] leading-relaxed">
          <div>
            <h4 className="text-sm text-[var(--muted)]">{t("structure")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">{data.structure}</p>
          </div>
          {data.keyLevels?.length > 0 && (
            <div>
              <h4 className="text-sm text-[var(--muted)]">{t("keyLevels")}</h4>
              <p className="mt-0.5 tabular-nums">
                {data.keyLevels.map((n) => n.toFixed(2)).join(" · ")}
              </p>
            </div>
          )}
          <div>
            <h4 className="text-sm text-[var(--muted)]">{t("invalidation")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">
              {data.whatWouldChangeMind}
            </p>
          </div>
          {data.notes?.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-[var(--muted)]">
            {data.features?.barCount != null
              ? t("bars", { count: data.features.barCount })
              : null}
            {data.cached ? ` · ${tAi("cached")}` : null}
            {data.degraded ? ` · ${tCommon("degraded")}` : null}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {data.disclaimer || tAi("disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
