"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Sliding pill classes when this option is active */
  indicatorClassName?: string;
  /** Text color when this option is selected */
  activeTextClassName?: string;
};

type Props<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  indicatorClassName?: string;
  activeTextClassName?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = "",
  buttonClassName = "",
  indicatorClassName = "bg-[var(--brand-soft)]",
  activeTextClassName = "text-[var(--brand-text)]",
}: Props<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const tradeSide = className.includes("aw-trade-side");
  /** Trade side is flush halves; other segmented uses may keep a hairline inset. */
  const pillInset = 0;

  const measure = () => {
    const root = rootRef.current;
    const idx = options.findIndex((o) => o.value === value);
    const btn = btnRefs.current[idx];
    if (!root || !btn) return;
    // Prefer offset* (padding-box) so border width does not shift the pill.
    const inset = pillInset;
    setPill({
      left: btn.offsetLeft + inset,
      top: btn.offsetTop + inset,
      width: Math.max(0, btn.offsetWidth - inset * 2),
      height: Math.max(0, btn.offsetHeight - inset * 2),
      ready: true,
    });
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const active = options.find((o) => o.value === value);
  const pillClass = active?.indicatorClassName ?? indicatorClassName;

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex items-stretch ${className}`}
      role="tablist"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute rounded-none ${pillClass} ${
          tradeSide ? "aw-trade-side-pill" : ""
        } ${
          pill.ready
            ? "transition-[left,top,width,height,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "opacity-0"
        }`}
        style={{
          left: pill.left,
          top: pill.top,
          width: pill.width,
          height: pill.height,
        }}
      />
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const textActive =
          opt.activeTextClassName ?? activeTextClassName;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 inline-flex items-center justify-center rounded-none transition-colors duration-300 ${buttonClassName} ${
              selected
                ? textActive
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
