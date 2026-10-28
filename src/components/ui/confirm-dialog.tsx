"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  /** Destructive confirm (delete). */
  tone?: "default" | "danger";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** App-chrome confirm — replaces window.confirm for in-product flows. */
export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  tone = "default",
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  // Use --danger (not --down): CN/US change colors swap green/red meaning.
  const confirmClass =
    tone === "danger"
      ? "inline-flex h-8 items-center justify-center rounded-none bg-[var(--danger)] px-3.5 text-[12px] font-medium text-white hover:brightness-110 disabled:opacity-60"
      : "qt-btn qt-btn-primary h-8 rounded-none px-3.5 text-[12px]";

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={cancelLabel}
        disabled={busy}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        className="relative z-10 w-full max-w-sm rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <h2
          id="confirm-dialog-title"
          className="text-[15px] font-semibold tracking-tight"
        >
          {title}
        </h2>
        {description ? (
          <p
            id="confirm-dialog-desc"
            className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]"
          >
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-8 rounded-none px-3 text-[12px]"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <SubmitButton
            type="button"
            loading={busy}
            className={confirmClass}
            onClick={onConfirm}
          >
            {confirmLabel}
          </SubmitButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
