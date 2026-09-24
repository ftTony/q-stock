"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ToastTone = "success" | "error" | "neutral";

type Props = {
  message: string | null;
  tone?: ToastTone;
  durationMs?: number;
  onDismiss?: () => void;
};

const toneClass: Record<ToastTone, string> = {
  success: "border-[var(--up)]/40 bg-[var(--panel)] text-[var(--up)]",
  error: "border-[var(--down)]/40 bg-[var(--panel)] text-[var(--down)]",
  neutral: "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)]",
};

export function TopToast({
  message,
  tone = "neutral",
  durationMs = 2800,
  onDismiss,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const hide = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);
    return () => window.clearTimeout(hide);
    // intentionally omit onDismiss — parent often passes inline fn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, durationMs]);

  if (!mounted || !message || !visible) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-4 sm:top-[4.25rem]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto max-w-[min(92vw,22rem)] animate-[qtFade_0.25s_ease] rounded-xl border px-4 py-2.5 text-center text-sm font-medium shadow-lg backdrop-blur-xl ${toneClass[tone]}`}
      >
        {message}
      </div>
    </div>,
    document.body,
  );
}
