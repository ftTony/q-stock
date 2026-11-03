"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
export type RailTab = "market" | "plan" | "review";

type Option = { value: RailTab; label: string };

type Props = {
  value: RailTab;
  options: Option[];
  onChange: (tab: RailTab) => void;
};

type Indicator = { left: number; width: number };

/**
 * Rail underline tabs with a sliding active mark (GPU transform).
 */
export function SymbolRailTabs({ value, options, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<RailTab, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const btn = btnRefs.current.get(value);
    if (!root || !btn) return;
    // Inset matches legacy .aw-tab::after left/right: 10px
    const inset = 10;
    setIndicator({
      left: btn.offsetLeft + inset,
      width: Math.max(0, btn.offsetWidth - inset * 2),
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

  return (
    <div
      ref={rootRef}
      role="tablist"
      className="aw-tablist-slide relative flex shrink-0 items-stretch border-b border-[var(--aw-hairline,var(--border))]"
    >
      {indicator ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[-1px] z-[1] h-0.5 bg-[var(--aw-primary,var(--brand))]"
          style={{
            left: indicator.left,
            width: indicator.width,
            transition: ready
              ? "left 220ms cubic-bezier(0.22, 1, 0.36, 1), width 220ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        />
      ) : null}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          data-active={value === opt.value}
          data-tour={
            opt.value === "plan"
              ? "rail-plan"
              : opt.value === "review"
                ? "rail-review"
                : undefined
          }
          ref={(el) => {
            if (el) btnRefs.current.set(opt.value, el);
            else btnRefs.current.delete(opt.value);
          }}
          onClick={() => onChange(opt.value)}
          className="aw-tab flex-1 justify-center transition-colors duration-200"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
