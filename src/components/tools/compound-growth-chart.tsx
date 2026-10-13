"use client";

import { useId, useMemo } from "react";
import { formatToolNumber } from "@/lib/tools/catalog";

export type GrowthChartYear = {
  year: number;
  value: number;
  contributed: number;
};

type Props = {
  years: GrowthChartYear[];
  /** Starting point at year 0 (principal / initial). */
  principal: number;
  valueLabel: string;
  contributedLabel: string;
  yearLabel: string;
};

/** Lightweight SVG growth chart — value vs total contributed over years. */
export function CompoundGrowthChart({
  years,
  principal,
  valueLabel,
  contributedLabel,
  yearLabel,
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const points = useMemo(() => {
    const start: GrowthChartYear = {
      year: 0,
      value: principal,
      contributed: principal,
    };
    return [start, ...years];
  }, [years, principal]);

  const w = 560;
  const h = 220;
  const padL = 52;
  const padR = 14;
  const padT = 16;
  const padB = 32;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const values = points.flatMap((p) => [p.value, p.contributed]);
  const max = Math.max(...values, 1);
  const min = 0;
  const span = max - min || 1;
  const n = points.length;
  const xAt = (i: number) =>
    padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => padT + plotH - ((v - min) / span) * plotH;

  const valuePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.value)}`)
    .join(" ");
  const contribPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.contributed)}`)
    .join(" ");
  const areaPath = [
    `M ${xAt(0)} ${yAt(points[0]!.value)}`,
    ...points.slice(1).map((p, i) => `L ${xAt(i + 1)} ${yAt(p.value)}`),
    `L ${xAt(n - 1)} ${yAt(0)}`,
    `L ${xAt(0)} ${yAt(0)}`,
    "Z",
  ].join(" ");

  const yTicks = [0, 0.5, 1].map((t) => min + span * t);
  const xLabelStep =
    n <= 8 ? 1 : n <= 16 ? 2 : Math.max(1, Math.ceil((n - 1) / 6));

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={valueLabel}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

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

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={contribPath}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <path
          d={valuePath}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) =>
          i === 0 || i === n - 1 || i % xLabelStep === 0 ? (
            <g key={p.year}>
              {i === n - 1 ? (
                <circle
                  cx={xAt(i)}
                  cy={yAt(p.value)}
                  r={3.5}
                  fill="var(--brand)"
                >
                  <title>{`${yearLabel} ${p.year}: ${formatToolNumber(p.value)}`}</title>
                </circle>
              ) : null}
              <text
                x={xAt(i)}
                y={h - 10}
                textAnchor="middle"
                className="fill-[var(--muted)]"
                fontSize={10}
              >
                {p.year}
              </text>
            </g>
          ) : null,
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-[var(--brand)]" />
          {valueLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-px w-4 border-t border-dashed border-[var(--muted)]"
            aria-hidden
          />
          {contributedLabel}
        </span>
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
