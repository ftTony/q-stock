"use client";

import type { CapitalSnapshot } from "@/lib/market/providers/longbridge-research";

type Seg = {
  key: string;
  value: number;
  color: string;
  side: "in" | "out";
};

type Arc = Seg & {
  start: number;
  end: number;
  mid: number;
  pct: number;
};

const CX = 140;
const CY = 112;
const R_OUT = 58;
const R_IN = 36;
const GAP = 0.035; // radians gap between slices
const LABEL_R = 86;

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

/** Build 6 slices: large→small inflow, then small→large outflow (clockwise from 12 o'clock). */
export function buildFundsSegments(data: CapitalSnapshot): Seg[] {
  return [
    {
      key: "in-large",
      value: Math.max(0, data.inflow.large),
      color: "color-mix(in srgb, var(--up) 92%, #000)",
      side: "in",
    },
    {
      key: "in-medium",
      value: Math.max(0, data.inflow.medium),
      color: "color-mix(in srgb, var(--up) 72%, white)",
      side: "in",
    },
    {
      key: "in-small",
      value: Math.max(0, data.inflow.small),
      color: "color-mix(in srgb, var(--up) 48%, white)",
      side: "in",
    },
    {
      key: "out-small",
      value: Math.max(0, data.outflow.small),
      color: "color-mix(in srgb, var(--down) 48%, white)",
      side: "out",
    },
    {
      key: "out-medium",
      value: Math.max(0, data.outflow.medium),
      color: "color-mix(in srgb, var(--down) 72%, white)",
      side: "out",
    },
    {
      key: "out-large",
      value: Math.max(0, data.outflow.large),
      color: "color-mix(in srgb, var(--down) 92%, #000)",
      side: "out",
    },
  ];
}

function toArcs(segs: Seg[]): Arc[] {
  const total = segs.reduce((s, x) => s + x.value, 0);
  if (!(total > 0)) return [];
  const usable = Math.PI * 2 - GAP * segs.filter((s) => s.value > 0).length;
  let angle = -Math.PI / 2;
  const arcs: Arc[] = [];
  for (const seg of segs) {
    if (!(seg.value > 0)) continue;
    const sweep = (seg.value / total) * usable;
    const start = angle + GAP / 2;
    const end = start + sweep;
    arcs.push({
      ...seg,
      start,
      end,
      mid: (start + end) / 2,
      pct: (seg.value / total) * 100,
    });
    angle = end + GAP / 2;
  }
  return arcs;
}

export function SymbolFundsDonut({ data }: { data: CapitalSnapshot }) {
  const arcs = toArcs(buildFundsSegments(data));
  if (!arcs.length) return null;

  return (
    <svg
      viewBox="0 0 280 224"
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-hidden
    >
      {arcs.map((a) => {
        const midOuter = polar(CX, CY, R_OUT + 4, a.mid);
        const elbow = polar(CX, CY, LABEL_R - 8, a.mid);
        const right = Math.cos(a.mid) >= 0;
        const labelX = right ? CX + LABEL_R + 4 : CX - LABEL_R - 4;
        const labelY = elbow.y;
        return (
          <g key={a.key}>
            <path
              d={donutPath(CX, CY, R_OUT, R_IN, a.start, a.end)}
              fill={a.color}
              stroke="var(--panel)"
              strokeWidth={1.5}
            />
            <path
              d={`M ${midOuter.x} ${midOuter.y} L ${elbow.x} ${elbow.y} L ${labelX} ${labelY}`}
              fill="none"
              stroke={a.color}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={right ? "start" : "end"}
              dominantBaseline="middle"
              className="fill-[var(--foreground)]"
              style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
            >
              {a.pct.toFixed(2)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
