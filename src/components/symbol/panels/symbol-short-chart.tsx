"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format-number";
import type { ShortRow } from "@/lib/market/providers/longbridge-research";

const W = 360;
const H = 240;
const PAD = { t: 16, r: 44, b: 32, l: 46 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

type Point = {
  i: number;
  x: number;
  rate: number | null;
  close: number | null;
  date: string;
};

function shortDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    const m = raw.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
    if (m) return `${Number(m[1])}/${Number(m[2])}`;
    return raw.slice(5) || raw;
  }
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function rowTime(raw: string): number {
  const t = Date.parse(raw);
  if (Number.isFinite(t)) return t;
  // Longbridge may return YYYY-MM-DD or MM/DD/YYYY
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return Date.UTC(+iso[1], +iso[2] - 1, +iso[3]);
  return 0;
}

function niceDomain(vals: number[], pad = 0.08): [number, number] {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  if (!(Number.isFinite(lo) && Number.isFinite(hi))) return [0, 1];
  if (lo === hi) {
    const d = Math.abs(lo) * 0.05 || 1;
    return [lo - d, hi + d];
  }
  const span = hi - lo;
  return [lo - span * pad, hi + span * pad];
}

function yScale(v: number, [min, max]: [number, number]) {
  return PAD.t + PLOT_H * (1 - (v - min) / (max - min || 1));
}

/** Smooth monotone-ish cubic through points (Catmull-Rom → bezier). */
function smoothLine(
  pts: { x: number; y: number }[],
): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

const AXIS_FS = 13;
/** Close series — warm accent so it separates from brand bars. */
const CLOSE_STROKE = "#e89a3c";

export function SymbolShortChart({
  rows,
  labels,
}: {
  rows: ShortRow[];
  labels: { rate: string; close: string };
}) {
  const [hover, setHover] = useState<number | null>(null);

  const { points, rateDom, closeDom, linePath, barW } = useMemo(() => {
    // Oldest → newest so the series spans left edge → right plot edge.
    const sorted = [...rows].sort(
      (a, b) => rowTime(a.timestamp) - rowTime(b.timestamp),
    );
    const n = sorted.length;
    const gap = n > 1 ? PLOT_W / (n - 1) : PLOT_W;
    const pts: Point[] = sorted.map((r, i) => ({
      i,
      x: n > 1 ? PAD.l + (i / (n - 1)) * PLOT_W : PAD.l + PLOT_W / 2,
      rate: r.rate,
      close: r.close,
      date: r.timestamp ? shortDate(r.timestamp) : "—",
    }));
    const rates = pts.map((p) => p.rate).filter((v): v is number => v != null);
    const closes = pts
      .map((p) => p.close)
      .filter((v): v is number => v != null);
    const rDom = niceDomain(rates.length ? rates : [0, 1], 0.12);
    if (rDom[0] > 0) rDom[0] = Math.max(0, rDom[0]);
    const cDom = niceDomain(closes.length ? closes : [0, 1], 0.08);
    const linePts = pts
      .filter((p) => p.close != null)
      .map((p) => ({ x: p.x, y: yScale(p.close!, cDom) }));
    return {
      points: pts,
      rateDom: rDom,
      closeDom: cDom,
      linePath: smoothLine(linePts),
      barW: Math.max(2.5, Math.min(9, gap * 0.42)),
    };
  }, [rows]);

  const active = hover != null ? points[hover] : points[points.length - 1];
  const tickIdx = [
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= 0 && points[v]);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[12px] leading-none tracking-[-0.12px] text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-2.5 rounded-[1px]"
              style={{
                background: "color-mix(in srgb, var(--brand) 50%, transparent)",
              }}
            />
            {labels.rate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-3"
              style={{ background: CLOSE_STROKE }}
            />
            {labels.close}
          </span>
        </div>
        {active ? (
          <span className="tabular-nums">
            <span className="text-[var(--muted)]">{active.date}</span>
            {active.rate != null ? (
              <span className="text-[var(--foreground)]">
                {" · "}
                {formatNumber(active.rate, { maximumFractionDigits: 2 })}%
              </span>
            ) : null}
            {active.close != null ? (
              <span style={{ color: CLOSE_STROKE }}>
                {" · "}
                {formatNumber(active.close, { maximumFractionDigits: 2 })}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="aspect-[360/240] h-auto w-full max-w-full"
        role="img"
        onMouseLeave={() => setHover(null)}
      >
        {/* Plot spines — series ends flush on these */}
        <line
          x1={PAD.l}
          x2={PAD.l}
          y1={PAD.t}
          y2={PAD.t + PLOT_H}
          stroke="var(--border)"
          strokeWidth={1}
        />
        <line
          x1={W - PAD.r}
          x2={W - PAD.r}
          y1={PAD.t}
          y2={PAD.t + PLOT_H}
          stroke="var(--border)"
          strokeWidth={1}
        />
        {[0.25, 0.5, 0.75].map((t) => {
          const y = PAD.t + PLOT_H * t;
          return (
            <line
              key={t}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={0.75}
              strokeDasharray="2 3"
              opacity={0.8}
            />
          );
        })}

        {points.map((p) => {
          if (p.rate == null) return null;
          const y = yScale(p.rate, rateDom);
          const h = Math.max(1, PAD.t + PLOT_H - y);
          const activeBar = hover === p.i;
          return (
            <rect
              key={`b-${p.i}`}
              x={p.x - barW / 2}
              y={y}
              width={barW}
              height={h}
              rx={0.75}
              fill="var(--brand)"
              opacity={activeBar || hover == null ? 0.38 : 0.16}
            />
          );
        })}

        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={CLOSE_STROKE}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.95}
          />
        ) : null}

        {hover != null && points[hover]?.close != null ? (
          <circle
            cx={points[hover].x}
            cy={yScale(points[hover].close!, closeDom)}
            r={3}
            fill="var(--panel)"
            stroke={CLOSE_STROKE}
            strokeWidth={1.25}
          />
        ) : null}

        <text
          x={PAD.l - 4}
          y={PAD.t + 4}
          textAnchor="end"
          fill="var(--aw-ink-muted-80,var(--muted))"
          style={{ fontSize: AXIS_FS, fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(rateDom[1], { maximumFractionDigits: 2 })}%
        </text>
        <text
          x={PAD.l - 4}
          y={PAD.t + PLOT_H}
          textAnchor="end"
          fill="var(--aw-ink-muted-80,var(--muted))"
          style={{ fontSize: AXIS_FS, fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(rateDom[0], { maximumFractionDigits: 2 })}%
        </text>
        <text
          x={W - PAD.r + 4}
          y={PAD.t + 4}
          textAnchor="start"
          fill="var(--aw-ink-muted-80,var(--muted))"
          style={{ fontSize: AXIS_FS, fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(closeDom[1], { maximumFractionDigits: 1 })}
        </text>
        <text
          x={W - PAD.r + 4}
          y={PAD.t + PLOT_H}
          textAnchor="start"
          fill="var(--aw-ink-muted-80,var(--muted))"
          style={{ fontSize: AXIS_FS, fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(closeDom[0], { maximumFractionDigits: 1 })}
        </text>

        {tickIdx.map((i) => (
          <text
            key={`t-${i}`}
            x={points[i].x}
            y={H - 10}
            textAnchor="middle"
            fill="var(--aw-ink-muted-80,var(--muted))"
            style={{ fontSize: AXIS_FS, fontVariantNumeric: "tabular-nums" }}
          >
            {points[i].date}
          </text>
        ))}

        {points.map((p) => (
          <rect
            key={`h-${p.i}`}
            x={p.x - Math.max(barW, 8)}
            y={PAD.t}
            width={Math.max(barW, 8) * 2}
            height={PLOT_H}
            fill="transparent"
            onMouseEnter={() => setHover(p.i)}
          />
        ))}
      </svg>
    </div>
  );
}
