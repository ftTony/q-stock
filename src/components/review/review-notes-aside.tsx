"use client";

import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/format-number";
import type { ReviewNoteRow } from "@/hooks/query/use-review-notes";

type Props = {
  notes: ReviewNoteRow[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ReviewNotesAside({
  notes,
  loading,
  selectedId,
  onSelect,
}: Props) {
  const t = useTranslations("review");
  const tCommon = useTranslations("common");

  return (
    <aside className="qt-panel flex flex-col p-4 sm:p-5">
      <h2 className="font-semibold">{t("notesTitle")}</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">{t("notesHint")}</p>
      <ul className="mt-3 max-h-[min(28rem,60dvh)] space-y-2 overflow-y-auto qt-scroll">
        {loading && (
          <li className="text-sm text-[var(--muted)]">{tCommon("loading")}</li>
        )}
        {!loading && notes.length === 0 && (
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
                onClick={() => onSelect(n.id)}
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
  );
}
