"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/use-mounted";

export type QtSelectOption = {
  value: string;
  label: string;
  /** Optional short code shown in a badge (e.g. CN / EN). */
  badge?: string;
  /** Optional section header; consecutive options with the same group share one header. */
  group?: string;
};

type QtSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: QtSelectOption[];
  className?: string;
  /** Override trigger button classes (e.g. h-9 for compact rows). */
  triggerClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
};

type MenuPos = { top: number; left: number; width: number; maxHeight: number };

export function QtSelect({
  value,
  onChange,
  options,
  className = "",
  triggerClassName,
  disabled = false,
  "aria-label": ariaLabel,
  id,
}: QtSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const reactListId = useId();
  // Defer aria-controls until after mount — useId can diverge SSR vs client
  // when ancestors conditionally render other useId consumers (e.g. session UI).
  const mounted = useMounted();
  const listId = mounted ? reactListId : undefined;
  const selected = options.find((o) => o.value === value) ?? options[0];

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 6;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(Math.max(r.width, 192), vw - 16);
      let left = r.left;
      if (left + width > vw - 8) left = Math.max(8, vw - 8 - width);
      if (left < 8) left = 8;

      const below = vh - r.bottom - gap - 8;
      const above = r.top - gap - 8;
      const preferBelow = below >= 160 || below >= above;
      const maxHeight = Math.min(256, Math.max(120, preferBelow ? below : above));
      const top = preferBelow
        ? r.bottom + gap
        : Math.max(8, r.top - gap - maxHeight);

      setPos({ top, left, width, maxHeight });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  const menu =
    mounted && open && pos
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
            className="fixed z-[80] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.16)] qt-scroll"
          >
            {options.map((opt, index) => {
              const active = opt.value === value;
              const showGroup =
                Boolean(opt.group) &&
                (index === 0 || options[index - 1]?.group !== opt.group);
              return (
                <li key={opt.value} role="presentation">
                  {showGroup ? (
                    <div
                      className={`px-2.5 pb-1 text-[10px] font-semibold tracking-wide text-[var(--muted)] uppercase ${
                        index === 0 ? "pt-1" : "pt-2.5"
                      }`}
                    >
                      {opt.group}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                        : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                    }`}
                    onClick={() => pick(opt.value)}
                  >
                    {opt.badge ? (
                      <span
                        className={`inline-flex h-5 min-w-[1.75rem] shrink-0 items-center justify-center rounded border px-1 text-[10px] font-bold ${
                          active
                            ? "border-[var(--brand-text)] text-[var(--brand-text)]"
                            : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {active ? (
                      <svg
                        className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--brand-text)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="ml-auto h-3.5 w-3.5 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open || undefined}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className={`qt-input inline-flex w-full cursor-pointer items-center gap-2 text-left leading-none disabled:cursor-not-allowed disabled:opacity-55 ${
          triggerClassName ?? "h-9 px-3 text-[14px]"
        }`}
      >
        {selected?.badge ? (
          <span className="inline-flex h-5 min-w-[1.75rem] shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-2)] px-1 text-[10px] font-bold text-[var(--brand-text)]">
            {selected.badge}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? value}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {menu}
    </div>
  );
}
