"use client";

export function ChangePct({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-[var(--up)]" : "text-[var(--down)]"}>
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function PriceText({
  value,
  change,
}: {
  value: number;
  change?: number;
}) {
  const cls =
    change === undefined
      ? ""
      : change >= 0
        ? "text-[var(--up)]"
        : "text-[var(--down)]";
  return <span className={cls}>{value.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>;
}
