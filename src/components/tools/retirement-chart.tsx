"use client";

import { formatToolNumber } from "@/lib/tools/catalog";

type Row = { age: number; nominal: number; real: number };

/**
 * 资产轨迹：实线为「今天的钱」（实际购买力），虚线为当年名义金额，
 * 竖线标出退休年龄。两条线在退休前越拉越开，差距就是通胀。
 */
export function RetirementChart({
  rows,
  retirementAge,
  realLabel,
  nominalLabel,
  retireLabel,
  ageLabel,
}: {
  rows: Row[];
  retirementAge: number;
  realLabel: string;
  nominalLabel: string;
  retireLabel: string;
  ageLabel: string;
}) {
  const w = 560;
  const h = 210;
  const padL = 52;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  if (rows.length < 2) return null;

  const ages = rows.map((r) => r.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const ageSpan = maxAge - minAge || 1;
  const maxVal = Math.max(...rows.map((r) => Math.max(r.nominal, r.real)), 1);

  const xAt = (age: number) => padL + ((age - minAge) / ageSpan) * plotW;
  const yAt = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const path = (key: "real" | "nominal") =>
    rows
      .map((r, i) => `${i === 0 ? "M" : "L"} ${xAt(r.age)} ${yAt(r[key])}`)
      .join(" ");

  const area = [
    `M ${xAt(rows[0]!.age)} ${padT + plotH}`,
    ...rows.map((r) => `L ${xAt(r.age)} ${yAt(r.real)}`),
    `L ${xAt(rows[rows.length - 1]!.age)} ${padT + plotH}`,
    "Z",
  ].join(" ");

  const yTicks = [0, 0.5, 1].map((t) => maxVal * t);
  const ageTicks = [minAge, Math.round((minAge + maxAge) / 2), maxAge];
  const retireX = retirementAge >= minAge && retirementAge <= maxAge
    ? xAt(retirementAge)
    : null;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={realLabel}
      >
        <defs>
          <linearGradient id="retirementFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((v) => (
          <g key={`y${v}`}>
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
              fontSize={10}
              fill="var(--muted)"
            >
              {formatToolNumber(v, 0)}
            </text>
          </g>
        ))}

        {ageTicks.map((a) => (
          <text
            key={`x${a}`}
            x={xAt(a)}
            y={h - 10}
            textAnchor="middle"
            fontSize={10}
            fill="var(--muted)"
          >
            {a} {ageLabel}
          </text>
        ))}

        <path d={area} fill="url(#retirementFill)" />
        <path
          d={path("nominal")}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={1.4}
          strokeDasharray="4 3"
          opacity={0.75}
        />
        <path
          d={path("real")}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {retireX !== null ? (
          <g>
            <line
              x1={retireX}
              y1={padT}
              x2={retireX}
              y2={padT + plotH}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={retireX}
              y={padT + 10}
              textAnchor={retireX > w * 0.75 ? "end" : "start"}
              fontSize={10}
              fill="var(--muted)"
              dx={retireX > w * 0.75 ? -4 : 4}
            >
              {retireLabel}
            </text>
          </g>
        ) : null}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-[2px] w-4 rounded"
            style={{ background: "var(--brand)" }}
          />
          {realLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-[2px] w-4 rounded"
            style={{ background: "var(--muted)", opacity: 0.7 }}
          />
          {nominalLabel}
        </span>
      </div>
    </div>
  );
}
