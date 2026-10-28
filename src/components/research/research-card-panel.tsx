"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { fetchJson } from "@/lib/query/fetch-json";
import type { AssetType } from "@/lib/types";

type Card = {
  id: string;
  symbol: string;
  assetType: AssetType;
  whyWatch: string;
  question: string;
  watchConditions: string;
  risks: string;
  reviewAt: string | null;
};

/** Compact research card editor for a symbol (Free: 1 card total). */
export function ResearchCardPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("researchCard");
  const qc = useQueryClient();
  const [whyWatch, setWhyWatch] = useState("");
  const [question, setQuestion] = useState("");
  const [watchConditions, setWatchConditions] = useState("");
  const [risks, setRisks] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    queryKey: ["research-card", assetType, symbol],
    queryFn: () =>
      fetchJson<{ card: Card | null }>(
        `/api/research-cards?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      ),
  });

  useEffect(() => {
    const card = query.data?.card;
    if (!card) {
      setWhyWatch("");
      setQuestion("");
      setWatchConditions("");
      setRisks("");
      return;
    }
    setWhyWatch(card.whyWatch);
    setQuestion(card.question);
    setWatchConditions(card.watchConditions);
    setRisks(card.risks);
  }, [query.data?.card]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/research-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          assetType,
          whyWatch,
          question,
          watchConditions,
          risks,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        limit?: number;
      };
      if (!res.ok) {
        setMessageKind("err");
        setMessage(
          data.code === "PLAN_LIMIT_EXCEEDED"
            ? t("limitReached", { limit: data.limit ?? 1 })
            : data.error || t("saveError"),
        );
        return;
      }
      setMessageKind("ok");
      setMessage(t("saved"));
      await qc.invalidateQueries({ queryKey: ["research-card"] });
    } catch {
      setMessageKind("err");
      setMessage(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-2 border-t border-[var(--aw-hairline,var(--border))] pt-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("title")}
        </h3>
        <Link
          href="/pricing"
          className="text-[11px] text-[var(--brand-text)] underline"
        >
          {t("proHint")}
        </Link>
      </div>
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        {t("body")}
      </p>
      <form onSubmit={onSave} className="space-y-2">
        <Field
          label={t("whyWatch")}
          value={whyWatch}
          onChange={setWhyWatch}
          placeholder={t("whyWatchPh")}
        />
        <Field
          label={t("question")}
          value={question}
          onChange={setQuestion}
          placeholder={t("questionPh")}
        />
        <Field
          label={t("watchConditions")}
          value={watchConditions}
          onChange={setWatchConditions}
          placeholder={t("watchConditionsPh")}
        />
        <Field
          label={t("risks")}
          value={risks}
          onChange={setRisks}
          placeholder={t("risksPh")}
        />
        <SubmitButton
          type="submit"
          className="qt-btn qt-btn-ghost h-8 px-3 text-[12px]"
          disabled={busy}
        >
          {t("save")}
        </SubmitButton>
      </form>
      {message ? (
        <p
          role="status"
          className="text-[11px]"
          style={{
            color: messageKind === "ok" ? "var(--up)" : "var(--down)",
          }}
        >
          {messageKind === "err" && message.includes("limit") ? (
            <>
              {message}{" "}
              <Link href="/pricing" className="underline">
                {t("upgrade")}
              </Link>
            </>
          ) : (
            message
          )}
        </p>
      ) : null}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-[var(--muted)]">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="resize-y rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 py-1.5 text-[12px] leading-relaxed text-[var(--foreground)]"
      />
    </label>
  );
}
