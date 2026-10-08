"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { formatDateTime } from "@/lib/format-number";

type ReviewContent = {
  whatWentWell: string[];
  whatToImprove: string[];
  emotionFlags: string[];
  nextChecklist: string[];
  summary: string;
};

type ReviewResult = ReviewContent & {
  period: "day" | "week";
  disclaimer?: string;
  noteId?: string;
  error?: string;
};

type NoteRow = {
  id: string;
  period: string;
  content: ReviewContent;
  createdAt: string;
};

function BulletList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-xs font-medium text-[var(--muted)]">{title}</h3>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewBody({
  content,
  labels,
}: {
  content: ReviewContent;
  labels: {
    summary: string;
    well: string;
    improve: string;
    emotions: string;
    checklist: string;
  };
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-medium text-[var(--muted)]">
          {labels.summary}
        </h3>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
          {content.summary}
        </p>
      </div>
      <BulletList title={labels.well} items={content.whatWentWell} />
      <BulletList title={labels.improve} items={content.whatToImprove} />
      <BulletList title={labels.emotions} items={content.emotionFlags} />
      <BulletList title={labels.checklist} items={content.nextChecklist} />
    </div>
  );
}

export function ReviewDesk() {
  const t = useTranslations("review");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<ReviewResult | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch("/api/ai/review");
      if (!res.ok) return;
      const data = (await res.json()) as { notes?: NoteRow[] };
      setNotes(data.notes ?? []);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function runReview() {
    setBusy(true);
    setError(null);
    setSelectedId(null);
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, locale, save: true }),
      });
      const data = (await res.json()) as ReviewResult;
      if (!res.ok) throw new Error(data.error || t("error"));
      setLatest(data);
      if (data.noteId) setSelectedId(data.noteId);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
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

  const sectionLabels = {
    summary: t("summary"),
    well: t("well"),
    improve: t("improve"),
    emotions: t("emotions"),
    checklist: t("checklist"),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="qt-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("generateTitle")}</h2>
            <p className="text-sm text-[var(--muted)]">{t("generateHint")}</p>
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
            <SubmitButton
              type="button"
              loading={busy}
              loadingLabel={tAi("loading")}
              onClick={() => void runReview()}
              className="qt-btn-primary h-9 px-3 text-sm"
            >
              {t("run")}
            </SubmitButton>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--down)]">{error}</p>}

        {display ? (
          <>
            <ReviewBody content={display} labels={sectionLabels} />
            <p className="text-[11px] text-[var(--muted)]">
              {latest?.disclaimer || tAi("disclaimer")}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("emptyLatest")}</p>
        )}
      </section>

      <aside className="qt-panel flex flex-col p-4 sm:p-5">
        <h2 className="font-semibold">{t("notesTitle")}</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">{t("notesHint")}</p>
        <ul className="mt-3 max-h-[min(28rem,60dvh)] space-y-2 overflow-y-auto qt-scroll">
          {loadingNotes && (
            <li className="text-sm text-[var(--muted)]">{tCommon("loading")}</li>
          )}
          {!loadingNotes && notes.length === 0 && (
            <li className="text-sm text-[var(--muted)]">{t("notesEmpty")}</li>
          )}
          {notes.map((n) => {
            const active = selectedId === n.id;
            const periodLabel =
              n.period === "week" ? t("periodWeek") : t("periodDay");
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(n.id);
                    setLatest(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-2)]/50"
                  }`}
                >
                  <div className="text-xs font-medium">{periodLabel}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                    {formatDateTime(n.createdAt)}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--foreground)]">
                    {n.content?.summary || "—"}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
