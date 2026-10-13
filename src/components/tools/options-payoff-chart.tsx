"use client";

import { formatToolNumber } from "@/lib/tools/catalog";

export type PayoffChartPoint = {
  underlying: number;
  pnlContract: number;
};

type Props = {
  points: PayoffChartPoint[];
  spot: number;
  breakeven: number;
  title: string;
  axisUnderlying: string;
  axisPnl: string;
  legendSpot: string;
  legendBreakeven: string;
};

/** Expiration payoff sketch with price / PnL axis labels. */
export function OptionsPayoffChart({
  points,
  spot,
  breakeven,
  title,
  axisUnderlying,
  axisPnl,
  legendSpot,
  legendBreakeven,
}: Props) {
  const w = 560;
  const h = 240;
  const padL = 56;
  const padR = 16;
  const padT = 18;
  const padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xs = points.map((p) => p.underlying);
  const ys = points.map((p) => p.pnlContract);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const sx = (x: number) => padL + ((x - minX) / spanX) * plotW;
  const sy = (y: number) => padT + plotH - ((y - minY) / spanY) * plotH;

  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${sx(p.underlying)} ${sy(p.pnlContract)}`,
    )
    .join(" ");

  const zeroY = sy(0);
  const yTicks = [minY, 0, maxY].filter(
    (v, i, arr) => Number.isFinite(v) && arr.indexOf(v) === i,
  );
  const xTicks = uniqueSorted([
    minX,
    spot,
    breakeven,
    maxX,
  ]).filter((v) => v >= minX && v <= maxX);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--muted)]">{title}</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
        role="img"
        aria-label={title}
      >
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line
              x1={padL}
              y1={sy(v)}
              x2={w - padR}
              y2={sy(v)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={v === 0 ? undefined : "3 3"}
              opacity={v === 0 ? 1 : 0.7}
            />
            <text
              x={padL - 8}
              y={sy(v) + 3}
              textAnchor="end"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {compactPnl(v)}
            </text>
          </g>
        ))}

        <line
          x1={padL}
          x2={w - padR}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--border)"
          strokeWidth={1.25}
        />

        <path
          d={d}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line
          x1={sx(spot)}
          x2={sx(spot)}
          y1={padT}
          y2={padT + plotH}
          stroke="var(--muted)"
          strokeDasharray="4 3"
          strokeWidth={1.25}
        />
        <line
          x1={sx(breakeven)}
          x2={sx(breakeven)}
          y1={padT}
          y2={padT + plotH}
          stroke="var(--brand-text)"
          strokeDasharray="3 2"
          strokeWidth={1.25}
        />

        {xTicks.map((v) => {
          const label =
            Math.abs(v - breakeven) < spanX * 0.002
              ? formatToolNumber(breakeven)
              : Math.abs(v - spot) < spanX * 0.002
                ? formatToolNumber(spot)
                : formatToolNumber(v);
          return (
            <text
              key={`x-${v}`}
              x={sx(v)}
              y={h - 14}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {label}
            </text>
          );
        })}

        <text
          x={padL}
          y={12}
          className="fill-[var(--muted)]"
          fontSize={9}
        >
          {axisPnl}
        </text>
        <text
          x={w - padR}
          y={h - 4}
          textAnchor="end"
          className="fill-[var(--muted)]"
          fontSize={9}
        >
          {axisUnderlying}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-[var(--brand)]" />
          {title}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-px w-4 border-t border-dashed border-[var(--muted)]"
            aria-hidden
          />
          {legendSpot}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-px w-4 border-t border-dashed border-[var(--brand-text)]"
            aria-hidden
          />
          {legendBreakeven}
        </span>
      </div>
    </div>
  );
}

function uniqueSorted(values: number[]) {
  return [...new Set(values.map((v) => Number(v.toFixed(6))))].sort(
    (a, b) => a - b,
  );
}

function compactPnl(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${sign}${Math.round(abs / 1000)}k`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return formatToolNumber(v);
}
