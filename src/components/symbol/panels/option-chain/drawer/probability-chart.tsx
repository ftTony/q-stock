"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format-number";
import {
  formatConeDate,
  probAboveBelow,
  type ConePoint,
} from "./probability-math";

type Props = {
  cone: ConePoint[];
  spot: number;
  ivPct: number;
  ratePct: number;
  strikeMarks: number[];
  labels: {
    above: string;
    below: string;
  };
};

/** Interactive GBM probability cone — SVG, no chart lib. */
export function ProbabilityChart({
  cone,
  spot,
  ivPct,
  ratePct,
  strikeMarks,
  labels,
}: Props) {
  const W = 560;
  const H = 240;
  const PAD_L = 8;
  const PAD_R = 52;
  const PAD_T = 12;
  const PAD_B = 28;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { yMin, yMax, plotW, plotH } = useMemo(() => {
    if (!cone.length) {
      return { yMin: 0, yMax: 1, plotW: W, plotH: H };
    }
    const vals = [
      ...cone.map((p) => p.upper),
      ...cone.map((p) => p.lower),
      spot,
      ...strikeMarks,
    ];
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const pad = (hi - lo) * 0.08 || spot * 0.02;
    lo -= pad;
    hi += pad;
    return {
      yMin: lo,
      yMax: hi,
      plotW: W - PAD_L - PAD_R,
      plotH: H - PAD_T - PAD_B,
    };
  }, [cone, spot, strikeMarks]);

  if (cone.length < 2) return null;

  const sx = (i: number) => PAD_L + (i / (cone.length - 1)) * plotW;
  const sy = (v: number) =>
    PAD_T + ((yMax - v) / (yMax - yMin)) * plotH;

  const upperPath = cone
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(p.upper)}`)
    .join(" ");
  const lowerPath = cone
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(p.lower)}`)
    .join(" ");
  const bandPath = (() => {
    const up = cone
      .map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(p.upper)}`)
      .join(" ");
    let down = "";
    for (let i = cone.length - 1; i >= 0; i--) {
      down += ` L${sx(i)},${sy(cone[i]!.lower)}`;
    }
    return `${up}${down} Z`;
  })();

  const idx = hoverIdx ?? Math.min(cone.length - 1, Math.floor(cone.length * 0.55));
  const cursor = cone[idx]!;
  const cursorX = sx(idx);
  const probs = probAboveBelow({
    spot,
    level: spot,
    ivPct,
    days: cursor.days,
    ratePct,
  });

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const i = Math.min(cone.length - 1, Math.round(f * (cone.length - 1)));
    return { i, p: cone[i]! };
  });

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMin + (yMax - yMin) * (1 - f));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((x - PAD_L) / plotW) * (cone.length - 1));
    setHoverIdx(Math.min(cone.length - 1, Math.max(0, i)));
  }

  const tipW = 148;
  const tipLeft = Math.min(Math.max(PAD_L, cursorX + 10), W - tipW - 4);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label="probability cone"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {yTicks.map((v, i) => (
          <line
            key={`yg-${i}`}
            x1={PAD_L}
            y1={sy(v)}
            x2={W - PAD_R}
            y2={sy(v)}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={i === 2 ? undefined : "3 4"}
            opacity={i === 2 ? 0.35 : 0.5}
          />
        ))}
        {xTicks.map(({ i }) => (
          <line
            key={`xg-${i}`}
            x1={sx(i)}
            y1={PAD_T}
            x2={sx(i)}
            y2={H - PAD_B}
            stroke="var(--border)"
            strokeWidth="1"
            opacity={0.45}
          />
        ))}

        <path
          d={bandPath}
          fill="color-mix(in srgb, var(--brand) 12%, transparent)"
        />
        <path
          d={upperPath}
          fill="none"
          stroke="var(--brand-text)"
          strokeWidth="1.5"
        />
        <path
          d={lowerPath}
          fill="none"
          stroke="var(--brand-text)"
          strokeWidth="1.5"
        />

        {/* Label a few band prices */}
        {[0.35, 0.6, 0.85].map((f) => {
          const i = Math.min(cone.length - 1, Math.round(f * (cone.length - 1)));
          const p = cone[i]!;
          return (
            <g key={`lbl-${i}`}>
              <text
                x={sx(i) + 2}
                y={sy(p.upper) - 3}
                fontSize="9"
                fill="var(--brand-text)"
                className="tabular-nums"
              >
                {formatNumber(p.upper, { maximumFractionDigits: 3 })}
              </text>
              <text
                x={sx(i) + 2}
                y={sy(p.lower) + 10}
                fontSize="9"
                fill="var(--brand-text)"
                className="tabular-nums"
              >
                {formatNumber(p.lower, { maximumFractionDigits: 3 })}
              </text>
            </g>
          );
        })}

        {strikeMarks.map((k) => (
          <g key={`k-${k}`}>
            <line
              x1={PAD_L}
              y1={sy(k)}
              x2={W - PAD_R}
              y2={sy(k)}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth="1"
              opacity={0.85}
            />
            <text
              x={W - PAD_R + 4}
              y={sy(k) + 3}
              fontSize="9"
              fill="#f59e0b"
              className="tabular-nums"
            >
              {formatNumber(k, { maximumFractionDigits: 3 })}
            </text>
          </g>
        ))}

        <line
          x1={PAD_L}
          y1={sy(spot)}
          x2={W - PAD_R}
          y2={sy(spot)}
          stroke="var(--foreground)"
          strokeDasharray="4 3"
          strokeWidth="1"
          opacity={0.55}
        />
        <text
          x={W - PAD_R + 4}
          y={sy(spot) + 3}
          fontSize="9"
          fill="var(--foreground)"
          className="tabular-nums"
        >
          {formatNumber(spot, { maximumFractionDigits: 3 })}
        </text>

        <line
          x1={cursorX}
          y1={PAD_T}
          x2={cursorX}
          y2={H - PAD_B}
          stroke="var(--muted)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        <circle
          cx={cursorX}
          cy={sy(cursor.upper)}
          r={3.5}
          fill="var(--brand-text)"
        />
        <circle
          cx={cursorX}
          cy={sy(cursor.lower)}
          r={3.5}
          fill="var(--brand-text)"
        />

        {xTicks.map(({ i, p }) => (
          <text
            key={`xt-${i}`}
            x={sx(i)}
            y={H - 8}
            fontSize="9"
            textAnchor="middle"
            fill="var(--muted)"
            className="tabular-nums"
          >
            {formatConeDate(p.dateMs)}
          </text>
        ))}

        {/* Hit area */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={plotW}
          height={plotH}
          fill="transparent"
        />
      </svg>

      {probs ? (
        <div
          className="pointer-events-none absolute top-3 z-10 border border-[var(--border)] bg-[var(--panel)] px-2.5 py-2 text-[11px] shadow-sm"
          style={{ left: `min(${(tipLeft / W) * 100}%, calc(100% - 10rem))` }}
        >
          <div className="font-medium tabular-nums text-[var(--foreground)]">
            {formatConeDate(cursor.dateMs)}
          </div>
          <div className="mt-1 tabular-nums text-[var(--muted)]">
            {labels.above}{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {formatNumber(spot, { maximumFractionDigits: 3 })}
            </span>
            {": "}
            <span className="font-semibold text-[var(--up)]">
              {(probs.above * 100).toFixed(2)}%
            </span>
          </div>
          <div className="mt-0.5 tabular-nums text-[var(--muted)]">
            {labels.below}{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {formatNumber(spot, { maximumFractionDigits: 3 })}
            </span>
            {": "}
            <span className="font-semibold text-[var(--down)]">
              {(probs.below * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
