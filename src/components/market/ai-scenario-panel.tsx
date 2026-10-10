"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import type { AssetType } from "@/lib/types";

type PaperDraft = {
  side?: "buy" | "sell";
  type?: "limit" | "stop";
  price?: number;
  rationale: string;
  sizeHintPct: number;
};

type ScenarioPayload = {
  regimes: Array<{
    name: string;
    probability: number;
    invalidation: string;
    watchLevels: number[];
  }>;
  paperDraft: PaperDraft | null;
  calmReminder: string;
  disclaimer?: string;
  error?: string;
};

export function AiScenarioPanel(props: {
  symbol: string;
  assetType: AssetType;
  cashBalance?: number | null;
  onApplyDraft?: (draft: {
    side: "buy" | "sell";
    type: "limit" | "stop";
    price: number;
    qtyHint?: number;
  }) => void;
}) {
  const t = useTranslations("aiScenario");
  const tAi = useTranslations("ai");
  const locale = useLocale();
  const access = useAiAccess();
  const [data, setData] = useState<ScenarioPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!access.loggedIn) return;
    if (!(await access.ensureQuota())) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: props.symbol,
          assetType: props.assetType,
          locale,
        }),
      });
      const json = (await res.json()) as ScenarioPayload;
      if (!res.ok) {
        if (access.handleAiHttpError(res.status)) return;
        throw new Error(json.error || t("error"));
      }
      setData(json);
      void access.refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  function applyDraft() {
    const d = data?.paperDraft;
    if (!d?.side || !d.type || !(d.price != null && d.price > 0)) return;
    let qtyHint: number | undefined;
    if (props.cashBalance != null && d.side === "buy" && d.price > 0) {
      const notional = (props.cashBalance * d.sizeHintPct) / 100;
      qtyHint = Math.max(1, Math.floor(notional / d.price));
    }
    props.onApplyDraft?.({
      side: d.side,
      type: d.type,
      price: d.price,
      qtyHint,
    });
  }

  if (!access.loggedIn && !access.sessionLoading) {
    return (
      <div className="qt-panel">
        <AiLoginGate className="min-h-[14rem] py-8" />
      </div>
    );
  }

  return (
    <div className="qt-panel space-y-3 p-3 sm:p-4">
      <TopToast
        key={access.toastKey}
        message={access.toastMsg}
        tone={access.toastTone}
        onDismiss={access.dismissToast}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-[var(--muted)]">{t("subtitle")}</p>
        </div>
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={tAi("loading")}
          onClick={() => void run()}
          className="qt-btn-ghost shrink-0 border border-[var(--border)] px-2.5 py-1 text-xs"
        >
          {t("run")}
        </SubmitButton>
      </div>

      {error && <p className="text-xs text-[var(--down)]">{error}</p>}

      {data && (
        <div className="space-y-3 text-sm">
          <ul className="space-y-2">
            {data.regimes.map((r, i) => (
              <li
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2"
              >
                <div className="flex justify-between gap-2 font-medium">
                  <span>{r.name}</span>
                  <span className="tabular-nums text-[var(--muted)]">
                    {Math.round(r.probability * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {t("invalidation")}: {r.invalidation}
                </p>
                {r.watchLevels.length > 0 && (
                  <p className="mt-1 text-xs tabular-nums">
                    {t("levels")}:{" "}
                    {r.watchLevels.map((n) => n.toFixed(2)).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {data.paperDraft && (
            <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2">
              <p className="text-xs font-medium text-[var(--muted)]">
                {t("draft")}
              </p>
              <p className="mt-1 text-sm">
                {(data.paperDraft.side || "—").toUpperCase()}{" "}
                {data.paperDraft.type || "—"} @{" "}
                {data.paperDraft.price?.toFixed(2) ?? "—"} · ≤
                {data.paperDraft.sizeHintPct}%
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {data.paperDraft.rationale}
              </p>
              {props.onApplyDraft &&
                data.paperDraft.side &&
                data.paperDraft.type &&
                data.paperDraft.price != null && (
                  <SubmitButton
                    type="button"
                    onClick={applyDraft}
                    className="qt-btn-primary mt-2 px-2.5 py-1 text-xs"
                  >
                    {t("applyDraft")}
                  </SubmitButton>
                )}
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">{data.calmReminder}</p>
          <p className="text-[11px] text-[var(--muted)]">
            {data.disclaimer || tAi("disclaimer")} · {t("paperOnly")}
          </p>
        </div>
      )}
    </div>
  );
}
