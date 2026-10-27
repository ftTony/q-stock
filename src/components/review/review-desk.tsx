"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { AiQuotaBadge } from "@/components/ai/ai-quota-badge";
import { AiQuotaExhaustedHint } from "@/components/ai/ai-quota-exhausted";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { ReviewAiBody } from "@/components/review/review-ai-body";
import {
  ReviewFillsList,
  type FillFilter,
} from "@/components/review/review-fills-list";
import { ReviewNotesAside } from "@/components/review/review-notes-aside";
import { ReviewProcessSummary } from "@/components/review/review-process-summary";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { TopToast } from "@/components/ui/top-toast";
import {
  ReviewHttpError,
  useReviewNotes,
  useRunReview,
  type ReviewContent,
  type ReviewResult,
} from "@/hooks/query/use-review-notes";
import { useReviewProcess } from "@/hooks/query/use-review-process";

export function ReviewDesk() {
  const t = useTranslations("review");
  const tAi = useTranslations("ai");
  const locale = useLocale();
  const access = useAiAccess();
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [filter, setFilter] = useState<FillFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<ReviewResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const notesQuery = useReviewNotes(access.loggedIn);
  const processQuery = useReviewProcess(period, access.loggedIn);
  const runReviewMut = useRunReview();

  const notes = notesQuery.data?.notes ?? [];
  const process = processQuery.data;
  const busy = runReviewMut.isPending;

  async function runReview() {
    if (!access.loggedIn) return;
    if (!(await access.ensureQuota())) return;
    setError(null);
    setSelectedId(null);
    try {
      const data = await runReviewMut.mutateAsync({
        period,
        locale,
        save: true,
      });
      setLatest(data);
      if (data.noteId) setSelectedId(data.noteId);
      void access.refreshQuota();
    } catch (err) {
      if (err instanceof ReviewHttpError && access.handleAiHttpError(err.status)) {
        return;
      }
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const selected =
    selectedId != null
      ? notes.find((n) => n.id === selectedId) ?? null
      : null;

  const display: ReviewContent | null = selected
    ? selected.content
    : latest
      ? latest
      : null;

  const displayNoteId =
    selected?.id ?? latest?.noteId ?? selectedId ?? null;

  const sectionLabels = {
    summary: t("summary"),
    well: t("well"),
    improve: t("improve"),
    emotions: t("emotions"),
    checklist: t("checklist"),
  };

  if (!access.loggedIn && !access.sessionLoading) {
    return (
      <section className="qt-panel">
        <AiLoginGate className="min-h-[22rem]" />
      </section>
    );
  }

  const untaggedHint =
    process &&
    process.summary.fillCount > 0 &&
    process.summary.untaggedCount === process.summary.fillCount;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <section className="qt-panel space-y-4 p-4 sm:p-5">
          <TopToast
            key={access.toastKey}
            message={access.toastMsg}
            tone={access.toastTone}
            onDismiss={access.dismissToast}
          />

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t("processTitle")}</h2>
              <p className="text-sm text-[var(--muted)]">{t("processHint")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <QtSelect
                value={period}
                onChange={(v) => setPeriod(v as "day" | "week")}
                className="w-32"
                triggerClassName="h-9 px-2.5 text-sm"
                options={[
                  { value: "day", label: t("periodDay") },
                  { value: "week", label: t("periodWeek") },
                ]}
              />
            </div>
          </div>

          <div
            role="tablist"
            className="aw-chip-tabs aw-chip-tabs--flush"
          >
            {(
              [
                ["all", t("filterAll")],
                ["tagged", t("filterTagged")],
                ["flags", t("filterFlags")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                data-active={filter === value}
                onClick={() => setFilter(value)}
                className="aw-chip"
              >
                {label}
              </button>
            ))}
          </div>

          <ReviewProcessSummary
            summary={process?.summary}
            loading={processQuery.isLoading}
          />

          {untaggedHint ? (
            <p className="text-xs text-[var(--muted)]">{t("untaggedHint")}</p>
          ) : null}

          <ReviewFillsList
            fills={process?.fills ?? []}
            filter={filter}
            loading={processQuery.isLoading}
          />

          <p className="text-[11px] leading-snug text-[var(--muted)]">
            {t("footnote")}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/strategies" className="aw-text-link text-sm">
              {t("ctaStrategies")}
            </Link>
            <Link href="/portfolio" className="aw-text-link text-sm">
              {t("ctaPortfolio")}
            </Link>
          </div>
        </section>

        <section className="qt-panel space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t("generateTitle")}</h2>
              <p className="text-sm text-[var(--muted)]">{t("generateHint")}</p>
              {access.quota && access.quota.remaining > 0 ? (
                <AiQuotaBadge className="mt-1" />
              ) : null}
            </div>
            <SubmitButton
              type="button"
              loading={busy}
              showElapsed={(s) => tAi("elapsed", { seconds: s })}
              onClick={() => void runReview()}
              className="qt-btn-primary h-9 px-3"
              disabled={Boolean(access.quota && access.quota.remaining <= 0)}
            >
              {t("run")}
            </SubmitButton>
          </div>

          {access.quota && access.quota.remaining <= 0 ? (
            <AiQuotaExhaustedHint />
          ) : null}

          {error && <p className="text-sm text-[var(--down)]">{error}</p>}

          {display ? (
            <>
              <ReviewAiBody
                content={display}
                noteId={displayNoteId}
                labels={sectionLabels}
              />
              <p className="text-[11px] text-[var(--muted)]">
                {latest?.disclaimer || tAi("disclaimer")}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">{t("emptyLatest")}</p>
          )}
        </section>
      </div>

      <ReviewNotesAside
        notes={notes}
        loading={notesQuery.isLoading}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setLatest(null);
        }}
      />
    </div>
  );
}
