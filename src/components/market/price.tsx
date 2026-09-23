"use client";

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
  return (
    <span className={cls}>
      {value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
    </span>
  );
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

/** Absolute change amount with sign, follows --up/--down. */
export function ChangeAbs({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-[var(--up)]" : "text-[var(--down)]"}>
      {up ? "+" : ""}
      {value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
    </span>
  );
}
