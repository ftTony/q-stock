"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import { formatNumber } from "@/lib/format-number";
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

export type ApplyDraftPayload = {
  side: "buy" | "sell";
  type: "limit" | "stop";
  price: number;
  qtyHint?: number;
  invalidationNote?: string;
};

export function AiScenarioPanel(props: {
  symbol: string;
  assetType: AssetType;
  cashBalance?: number | null;
  onApplyDraft?: (draft: ApplyDraftPayload) => void;
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

  function buildPayload(withQty: boolean): ApplyDraftPayload | null {
    const d = data?.paperDraft;
    if (!d?.side || !d.type || !(d.price != null && d.price > 0)) return null;
    let qtyHint: number | undefined;
    if (
      withQty &&
      props.cashBalance != null &&
      d.side === "buy" &&
      d.price > 0
    ) {
      const notional = (props.cashBalance * d.sizeHintPct) / 100;
      qtyHint = Math.max(1, Math.floor(notional / d.price));
    }
    return {
      side: d.side,
      type: d.type,
      price: d.price,
      qtyHint,
      invalidationNote: data?.regimes[0]?.invalidation,
    };
  }

  if (!access.loggedIn && !access.sessionLoading) {
    return (
      <div className="p-3">
        <AiLoginGate className="min-h-[14rem] py-8" />
      </div>
    );
  }

  const draft = data?.paperDraft;
  const canApply =
    Boolean(props.onApplyDraft) &&
    Boolean(draft?.side && draft.type && draft.price != null && draft.price > 0);

  const qtyHint =
    draft &&
    props.cashBalance != null &&
    draft.side === "buy" &&
    draft.price != null &&
    draft.price > 0
      ? Math.max(
          1,
          Math.floor((props.cashBalance * draft.sizeHintPct) / 100 / draft.price),
        )
      : null;

  return (
    <div className="space-y-0 p-3">
      <TopToast
        key={access.toastKey}
        message={access.toastMsg}
        tone={access.toastTone}
        onDismiss={access.dismissToast}
      />
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h3 className="aw-caption-strong">{t("title")}</h3>
          <p className="aw-caption mt-1">{t("subtitle")}</p>
        </div>
        <SubmitButton
          type="button"
          loading={busy}
          showElapsed={(s) => tAi("elapsed", { seconds: s })}
          onClick={() => void run()}
          className="h-8 shrink-0 !rounded-none !border-0 !bg-transparent !px-2 !py-0 !text-[13px] font-medium !text-[var(--brand-text)] shadow-none"
        >
          {t("run")}
        </SubmitButton>
      </div>

      {error && (
        <p className="border-t border-[var(--border)] py-2 text-xs text-[var(--down)]">
          {error}
        </p>
      )}

      {data && (
        <div className="divide-y divide-[var(--border)] text-[13px]">
          <ul className="divide-y divide-[var(--border)]">
            {data.regimes.map((r, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium tracking-[-0.08px]">{r.name}</p>
                  <p className="aw-caption mt-0.5">
                    {t("invalidation")}: {r.invalidation}
                  </p>
                  {r.watchLevels.length > 0 && (
                    <p className="aw-caption mt-1 tabular-nums">
                      {t("levels")}:{" "}
                      {r.watchLevels.map((n) => n.toFixed(2)).join(" · ")}
                    </p>
                  )}
                </div>
                <span className="aw-caption shrink-0 tabular-nums">
                  {Math.round(r.probability * 100)}%
                </span>
              </li>
            ))}
          </ul>

          {data.calmReminder ? (
            <div className="py-2.5">
              <p className="aw-caption-strong text-[12px]">{t("calmTitle")}</p>
              <p className="aw-caption mt-1">{data.calmReminder}</p>
            </div>
          ) : null}

          {draft && canApply ? (
            <div className="space-y-2.5 py-3">
              <p className="aw-caption-strong text-[12px]">{t("draft")}</p>
              <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1.5 text-[12px]">
                <dt className="aw-metric-label">{t("draftSide")}</dt>
                <dd
                  className={
                    draft.side === "sell"
                      ? "font-medium text-[var(--down)]"
                      : "font-medium text-[var(--up)]"
                  }
                >
                  {draft.side === "sell" ? t("sideSell") : t("sideBuy")}
                  {" · "}
                  {draft.type === "stop" ? t("typeStop") : t("typeLimit")}
                </dd>
                <dt className="aw-metric-label">{t("draftQty")}</dt>
                <dd className="tabular-nums">
                  {qtyHint != null
                    ? formatNumber(qtyHint, { maximumFractionDigits: 0 })
                    : t("chipSize", { pct: draft.sizeHintPct })}
                </dd>
                <dt className="aw-metric-label">{t("draftPrice")}</dt>
                <dd className="tabular-nums">
                  {draft.price != null
                    ? formatNumber(draft.price, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </dd>
              </dl>
              {draft.rationale ? (
                <p className="border-t border-[var(--border)] pt-2 text-[11px] leading-snug text-[var(--muted)]">
                  {draft.rationale}
                </p>
              ) : null}
              <SubmitButton
                type="button"
                onClick={() => {
                  const p = buildPayload(true);
                  if (p) props.onApplyDraft?.(p);
                }}
                className="!mt-1 w-full !rounded-full !border-0 !bg-[var(--brand)] !py-2.5 !text-[14px] font-normal !text-white"
              >
                {t("applyAndGo")}
              </SubmitButton>
            </div>
          ) : null}

          <p className="aw-caption py-2.5">
            {data.disclaimer || tAi("disclaimer")} · {t("paperOnly")}
          </p>
        </div>
      )}
    </div>
  );
}
