"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type SegmentedTab<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: readonly SegmentedTab<T>[];
  onChange: (value: T) => void;
  className?: string;
  /** Button height class, default h-7 */
  size?: "sm" | "md";
};

type Pill = { left: number; width: number };

/**
 * Pill segmented control with a sliding active indicator.
 */
export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
  className = "",
  size = "sm",
}: Props<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState<Pill | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const btn = btnRefs.current.get(value);
    if (!root || !btn) return;
    const rootRect = root.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPill({
      left: btnRect.left - rootRect.left,
      width: btnRect.width,
    });
    setReady(true);
  }, [value]);

  useLayoutEffect(() => {
    measure();
  }, [measure, options]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const btnH = size === "md" ? "h-8 px-3 text-xs" : "h-7 px-2.5 text-[11px]";

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex max-w-full flex-nowrap overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      role="tablist"
    >
      {pill ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0.5 rounded-md bg-[var(--brand-soft)]"
          style={{
            left: pill.left,
            width: pill.width,
            height: size === "md" ? "2rem" : "1.75rem",
            transition: ready
              ? "left 220ms cubic-bezier(0.22, 1, 0.36, 1), width 220ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        />
      ) : null}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            ref={(el) => {
              if (el) btnRefs.current.set(opt.value, el);
              else btnRefs.current.delete(opt.value);
            }}
            onClick={() => onChange(opt.value)}
            className={`relative z-[1] rounded-md font-medium transition-colors duration-200 ${btnH} ${
              active
                ? "text-[var(--brand-text)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
