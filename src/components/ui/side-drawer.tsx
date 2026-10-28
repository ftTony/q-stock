"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

export function SideDrawer(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Inline after title on the same row (keeps header short). */
  titleAside?: ReactNode;
  subtitle?: string;
  /** Inline after subtitle (e.g. AI quota). */
  subtitleAside?: ReactNode;
  /** Actions before the close control (e.g. chart-read). */
  headerTrailing?: ReactNode;
  /** Extra classes on the panel (e.g. `aw aw-ai-desk`). */
  className?: string;
  /** Leave room for a fixed edge dock (e.g. Futu-style 40px icon strip). */
  edgeOffsetPx?: number;
  /**
   * Start below sticky chrome (e.g. app topbar). Dock drawers on the symbol
   * page pass the workbench shell top so the panel aligns with the side icon
   * rail — not `inset-y-0` over the header.
   */
  topOffsetPx?: number;
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
  const tCommon = useTranslations("common");
  const closeLabel = tCommon("close");

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
  const top = Math.max(0, props.topOffsetPx ?? 0);
  // When closed, park fully off-screen. `right: edge` + `translateX(100%)`
  // leaves a `edge`-wide sliver of the panel (title text) visible.
  const panelStyle: CSSProperties = {
    ...(top > 0 ? { top } : null),
    ...(edge > 0
      ? side === "right"
        ? {
            right: edge,
            transform: props.open
              ? "translateX(0)"
              : `translateX(calc(100% + ${edge}px))`,
          }
        : {
            left: edge,
            transform: props.open
              ? "translateX(0)"
              : `translateX(calc(-100% - ${edge}px))`,
          }
      : null),
  };

  const width =
    props.widthClassName ??
    "w-full max-w-[min(100vw,42rem)] sm:max-w-[42rem]";

  const closedX = side === "right" ? "translate-x-full" : "-translate-x-full";
  const sidePos = side === "right" ? "right-0" : "left-0";
  const sideBorder =
    side === "right" ? "border-l border-[var(--border)]" : "border-r border-[var(--border)]";
  const useEdgeTransform = edge > 0;
  const yClass = top > 0 ? "bottom-0" : "inset-y-0";

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] ${props.open ? "" : "pointer-events-none"}`}
      aria-hidden={!props.open}
    >
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={props.open ? 0 : -1}
        onClick={props.onClose}
        style={
          {
            ...(top > 0 ? { top } : null),
            ...(side === "right" && edge > 0 ? { right: edge } : null),
          } as CSSProperties
        }
        className={`absolute inset-x-0 bottom-0 bg-black/40 transition-opacity duration-300 ${
          top > 0 ? "" : "top-0"
        } ${props.open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        style={panelStyle}
        className={`absolute ${yClass} ${sidePos} flex ${width} flex-col ${sideBorder} bg-[var(--panel)] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-transform duration-300 ease-out ${
          useEdgeTransform
            ? ""
            : props.open
              ? "translate-x-0"
              : closedX
        } ${props.className ?? ""}`}
      >
        <header className="aw-drawer-header flex w-full shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-2.5 sm:px-5">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="aw-drawer-title truncate text-left text-[16px] font-semibold tracking-tight">
                {props.title}
              </h2>
              {props.titleAside ? (
                <div className="min-w-0 truncate text-[11px] font-normal leading-none text-[var(--muted)]">
                  {props.titleAside}
                </div>
              ) : null}
            </div>
            {props.subtitle || props.subtitleAside ? (
              <div className="aw-drawer-subtitle-row mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {props.subtitle ? (
                  <p className="aw-drawer-subtitle min-w-0 text-left text-[12px] leading-snug text-[var(--muted)]">
                    {props.subtitle}
                  </p>
                ) : null}
                {props.subtitleAside}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 self-center">
            {props.headerTrailing}
            <button
              type="button"
              onClick={props.onClose}
              className="aw-drawer-close inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-none bg-transparent text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)] active:scale-95"
              aria-label={closeLabel}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>
        <div className="aw-drawer-body min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
          {bodyLive ? props.children : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
