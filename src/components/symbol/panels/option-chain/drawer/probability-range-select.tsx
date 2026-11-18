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
import { qtPortalShellClass } from "@/components/ui/qt-portal-shell";
import { FIELD_CLS, QT_TRIGGER } from "./drawer-ui";

/** Normal-distribution confidence bands (two-sided). */
export const PROB_SIGMA_PRESETS = [
  { conf: 68.27, sigma: 1 },
  { conf: 95.45, sigma: 2 },
  { conf: 99.73, sigma: 3 },
] as const;

function matchPreset(conf: number) {
  return PROB_SIGMA_PRESETS.find((p) => Math.abs(p.conf - conf) < 0.005) ?? null;
}

function clampConf(n: number) {
  if (!Number.isFinite(n)) return 68.27;
  return Math.min(99.73, Math.max(1, n));
}

type Props = {
  value: number;
  onChange: (confPct: number) => void;
  ariaLabel: string;
  customPlaceholder?: string;
};

/**
 * Probability-range control: ±1σ / ±2σ / ±3σ presets + custom %
 * (reference: cone tool with sigma menu + footer input).
 */
export function ProbabilityRangeSelect({
  value,
  onChange,
  ariaLabel,
  customPlaceholder = "0.00",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [draft, setDraft] = useState(() =>
    matchPreset(value) ? "" : String(value),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLInputElement>(null);
  const reactListId = useId();
  const mounted = useMounted();
  const listId = mounted ? reactListId : undefined;

  const preset = matchPreset(value);
  const triggerLabel = preset
    ? `${preset.conf.toFixed(2)}% (±${preset.sigma}σ)`
    : `${clampConf(value).toFixed(2)}%`;

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
      const width = Math.min(Math.max(r.width, 200), vw - 16);
      let left = r.left;
      if (left + width > vw - 8) left = Math.max(8, vw - 8 - width);
      if (left < 8) left = 8;
      const below = vh - r.bottom - gap - 8;
      const above = r.top - gap - 8;
      const preferBelow = below >= 180 || below >= above;
      const maxHeight = Math.min(280, Math.max(140, preferBelow ? below : above));
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
    if (!matchPreset(value)) {
      setDraft(String(value));
      queueMicrotask(() => customRef.current?.focus());
    } else {
      setDraft("");
    }
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
  }, [open, value]);

  function pickPreset(conf: number) {
    onChange(conf);
    setDraft("");
    setOpen(false);
  }

  function commitCustom() {
    const n = Number(draft);
    if (!Number.isFinite(n)) return;
    onChange(clampConf(n));
    setOpen(false);
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  const portalShell = qtPortalShellClass(rootRef.current);

  const menu =
    mounted && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
            className={`${portalShell} fixed z-[80] overflow-auto rounded-[var(--radius)] border border-[var(--border)] !bg-[var(--panel)] p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.16)] qt-scroll`}
          >
            <ul className="m-0 list-none p-0">
              {PROB_SIGMA_PRESETS.map((p) => {
                const active = preset?.sigma === p.sigma;
                return (
                  <li key={p.sigma} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[12px] tabular-nums transition-colors ${
                        active
                          ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                          : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                      }`}
                      onClick={() => pickPreset(p.conf)}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {p.conf.toFixed(2)}% (±{p.sigma}σ)
                      </span>
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
                        <span
                          className="ml-auto h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div
              className="mt-1 border-t border-[var(--border)] px-1.5 pt-2 pb-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label className="flex items-center gap-1.5">
                <input
                  ref={customRef}
                  className={`${FIELD_CLS} h-7 min-w-0 flex-1`}
                  inputMode="decimal"
                  placeholder={customPlaceholder}
                  value={draft}
                  aria-label={ariaLabel}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitCustom();
                    }
                  }}
                  onBlur={() => {
                    if (draft.trim() === "") return;
                    const n = Number(draft);
                    if (Number.isFinite(n)) onChange(clampConf(n));
                  }}
                />
                <span className="shrink-0 text-[11px] font-medium text-[var(--muted)]">
                  %
                </span>
              </label>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative min-w-[7.5rem]">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open || undefined}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className={`qt-input inline-flex w-full cursor-pointer items-center gap-1.5 text-left leading-none ${QT_TRIGGER}`}
      >
        <span className="min-w-0 flex-1 truncate tabular-nums">
          {triggerLabel}
        </span>
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
