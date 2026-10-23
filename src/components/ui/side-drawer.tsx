"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export function SideDrawer(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Extra classes on the panel (e.g. `aw aw-ai-desk`). */
  className?: string;
  /** Leave room for a fixed edge dock (e.g. Futu-style 40px icon strip). */
  edgeOffsetPx?: number;
  /** Slide from left (watchlist) or right (default). */
  side?: "left" | "right";
  /** Narrower panel (Futu watchlist strip). */
  widthClassName?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  /** Mount heavy body only while open (keep briefly on close for slide-out). */
  const [bodyLive, setBodyLive] = useState(false);
  const side = props.side ?? "right";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (props.open) {
      setBodyLive(true);
      return;
    }
    const t = window.setTimeout(() => setBodyLive(false), 320);
    return () => window.clearTimeout(t);
  }, [props.open]);

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

  const edge = Math.max(0, props.edgeOffsetPx ?? 0);
  const edgeStyle: CSSProperties | undefined =
    edge > 0
      ? side === "right"
        ? { right: edge }
        : { left: edge }
      : undefined;

  const width =
    props.widthClassName ??
    "w-full max-w-[min(100vw,42rem)] sm:max-w-[42rem]";

  const closedX = side === "right" ? "translate-x-full" : "-translate-x-full";
  const sidePos = side === "right" ? "right-0" : "left-0";
  const sideBorder =
    side === "right" ? "border-l border-[var(--border)]" : "border-r border-[var(--border)]";

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
        style={
          side === "right" && edge > 0
            ? ({ right: edge } as CSSProperties)
            : undefined
        }
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          props.open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        style={edgeStyle}
        className={`absolute inset-y-0 ${sidePos} flex ${width} flex-col ${sideBorder} bg-[var(--panel)] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-transform duration-300 ease-out ${
          props.open ? "translate-x-0" : closedX
        } ${props.className ?? ""}`}
      >
        <header className="aw-drawer-header flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5 sm:px-6">
          <div className="min-w-0">
            <h2 className="aw-drawer-title truncate text-[17px] font-semibold tracking-tight">
              {props.title}
            </h2>
            {props.subtitle ? (
              <p className="aw-drawer-subtitle mt-1 text-[14px] leading-snug text-[var(--muted)]">
                {props.subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="aw-drawer-close inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-transparent text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)] active:scale-95"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="aw-drawer-body min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
          {bodyLive ? props.children : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
