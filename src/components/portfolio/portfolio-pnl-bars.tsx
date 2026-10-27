"use client";

import { fmtMoney } from "@/components/portfolio/format";
import type { PaperPosition } from "@/components/portfolio/types";

type Props = {
  positions: PaperPosition[];
  ariaLabel: string;
};

export function PortfolioPnlBars({ positions, ariaLabel }: Props) {
  const rows = positions.map((p) => ({
    id: p.id,
    symbol: p.symbol,
    pnl: p.unrealizedPnl ?? 0,
    pct: p.unrealizedPnlPct,
  }));

  const w = 360;
  const h = 168;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const vals = rows.map((r) => r.pnl);
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 0.01);
  const yScale = (v: number) => padT + plotH / 2 - (v / maxAbs) * (plotH / 2);
  const zeroY = yScale(0);
  const groupW = plotW / Math.max(rows.length, 1);
  const barW = Math.min(28, groupW * 0.55);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <line
        x1={padL}
        y1={zeroY}
        x2={w - padR}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {rows.map((r, i) => {
        const cx = padL + groupW * i + groupW / 2;
        const y = yScale(r.pnl);
        const barH = Math.max(1, Math.abs(y - zeroY));
        const fill =
          r.pnl >= 0 ? "var(--up)" : "var(--down)";
        const tip =
          r.pct != null
            ? `${r.symbol}: ${r.pnl >= 0 ? "+" : ""}$${fmtMoney(r.pnl)} (${r.pct.toFixed(1)}%)`
            : `${r.symbol}: ${r.pnl >= 0 ? "+" : ""}$${fmtMoney(r.pnl)}`;
        return (
          <g key={r.id}>
            <rect
              x={cx - barW / 2}
              y={Math.min(y, zeroY)}
              width={barW}
              height={barH}
              fill={fill}
              opacity={0.9}
            >
              <title>{tip}</title>
            </rect>
            <text
              x={cx}
              y={h - 8}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {r.symbol.length > 6 ? `${r.symbol.slice(0, 5)}…` : r.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
