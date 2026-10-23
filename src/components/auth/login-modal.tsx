"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/login-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** In-app sign-in dialog — sharp edges, generous scale. */
export function LoginModal({ open, onClose }: Props) {
  const t = useTranslations("auth");
  const tNav = useTranslations("nav");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
        aria-label={tNav("login")}
        className="relative z-10 flex w-full max-w-[26rem] flex-col overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--aw-hairline,var(--border))] px-7 py-5 sm:px-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
            {t("loginTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <svg
              className="h-[18px] w-[18px]"
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
        <div className="px-7 py-7 sm:px-8 sm:py-8">
          <Suspense
            fallback={
              <p className="py-10 text-center text-sm text-[var(--muted)]">…</p>
            }
          >
            <LoginForm variant="modal" onSuccess={onClose} />
          </Suspense>
        </div>
      </div>
    </div>,
    document.body,
  );
}
