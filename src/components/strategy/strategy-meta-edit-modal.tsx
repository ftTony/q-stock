"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";

export function StrategyMetaEditModal({
  open,
  name,
  description,
  onClose,
  onSave,
}: {
  open: boolean;
  name: string;
  description: string;
  onClose: () => void;
  onSave: (next: { name: string; description: string }) => void;
}) {
  const t = useTranslations("strategies");
  const [draftName, setDraftName] = useState(name);
  const [draftDesc, setDraftDesc] = useState(description);

  useEffect(() => {
    if (!open) return;
    setDraftName(name);
    setDraftDesc(description);
  }, [open, name, description]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t("blockModalClose")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="strategy-meta-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl"
      >
        <h2
          id="strategy-meta-title"
          className="text-[15px] font-semibold tracking-tight"
        >
          {t("metaEditTitle")}
        </h2>
        <p className="mt-1 text-[12px] text-[var(--muted)]">
          {t("metaEditHint")}
        </p>

        <label className="mt-4 block space-y-1.5 text-sm">
          <span className="text-[12px] text-[var(--muted)]">{t("name")}</span>
          <input
            autoFocus
            className="qt-input h-9 w-full px-3 text-sm"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={t("blankStrategyName")}
          />
        </label>

        <label className="mt-3 block space-y-1.5 text-sm">
          <span className="text-[12px] text-[var(--muted)]">
            {t("description")}
          </span>
          <textarea
            className="qt-input min-h-[5rem] w-full resize-y px-3 py-2 text-sm leading-relaxed"
            value={draftDesc}
            onChange={(e) => setDraftDesc(e.target.value)}
            placeholder={t("blankStrategyDesc")}
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-8 px-3 text-[12px]"
            onClick={onClose}
          >
            {t("blockModalCancel")}
          </button>
          <SubmitButton
            type="button"
            className="qt-btn qt-btn-primary h-8 px-3.5 text-[12px]"
            onClick={() => {
              onSave({
                name: draftName.trim() || t("blankStrategyName"),
                description: draftDesc,
              });
              onClose();
            }}
          >
            {t("blockModalDone")}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}
