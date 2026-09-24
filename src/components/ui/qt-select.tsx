"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type QtSelectOption = {
  value: string;
  label: string;
  /** Optional short code shown in a badge (e.g. CN / EN). */
  badge?: string;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className={`qt-input flex w-full cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-55 ${
          triggerClassName ?? "px-3 py-2.5 text-sm"
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

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-[0_8px_30px_rgba(15,23,42,0.12)] qt-scroll"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
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
        </ul>
      )}
    </div>
  );
}
