"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Mode = "login" | "register";

/** In-app auth dialog — login ↔ register in-place, no page jump. */
export function LoginModal({ open, onClose }: Props) {
  const t = useTranslations("auth");
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setMode("login");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const title = mode === "login" ? t("loginTitle") : t("registerTitle");

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--aw-ink,#0b1220)_48%,transparent)] backdrop-blur-[6px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[min(92dvh,44rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--aw-hairline,var(--border))] px-6 py-4 sm:px-7">
          <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <svg
              className="h-[16px] w-[16px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 qt-scroll sm:px-7 sm:py-6">
          <Suspense
            fallback={
              <p className="py-10 text-center text-sm text-[var(--muted)]">…</p>
            }
          >
            {mode === "login" ? (
              <LoginForm
                variant="modal"
                onSuccess={onClose}
                onSwitchToRegister={() => setMode("register")}
              />
            ) : (
              <RegisterForm
                variant="modal"
                onSuccess={onClose}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>,
    document.body,
  );
}
