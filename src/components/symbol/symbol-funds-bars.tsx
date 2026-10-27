"use client";

import type { CapitalSnapshot } from "@/lib/market/providers/longbridge-research";

type Props = {
  data: CapitalSnapshot;
  fmt: (n: number) => string;
  labels: {
    inflow: string;
    outflow: string;
    large: string;
    medium: string;
    small: string;
  };
};

function BarSide({
  value,
  max,
  side,
  label,
}: {
  value: number;
  max: number;
  side: "in" | "out";
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, (Math.max(0, value) / max) * 100) : 0;
  const color = side === "in" ? "var(--up)" : "var(--down)";
  return (
    <div
      className={`relative flex h-5 min-w-0 flex-1 items-center ${
        side === "in" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`absolute inset-y-0 ${
          side === "in" ? "right-0" : "left-0"
        } rounded-[2px] opacity-20`}
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
      <span
        className={`relative z-[1] px-1 text-[11px] tabular-nums leading-none ${
          side === "in" ? "text-[var(--up)]" : "text-[var(--down)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function SymbolFundsBars({ data, fmt, labels }: Props) {
  const rows = [
    {
      key: "large",
      label: labels.large,
      inn: data.inflow.large,
      out: data.outflow.large,
    },
    {
      key: "medium",
      label: labels.medium,
      inn: data.inflow.medium,
      out: data.outflow.medium,
    },
    {
      key: "small",
      label: labels.small,
      inn: data.inflow.small,
      out: data.outflow.small,
    },
  ] as const;

  const inflowTotal =
    data.inflow.large + data.inflow.medium + data.inflow.small;
  const outflowTotal =
    data.outflow.large + data.outflow.medium + data.outflow.small;
  const maxBucket = Math.max(...rows.flatMap((r) => [r.inn, r.out]), 1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[11px] tabular-nums leading-none">
        <p>
          <span className="text-[var(--muted)]">{labels.inflow}: </span>
          <span className="text-[var(--up)]">{fmt(inflowTotal)}</span>
        </p>
        <p className="text-right">
          <span className="text-[var(--muted)]">{labels.outflow}: </span>
          <span className="text-[var(--down)]">{fmt(outflowTotal)}</span>
        </p>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[1fr_2rem_1fr] items-center gap-0.5"
          >
            <BarSide
              value={row.inn}
              max={maxBucket}
              side="in"
              label={fmt(row.inn)}
            />
            <span className="text-center text-[10px] leading-none text-[var(--muted)]">
              {row.label}
            </span>
            <BarSide
              value={row.out}
              max={maxBucket}
              side="out"
              label={fmt(row.out)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
