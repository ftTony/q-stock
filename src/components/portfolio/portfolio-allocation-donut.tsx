"use client";

import { fmtMoney } from "@/components/portfolio/format";
import type { PaperPosition } from "@/components/portfolio/types";

const CX = 88;
const CY = 84;
const R_OUT = 52;
const R_IN = 30;
const GAP = 0.03;

/** Limited palette — mixes brand / muted for N symbols without new theme tokens. */
const SLICE_COLORS = [
  "color-mix(in srgb, var(--brand) 88%, #000)",
  "color-mix(in srgb, var(--brand) 62%, white)",
  "color-mix(in srgb, var(--muted) 55%, var(--brand))",
  "color-mix(in srgb, var(--foreground) 42%, var(--brand))",
  "color-mix(in srgb, var(--brand) 40%, var(--muted))",
  "color-mix(in srgb, var(--muted) 70%, #000)",
  "color-mix(in srgb, var(--up) 55%, var(--brand))",
  "color-mix(in srgb, var(--down) 45%, var(--brand))",
];

type Slice = {
  id: string;
  symbol: string;
  value: number;
  pct: number;
  color: string;
  start: number;
  end: number;
};

function positionValue(p: PaperPosition): number {
  if (p.marketValue != null && Number.isFinite(p.marketValue)) {
    return Math.max(0, p.marketValue);
  }
  return Math.max(0, p.qty * p.avgCost);
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function donutPath(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  start: number,
  end: number,
): string {
  const large = end - start > Math.PI ? 1 : 0;
  const p0 = polar(cx, cy, rOut, start);
  const p1 = polar(cx, cy, rOut, end);
  const p2 = polar(cx, cy, rIn, end);
  const p3 = polar(cx, cy, rIn, start);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ");
}

function buildSlices(positions: PaperPosition[]): Slice[] {
  const items = positions
    .map((p) => ({
      id: p.id,
      symbol: p.symbol,
      value: positionValue(p),
    }))
    .filter((x) => x.value > 0);
  const total = items.reduce((s, x) => s + x.value, 0);
  if (!(total > 0)) return [];

  const usable = Math.PI * 2 - GAP * items.length;
  let angle = -Math.PI / 2;
  return items.map((item, i) => {
    const sweep = (item.value / total) * usable;
    const start = angle + GAP / 2;
    const end = start + sweep;
    angle = end + GAP / 2;
    return {
      ...item,
      pct: (item.value / total) * 100,
      color: SLICE_COLORS[i % SLICE_COLORS.length]!,
      start,
      end,
    };
  });
}

type Props = {
  positions: PaperPosition[];
  ariaLabel: string;
};

export function PortfolioAllocationDonut({ positions, ariaLabel }: Props) {
  const slices = buildSlices(positions);
  if (!slices.length) return null;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
      <svg
        viewBox="0 0 176 168"
        className="h-auto w-full max-w-[176px] shrink-0"
        role="img"
        aria-label={ariaLabel}
      >
        {slices.map((s) => (
          <path
            key={s.id}
            d={donutPath(CX, CY, R_OUT, R_IN, s.start, s.end)}
            fill={s.color}
            stroke="var(--panel, var(--background))"
            strokeWidth={1.5}
          >
            <title>
              {`${s.symbol}: $${fmtMoney(s.value)} (${s.pct.toFixed(1)}%)`}
            </title>
          </path>
        ))}
      </svg>
      <ul className="flex w-full min-w-0 flex-col gap-1.5 text-[11px] leading-tight">
        {slices.map((s) => (
          <li
            key={s.id}
            className="flex min-w-0 items-center justify-between gap-2"
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="truncate font-medium text-[var(--foreground)]">
                {s.symbol}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--muted)]">
              {s.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
