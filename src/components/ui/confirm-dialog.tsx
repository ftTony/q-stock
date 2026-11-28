"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  /** Structured content (e.g. order details) rendered between copy and actions. */
  details?: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  /** Destructive confirm (delete). */
  tone?: "default" | "danger";
  /** Optional CSS color for a thin top accent bar (e.g. trade side). */
  accentBar?: string;
  /** Optional CSS color for the confirm button (e.g. trade side). */
  confirmColor?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** App-chrome confirm — replaces window.confirm for in-product flows. */
export function ConfirmDialog({
  open,
  title,
  description,
  details,
  cancelLabel,
  confirmLabel,
  tone = "default",
  accentBar,
  confirmColor,
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
      ? "inline-flex h-10 items-center justify-center !rounded-none bg-[var(--danger)] px-5 text-[13px] font-semibold text-white hover:brightness-110 disabled:opacity-60"
      : "qt-btn qt-btn-primary h-10 !rounded-none px-5 text-[13px] font-semibold";
  const confirmStyle = confirmColor ? { background: confirmColor } : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={cancelLabel}
        disabled={busy}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.32)]"
      >
        {accentBar ? (
          <div className="h-1 w-full" style={{ background: accentBar }} />
        ) : null}
        {/* Header — closed by a full-bleed hairline when details follow. */}
        <div
          className={`px-5 pb-4 pt-5 ${
            details ? "border-b border-[var(--aw-hairline,var(--border))]" : ""
          }`}
        >
          <h2
            id="confirm-dialog-title"
            className="text-[17px] font-semibold tracking-tight text-[var(--foreground)]"
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
        </div>
        {details ? <div className="px-5 py-4">{details}</div> : null}
        {/* Full-bleed divider above the actions — spans the dialog width. */}
        <div className="border-t border-[var(--aw-hairline,var(--border))]">
          <div className="flex justify-end gap-2.5 px-5 py-3.5">
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-10 !rounded-none px-5 text-[13px] font-medium"
              disabled={busy}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <SubmitButton
              type="button"
              loading={busy}
              className={confirmClass}
              style={confirmStyle}
              onClick={onConfirm}
            >
              {confirmLabel}
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
