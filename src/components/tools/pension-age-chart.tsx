"use client";

import { formatToolNumber } from "@/lib/tools/catalog";

type Row = { age: number; monthly: number };

/**
 * 退休年龄对照柱状图：同一组缴费参数下，不同退休年龄的月养老金。
 * 高亮当前选择的年龄，其余用弱化色，避免「一堆柱子」看不出重点。
 */
export function PensionAgeChart({
  rows,
  selectedAge,
  monthlyLabel,
  ageLabel,
}: {
  rows: Row[];
  selectedAge: number;
  monthlyLabel: string;
  ageLabel: string;
}) {
  const w = 560;
  const h = 210;
  const padL = 52;
  const padR = 12;
  const padT = 18;
  const padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const max = Math.max(...rows.map((r) => r.monthly), 1);
  const n = Math.max(rows.length, 1);
  const slot = plotW / n;
  const barW = Math.min(26, Math.max(8, slot * 0.56));

  const yTicks = [0, 0.5, 1].map((t) => max * t);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={monthlyLabel}
      >
        {yTicks.map((v) => {
          const y = padT + plotH - (v / max) * plotH;
          return (
            <g key={v}>
              <line
                x1={padL}
                y1={y}
                x2={w - padR}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--muted)]"
                fontSize={10}
              >
                {compact(v)}
              </text>
            </g>
          );
        })}

        {rows.map((r, i) => {
          const barH = (r.monthly / max) * plotH;
          const x = padL + slot * i + (slot - barW) / 2;
          const y = padT + plotH - barH;
          const active = Math.round(r.age) === Math.round(selectedAge);
          return (
            <g key={r.age}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={3}
                fill={active ? "var(--brand)" : "var(--brand)"}
                fillOpacity={active ? 0.9 : 0.22}
              >
                <title>{`${ageLabel} ${r.age}: ${formatToolNumber(r.monthly)}`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={h - 12}
                textAnchor="middle"
                className={active ? "fill-[var(--foreground)]" : "fill-[var(--muted)]"}
                fontSize={10}
              >
                {r.age}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function compact(v: number) {
  if (v >= 10_000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return formatToolNumber(v, 0);
}
