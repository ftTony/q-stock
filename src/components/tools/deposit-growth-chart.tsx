"use client";

import { formatToolNumber } from "@/lib/tools/catalog";

type Row = { year: number; value: number; interest: number };

/**
 * 存款本息轨迹：实线为本息合计，虚线为本金，中间阴影是累计利息。
 * 利息在「1 字头」利率下增长极慢，用同一坐标轴能让这个「几乎是平的」直观看出来。
 */
export function DepositGrowthChart({
  rows,
  principal,
  valueLabel,
  principalLabel,
  yearLabel,
}: {
  rows: Row[];
  principal: number;
  valueLabel: string;
  principalLabel: string;
  yearLabel: string;
}) {
  const w = 560;
  const h = 200;
  const padL = 56;
  const padR = 14;
  const padT = 16;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const points = [{ year: 0, value: principal }, ...rows];
  if (points.length < 2) return null;

  // 起点不从 0 开始，否则利息曲线会被压成一条直线看不出差异。
  const min = Math.min(principal, ...points.map((p) => p.value)) * 0.985;
  const max = Math.max(...points.map((p) => p.value)) * 1.005;
  const span = max - min || 1;
  const n = points.length;
  const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
  const yAt = (v: number) => padT + plotH - ((v - min) / span) * plotH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.value)}`)
    .join(" ");
  const baseY = yAt(principal);

  const area = [
    `M ${xAt(0)} ${baseY}`,
    ...points.slice(1).map((p, i) => `L ${xAt(i + 1)} ${yAt(p.value)}`),
    `L ${xAt(n - 1)} ${baseY}`,
    "Z",
  ].join(" ");

  const yTicks = [0, 0.5, 1].map((t) => min + span * t);
  const step = n <= 6 ? 1 : Math.ceil((n - 1) / 6);

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={valueLabel}
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
              {compact(v)}
            </text>
          </g>
        ))}

        <path d={area} fill="var(--brand)" fillOpacity={0.16} />
        <line
          x1={padL}
          y1={baseY}
          x2={w - padR}
          y2={baseY}
          stroke="var(--muted)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <path
          d={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={xAt(n - 1)} cy={yAt(points[n - 1]!.value)} r={3.5} fill="var(--brand)" />

        {points.map((p, i) =>
          i === 0 || i === n - 1 || i % step === 0 ? (
            <text
              key={`x${p.year}`}
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
          {valueLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-px w-4 border-t border-dashed border-[var(--muted)]"
            aria-hidden
          />
          {principalLabel} · {yearLabel}
        </span>
      </div>
    </div>
  );
}

function compact(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000) return `${(v / 1000).toFixed(1)}k`;
  return formatToolNumber(v, 0);
}
