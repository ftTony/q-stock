"use client";

import { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { StrategyMetaEditModal } from "@/components/strategy/strategy-meta-edit-modal";
import { useStrategyBlocksStore } from "@/stores/strategy-blocks-store";

export function StrategyDetailHeader({
  name,
  description,
  canEdit,
  isTemplate,
  busy,
  deleting,
  onNameChange,
  onDescriptionChange,
  onSave,
  onDelete,
}: {
  name: string;
  description: string;
  canEdit: boolean;
  isTemplate: boolean;
  busy: boolean;
  deleting?: boolean;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: (e: FormEvent) => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("strategies");
  const edit = useStrategyBlocksStore((s) => s.edit);
  const openEdit = useStrategyBlocksStore((s) => s.openEdit);
  const closeEdit = useStrategyBlocksStore((s) => s.closeEdit);
  const metaOpen = edit?.kind === "meta";

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <form
          onSubmit={onSave}
          className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
              {isTemplate ? t("templates") : t("mine")}
            </span>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => canEdit && openEdit({ kind: "meta" })}
              className="block w-full truncate text-left text-[18px] font-semibold tracking-tight text-[var(--foreground)] hover:text-[var(--brand-text)] disabled:cursor-default disabled:hover:text-[var(--foreground)] sm:text-[20px]"
              title={canEdit ? t("metaEditHint") : undefined}
            >
              {name || t("blankStrategyName")}
            </button>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => canEdit && openEdit({ kind: "meta" })}
              className="block max-w-xl truncate text-left text-[12px] leading-relaxed text-[var(--muted)] hover:text-[var(--brand-text)] disabled:cursor-default disabled:hover:text-[var(--muted)]"
            >
              {description.trim()
                ? description
                : canEdit
                  ? t("metaAddNotes")
                  : t("description")}
            </button>
          </div>

          {canEdit ? (
            <div className="flex shrink-0 items-center gap-2">
              {onDelete ? (
                <SubmitButton
                  type="button"
                  loading={Boolean(deleting)}
                  loadingLabel={t("loading")}
                  disabled={busy || deleting}
                  onClick={onDelete}
                  className="qt-btn qt-btn-ghost h-8 border border-[var(--border)] px-3 text-[12px] text-[var(--down)] hover:border-[color-mix(in_srgb,var(--down)_40%,var(--border))]"
                >
                  {t("delete")}
                </SubmitButton>
              ) : null}
              <SubmitButton
                type="submit"
                loading={busy}
                loadingLabel={t("loading")}
                disabled={deleting}
                className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
              >
                {t("save")}
              </SubmitButton>
            </div>
          ) : null}
        </form>

        <div className="border-t border-[var(--border)] px-4 py-2 sm:px-5">
          <p className="text-[11px] leading-relaxed text-[var(--brand-text)]">
            {t("disclaimer")}
          </p>
        </div>
      </section>

      <StrategyMetaEditModal
        open={metaOpen}
        name={name}
        description={description}
        onClose={closeEdit}
        onSave={({ name: n, description: d }) => {
          onNameChange(n);
          onDescriptionChange(d);
        }}
      />
    </>
  );
}
