"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/use-mounted";
import { qtPortalShellClass } from "@/components/ui/qt-portal-shell";

export type PeriodFreq = "annual" | "quarter" | "cumulative";
export type PeriodScope = "all" | "q1" | "q2" | "q3" | "q4";

export type PeriodSelection = {
  freq: PeriodFreq;
  scope: PeriodScope;
};

export type PeriodPickerLabels = {
  freqAnnual: string;
  freqQuarter: string;
  freqCumulative: string;
  scopeAll: string;
  scopeQ1: string;
  scopeQ2: string;
  scopeQ3: string;
  scopeQ4: string;
};

const FREQS: PeriodFreq[] = ["annual", "quarter", "cumulative"];
const SCOPES: PeriodScope[] = ["all", "q1", "q2", "q3", "q4"];

function freqLabel(freq: PeriodFreq, labels: PeriodPickerLabels): string {
  if (freq === "annual") return labels.freqAnnual;
  if (freq === "cumulative") return labels.freqCumulative;
  return labels.freqQuarter;
}

function scopeLabel(scope: PeriodScope, labels: PeriodPickerLabels): string {
  if (scope === "q1") return labels.scopeQ1;
  if (scope === "q2") return labels.scopeQ2;
  if (scope === "q3") return labels.scopeQ3;
  if (scope === "q4") return labels.scopeQ4;
  return labels.scopeAll;
}

export function periodSelectionLabel(
  value: PeriodSelection,
  labels: PeriodPickerLabels,
): string {
  return `${freqLabel(value.freq, labels)} · ${scopeLabel(value.scope, labels)}`;
}

type MenuPos = { top: number; left: number };

const DESKTOP_MQ = "(min-width: 1024px)";

/** Desktop layout = the hover two-pane menu; below lg, pickers use a bottom sheet. */
function useDesktopLayout(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

type SheetProps = {
  value: PeriodSelection;
  labels: PeriodPickerLabels;
  onClose: () => void;
  /** Apply a (freq, scope) pair and close. */
  onPick: (freq: PeriodFreq, scope: PeriodScope) => void;
};

/**
 * H5 bottom sheet: both groups visible at once (no hover dependency),
 * 44px touch rows, safe-area padding. Desktop never renders this.
 */
function PeriodBottomSheet({ value, labels, onClose, onPick }: SheetProps) {
  const [freq, setFreq] = useState<PeriodFreq>(value.freq);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const scopes: PeriodScope[] = freq === "annual" ? ["all"] : SCOPES;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={periodSelectionLabel(value, labels)}
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-[var(--border)] bg-[var(--panel)] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-3">
          <span className="text-[13px] font-medium text-[var(--muted)]">
            {periodSelectionLabel(value, labels)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--muted)] active:opacity-70"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* 报表频率：年报直接应用（仅「全部」），其余仅切换下方季度组 */}
        <ul className="px-2 pt-1">
          {FREQS.map((f) => {
            const active = value.freq === f;
            return (
              <li key={f}>
                <button
                  type="button"
                  className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-[15px] ${
                    active
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--foreground)] active:bg-[var(--sidebar-hover,var(--surface-2))]"
                  }`}
                  onClick={() => {
                    if (f === "annual") onPick("annual", "all");
                    else setFreq(f);
                  }}
                >
                  <span>{freqLabel(f, labels)}</span>
                  {active ? (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 季度范围：跟随上方频率（年报下仅「全部」） */}
        <ul className="border-t border-[var(--border)] px-2 pt-1">
          {scopes.map((s) => {
            const selected = freq === value.freq && value.scope === s;
            return (
              <li key={s}>
                <button
                  type="button"
                  className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-[15px] ${
                    selected
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--foreground)] active:bg-[var(--sidebar-hover,var(--surface-2))]"
                  }`}
                  onClick={() => onPick(freq, s)}
                >
                  <span>{scopeLabel(s, labels)}</span>
                  {selected ? (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

/** Two-pane period picker: 年报 / 单季报 / 累计季报 × 全部·一~四季报. */
export function EarningsPeriodPicker({
  value,
  onChange,
  labels,
  className = "",
}: {
  value: PeriodSelection;
  onChange: (next: PeriodSelection) => void;
  labels: PeriodPickerLabels;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [hoverFreq, setHoverFreq] = useState<PeriodFreq>(value.freq);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const listId = useId();
  const desktop = useDesktopLayout();

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    setHoverFreq(value.freq);
    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 6;
      let left = r.left;
      const width = 320;
      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - 8 - width);
      }
      setPos({ top: r.bottom + gap, left });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, value.freq]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const scopesForFreq =
    hoverFreq === "annual" ? (["all"] as PeriodScope[]) : SCOPES;

  const menu =
    mounted && open && pos && desktop
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="dialog"
            aria-label={periodSelectionLabel(value, labels)}
            style={{ top: pos.top, left: pos.left }}
            className={`${qtPortalShellClass(rootRef.current)} fixed z-[80] flex w-[320px] overflow-hidden rounded-none border border-[var(--border)] !bg-[var(--panel)] shadow-[0_12px_40px_rgba(15,23,42,0.16)]`}
          >
            <ul className="w-[44%] shrink-0 border-r border-[var(--border)] py-1">
              {FREQS.map((freq) => {
                const active = hoverFreq === freq;
                return (
                  <li key={freq}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] font-medium text-[var(--foreground)]"
                          : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                      }`}
                      onMouseEnter={() => setHoverFreq(freq)}
                      onFocus={() => setHoverFreq(freq)}
                      onClick={() => {
                        if (freq === "annual") {
                          onChange({ freq, scope: "all" });
                          setOpen(false);
                        } else {
                          setHoverFreq(freq);
                        }
                      }}
                    >
                      <span>{freqLabel(freq, labels)}</span>
                      <svg
                        className="h-3 w-3 shrink-0 text-[var(--muted)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="min-w-0 flex-1 py-1">
              {scopesForFreq.map((scope) => {
                const selected =
                  value.freq === hoverFreq && value.scope === scope;
                return (
                  <li key={scope}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] ${
                        selected
                          ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                          : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                      }`}
                      onClick={() => {
                        onChange({ freq: hoverFreq, scope });
                        setOpen(false);
                      }}
                    >
                      {selected ? (
                        <svg
                          className="h-3.5 w-3.5 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="inline-block h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>{scopeLabel(scope, labels)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  // H5: iOS-style bottom sheet — no hover needed, both groups visible at once.
  const sheet =
    mounted && open && !desktop ? (
      <PeriodBottomSheet
        value={value}
        labels={labels}
        onClose={() => setOpen(false)}
        onPick={(freq, scope) => {
          onChange({ freq, scope });
          setOpen(false);
        }}
      />
    ) : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open || undefined}
        aria-controls={open ? listId : undefined}
        className="qt-input inline-flex h-7 min-w-[9.5rem] cursor-pointer items-center gap-1 rounded-none px-2 text-left text-[12px] leading-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1 truncate">
          {periodSelectionLabel(value, labels)}
        </span>
        <svg
          className={`h-3 w-3 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
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
      {sheet}
    </div>
  );
}
