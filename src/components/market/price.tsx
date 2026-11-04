"use client";

import { formatPrice } from "@/lib/format-number";

/** Absolute price; colors with --up/--down when change is provided. */
export function PriceText({
  value,
  change,
}: {
  value: number;
  /** Signed change or percent; >= 0 → up color */
  change?: number;
}) {
  const cls =
    change === undefined
      ? ""
      : change >= 0
        ? "text-[var(--up)]"
        : "text-[var(--down)]";
  return <span className={cls}>{formatPrice(value, 6)}</span>;
}

export function ChangePct({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-[var(--up)]" : "text-[var(--down)]"}>
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

/** Solid up/down chip — Futu-style watchlist 涨跌幅. */
export function ChangePctBadge({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex min-w-[4.5rem] items-center justify-center px-1.5 py-[5px] text-[12px] font-medium tabular-nums leading-none text-white ${
        up ? "bg-[var(--up)]" : "bg-[var(--down)]"
      } ${className}`}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

/** Absolute change amount with sign, follows --up/--down. */
export function ChangeAbs({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-[var(--up)]" : "text-[var(--down)]"}>
      {up ? "+" : ""}
      {formatPrice(value, 4)}
    </span>
  );
}
