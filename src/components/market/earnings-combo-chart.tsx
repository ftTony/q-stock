"use client";

import type { EarningsStatement } from "@/lib/earnings/types";

type Props = {
  statement: EarningsStatement;
  rowKey: string;
  showYoy: boolean;
  valueLabel: string;
  yoyLabel: string;
};

function fmtAxis(v: number, unit: "currency" | "eps" | "percent"): string {
  if (unit === "percent") return `${v.toFixed(1)}%`;
  if (unit === "eps") return v.toFixed(2);
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  return v.toFixed(1);
}

/** Dual-axis: bars = selected metric, line = YoY % (optional). */
export function EarningsComboChart({
  statement,
  rowKey,
  showYoy,
  valueLabel,
  yoyLabel,
}: Props) {
  const row = statement.rows.find((r) => r.key === rowKey);
  if (!row) return null;

  const periods = statement.periods;
  const n = periods.length;
  if (!n) return null;

  const w = 560;
  const h = 200;
  const padL = 44;
  const padR = showYoy ? 44 : 12;
  const padT = 14;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const vals = row.values.filter((v): v is number => v != null);
  const maxV = Math.max(...vals, 0.01);
  const minV = Math.min(0, ...vals);
  const spanV = maxV - minV || 1;
  const yBar = (v: number) => padT + plotH - ((v - minV) / spanV) * plotH;

  const yoys = showYoy
    ? row.yoy.filter((v): v is number => v != null)
    : [];
  const maxY = yoys.length ? Math.max(...yoys, 0) : 1;
  const minY = yoys.length ? Math.min(...yoys, 0) : 0;
  const spanY = maxY - minY || 1;
  const yLine = (v: number) => padT + plotH - ((v - minY) / spanY) * plotH;

  const groupW = plotW / n;
  const barW = Math.min(28, groupW * 0.45);

  const linePts = showYoy
    ? row.yoy
        .map((v, i) =>
          v == null
            ? null
            : { i, v, x: padL + groupW * i + groupW / 2, y: yLine(v) },
        )
        .filter((p): p is { i: number; v: number; x: number; y: number } =>
          Boolean(p),
        )
    : [];
  const path = linePts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={valueLabel}
    >
      {[0.25, 0.5, 0.75].map((t) => {
        const y = padT + plotH * (1 - t);
        return (
          <line
            key={t}
            x1={padL}
            y1={y}
            x2={w - padR}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
            opacity={0.55}
          />
        );
      })}
      <text x={4} y={padT + 8} className="fill-[var(--muted)]" fontSize={9}>
        {fmtAxis(maxV, row.unit)}
      </text>
      <text x={4} y={padT + plotH} className="fill-[var(--muted)]" fontSize={9}>
        {fmtAxis(minV, row.unit)}
      </text>
      {showYoy ? (
        <>
          <text
            x={w - 4}
            y={padT + 8}
            textAnchor="end"
            className="fill-[var(--muted)]"
            fontSize={9}
          >
            {`${maxY >= 0 ? "+" : ""}${maxY.toFixed(1)}%`}
          </text>
          <text
            x={w - 4}
            y={padT + plotH}
            textAnchor="end"
            className="fill-[var(--muted)]"
            fontSize={9}
          >
            {`${minY >= 0 ? "+" : ""}${minY.toFixed(1)}%`}
          </text>
        </>
      ) : null}

      {row.values.map((v, i) => {
        if (v == null) return null;
        const cx = padL + groupW * i + groupW / 2;
        const y0 = yBar(0);
        const y1 = yBar(v);
        return (
          <rect
            key={`b-${i}`}
            x={cx - barW / 2}
            y={Math.min(y0, y1)}
            width={barW}
            height={Math.max(1, Math.abs(y1 - y0))}
            fill="var(--brand)"
            opacity={0.88}
          >
            <title>{`${periods[i]?.label}: ${fmtAxis(v, row.unit)}`}</title>
          </rect>
        );
      })}

      {path ? (
        <path d={path} fill="none" stroke="#e8873a" strokeWidth={1.75} />
      ) : null}
      {linePts.map((p) => (
        <circle key={`d-${p.i}`} cx={p.x} cy={p.y} r={3} fill="#e8873a">
          <title>{`${periods[p.i]?.label} ${yoyLabel}: ${p.v >= 0 ? "+" : ""}${p.v.toFixed(1)}%`}</title>
        </circle>
      ))}

      {periods.map((p, i) => (
        <text
          key={`l-${i}`}
          x={padL + groupW * i + groupW / 2}
          y={h - 8}
          textAnchor="middle"
          className="fill-[var(--muted)]"
          fontSize={10}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
