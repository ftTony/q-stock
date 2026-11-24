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

/**
 * App toast — terminal 直角 + hairline，跟 wb-shell / qt 面板语言一致。
 * 左色条区分语气；浅底用 brand/danger soft，避免白胶囊 + 大圆角消费感。
 */
const toneClass: Record<ToastTone, string> = {
  success:
    "border-[var(--border)] border-l-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_10%,var(--panel))] text-[var(--foreground)]",
  error:
    "border-[var(--border)] border-l-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,var(--panel))] text-[var(--foreground)]",
  neutral:
    "border-[var(--border)] border-l-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,var(--panel))] text-[var(--foreground)]",
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
      className="pointer-events-none fixed inset-x-0 top-16 z-[80] flex justify-center px-4 sm:top-[4.25rem]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto max-w-[min(92vw,22rem)] animate-[qtFade_0.25s_ease] rounded-none border border-l-2 px-3.5 py-2.5 text-center text-[13px] font-medium leading-snug shadow-[0_1px_0_rgba(15,23,42,0.04)] ${toneClass[tone]}`}
      >
        {message}
      </div>
    </div>,
    document.body,
  );
}
