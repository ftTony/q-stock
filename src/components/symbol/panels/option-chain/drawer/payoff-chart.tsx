"use client";

import { formatNumber } from "@/lib/format-number";

/** P&L at expiry: combined curve over dashed per-leg curves, spot + breakevens. */
export function PayoffChart({
  prices,
  combined,
  perLeg,
  spot,
  breakevens,
  strikeMarks,
}: {
  prices: number[];
  combined: number[];
  perLeg: number[][];
  spot: number;
  breakevens: number[];
  strikeMarks: number[];
}) {
  const W = 560;
  const H = 220;
  const PAD_X = 34;
  const PAD_Y = 14;
  if (prices.length < 2) return null;

  const all = [...combined, ...perLeg.flat(), 0];
  let yMin = Math.min(...all);
  let yMax = Math.max(...all);
  if (yMax - yMin < 1) {
    yMax += 1;
    yMin -= 1;
  }
  const pad = (yMax - yMin) * 0.08;
  yMin -= pad;
  yMax += pad;
  const x0 = prices[0]!;
  const x1 = prices[prices.length - 1]!;
  const sx = (p: number) =>
    PAD_X + ((p - x0) / (x1 - x0)) * (W - PAD_X * 2);
  const sy = (v: number) =>
    H - PAD_Y - ((v - yMin) / (yMax - yMin)) * (H - PAD_Y * 2);

  const line = (ys: number[]) =>
    ys.map((v, i) => `${i === 0 ? "M" : "L"}${sx(prices[i]!)},${sy(v)}`).join(" ");

  const zeroY = sy(0);
  const spotX = sx(Math.min(Math.max(spot, x0), x1));

  const legColors = ["#8b97ad", "#c084fc", "#f59e0b", "#10b981"];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="payoff"
    >
      {/* zero P&L axis */}
      <line
        x1={PAD_X}
        y1={zeroY}
        x2={W - PAD_X}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth="1"
      />
      {/* spot marker */}
      <line
        x1={spotX}
        y1={PAD_Y}
        x2={spotX}
        y2={H - PAD_Y}
        stroke="var(--muted)"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      <text x={spotX + 4} y={PAD_Y + 10} fontSize="10" fill="var(--muted)">
        {formatNumber(spot, { maximumFractionDigits: 2 })}
      </text>
      {/* leg payoffs (dashed) */}
      {perLeg.map((ys, i) => (
        <path
          key={i}
          d={line(ys)}
          fill="none"
          stroke={legColors[i % legColors.length]}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity="0.75"
        />
      ))}
      {/* combined payoff */}
      <path d={line(combined)} fill="none" stroke="var(--brand)" strokeWidth="2.2" />
      {/* breakeven markers */}
      {breakevens.map((b, i) => (
        <g key={i}>
          <circle cx={sx(b)} cy={zeroY} r="3.5" fill="var(--brand)" />
          <text
            x={sx(b)}
            y={zeroY + (combined[0]! >= 0 ? 14 : -6)}
            fontSize="10"
            textAnchor="middle"
            fill="var(--foreground)"
          >
            {formatNumber(b, { maximumFractionDigits: 2 })}
          </text>
        </g>
      ))}
      {/* strike ticks */}
      {strikeMarks.map((k) => (
        <line
          key={k}
          x1={sx(k)}
          y1={H - PAD_Y}
          x2={sx(k)}
          y2={H - PAD_Y + 3}
          stroke="var(--muted)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
