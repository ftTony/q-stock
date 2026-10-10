"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function SideDrawer(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!props.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [props.open, props.onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] ${props.open ? "" : "pointer-events-none"}`}
      aria-hidden={!props.open}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={props.open ? 0 : -1}
        onClick={props.onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          props.open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,42rem)] flex-col border-l border-[var(--border)] bg-[var(--panel)] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-transform duration-300 ease-out sm:max-w-[42rem] ${
          props.open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              {props.title}
            </h2>
            {props.subtitle ? (
              <p className="mt-1 text-[14px] leading-snug text-[var(--muted)]">
                {props.subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="qt-btn-ghost inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
          {props.children}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
