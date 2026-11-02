"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/use-mounted";
import { qtPortalShellClass } from "@/components/ui/qt-portal-shell";

type MenuPos = { top: number; left: number; maxHeight: number };

/** Parse `YYYY-MM-DD` into a local-noon Date (avoids TZ edge cases). */
function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(+m[1]!, +m[2]! - 1, +m[3]!, 12) : null;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Formatters are locale-scoped and cheap to reuse across opens. */
const weekdayFmtCache = new Map<string, Intl.DateTimeFormat>();
const monthFmtCache = new Map<string, Intl.DateTimeFormat>();

function weekdayFormatter(locale: string) {
  let f = weekdayFmtCache.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { weekday: "short" });
    weekdayFmtCache.set(locale, f);
  }
  return f;
}

function monthFormatter(locale: string) {
  let f = monthFmtCache.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" });
    monthFmtCache.set(locale, f);
  }
  return f;
}

/**
 * Custom date picker matching the qt-input/QtSelect visual language:
 * qt-input trigger + portal popover month grid, clamped by min/max.
 */
export function QtDatePicker({
  value,
  onChange,
  min,
  max,
  className,
  triggerClassName,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  triggerClassName?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const mounted = useMounted();
  const popId = mounted ? reactId : undefined;

  const selected = parseYmd(value);
  // Month currently shown in the grid; re-sync when opened / value changes.
  const [view, setView] = useState(() => selected ?? new Date());
  useLayoutEffect(() => {
    if (open) setView(selected ?? new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

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
      const vh = window.innerHeight;
      const width = 272;
      const below = vh - r.bottom - gap - 8;
      const above = r.top - gap - 8;
      const preferBelow = below >= 300 || below >= above;
      const height = 300;
      const top = preferBelow
        ? r.bottom + gap
        : Math.max(8, r.top - gap - Math.min(height, above));
      let left = Math.min(r.left, window.innerWidth - 8 - width);
      if (left < 8) left = 8;
      setPos({ top, left, maxHeight: Math.max(200, Math.min(height, preferBelow ? below : above)) });
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
      if (popRef.current?.contains(t)) return;
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

  const minT = min ? parseYmd(min)?.getTime() : null;
  const maxT = max ? parseYmd(max)?.getTime() : null;

  // Weekday headers + month title, localized through Intl.
  const locale = useMemo(
    () => (typeof navigator !== "undefined" ? navigator.language : "en"),
    [],
  );
  const weekdays = useMemo(() => {
    // Week starting Sunday: 2023-01-01 is a Sunday.
    const fmt = weekdayFormatter(locale);
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2023, 0, 1 + i)),
    );
  }, [locale]);
  const monthTitle = useMemo(
    () => monthFormatter(locale).format(view),
    [locale, view],
  );

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const stepMonth = (delta: number) => {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1, 12));
  };

  const canPrev =
    minT == null ||
    new Date(view.getFullYear(), view.getMonth() + 1, 0, 12).getTime() >= minT;
  const canNext =
    maxT == null ||
    new Date(view.getFullYear(), view.getMonth(), 1, 12).getTime() <= maxT;

  const portalShell = qtPortalShellClass(rootRef.current);

  const pop =
    mounted && open && pos
      ? createPortal(
          <div
            ref={popRef}
            id={popId}
            role="dialog"
            aria-label={ariaLabel}
            style={{
              top: pos.top,
              left: pos.left,
              width: 272,
              maxHeight: pos.maxHeight,
            }}
            className={`${portalShell} fixed z-[80] overflow-auto rounded-[var(--radius)] border border-[var(--border)] !bg-[var(--panel)] p-2 shadow-[0_12px_40px_rgba(15,23,42,0.16)]`}
          >
            <div className="mb-1 flex items-center justify-between">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => stepMonth(-1)}
                aria-label="prev month"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <span className="text-[12px] font-medium text-[var(--foreground)]">
                {monthTitle}
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => stepMonth(1)}
                aria-label="next month"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {weekdays.map((w) => (
                <span key={w} className="py-0.5 text-[10px] text-[var(--muted)]">
                  {w}
                </span>
              ))}
              {cells.map((d) => {
                const ymd = toYmd(d);
                const dim = d.getMonth() !== view.getMonth();
                const t = d.getTime();
                const off = (minT != null && t < minT) || (maxT != null && t > maxT);
                const on = value === ymd;
                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={off}
                    onClick={() => {
                      onChange(ymd);
                      setOpen(false);
                    }}
                    className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] tabular-nums transition-colors ${
                      on
                        ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                        : off
                          ? "text-[var(--muted)] opacity-40"
                          : dim
                            ? "text-[var(--muted)] hover:bg-[var(--sidebar-hover)]"
                            : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open || undefined}
        aria-controls={popId}
        onClick={() => setOpen((v) => !v)}
        className={`qt-input inline-flex w-full cursor-pointer items-center gap-2 text-left leading-none ${
          triggerClassName ?? "h-8 px-2 text-[12px]"
        }`}
      >
        <span className="min-w-0 flex-1 truncate tabular-nums">{value}</span>
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
          <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        </svg>
      </button>
      {pop}
    </div>
  );
}
