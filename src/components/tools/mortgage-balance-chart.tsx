"use client";

import { formatToolNumber } from "@/lib/tools/catalog";

type Props = {
  years: { year: number; balance: number }[];
  principal: number;
  balanceLabel: string;
  yearLabel: string;
  chartTitle: string;
};

/** Remaining loan balance over years. */
export function MortgageBalanceChart({
  years,
  principal,
  balanceLabel,
  yearLabel,
  chartTitle,
}: Props) {
  const w = 560;
  const h = 200;
  const padL = 52;
  const padR = 14;
  const padT = 16;
  const padB = 32;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const points = [{ year: 0, balance: principal }, ...years];
  const max = Math.max(principal, 1);
  const n = points.length;
  const xAt = (i: number) =>
    padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => padT + plotH - (v / max) * plotH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.balance)}`)
    .join(" ");
  const area = [
    path,
    `L ${xAt(n - 1)} ${yAt(0)}`,
    `L ${xAt(0)} ${yAt(0)}`,
    "Z",
  ].join(" ");

  const yTicks = [0, 0.5, 1].map((t) => max * t);
  const xStep = n <= 10 ? 1 : Math.max(1, Math.ceil((n - 1) / 6));

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--muted)]">{chartTitle}</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={chartTitle}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={yAt(v)}
              x2={w - padR}
              y2={yAt(v)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {compactAxis(v)}
            </text>
          </g>
        ))}
        <path d={area} fill="var(--brand)" fillOpacity={0.12} />
        <path
          d={path}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) =>
          i === 0 || i === n - 1 || i % xStep === 0 ? (
            <text
              key={p.year}
              x={xAt(i)}
              y={h - 10}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {p.year}
            </text>
          ) : null,
        )}
      </svg>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-[var(--brand)]" />
          {balanceLabel}
        </span>
        <span>{yearLabel}</span>
      </div>
    </div>
  );
}

function compactAxis(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return formatToolNumber(v);
}
