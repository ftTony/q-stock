"use client";

import { useEffect, useRef, useState } from "react";
import { TRADE_PIN_LENGTH } from "@/lib/trading/trade-password";

/**
 * 6-cell segmented PIN input. A single hidden input keeps typing, paste and
 * mobile-keyboard focus reliable (same reason the old dialog used one input),
 * while the visible cells render masked dots and the active-cell highlight.
 */
export function PinBoxes({
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = false,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [autoFocus]);

  const cells = Array.from(
    { length: TRADE_PIN_LENGTH },
    (_, i) => value[i] ?? "",
  );
  const activeIndex = Math.min(value.length, TRADE_PIN_LENGTH - 1);

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div className="grid grid-cols-6 gap-2" aria-hidden>
        {cells.map((ch, i) => {
          const isActive = focused && !disabled && i === activeIndex;
          const border = error
            ? "border-[var(--danger)]"
            : isActive
              ? "border-[var(--foreground)]"
              : "border-[var(--border)]";
          return (
            <div
              key={i}
              className={`flex h-12 items-center justify-center border ${border} bg-[var(--surface-2,var(--input))] text-[20px] font-semibold leading-none text-[var(--foreground)] transition-colors`}
            >
              {ch ? "•" : ""}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={TRADE_PIN_LENGTH}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, TRADE_PIN_LENGTH))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
