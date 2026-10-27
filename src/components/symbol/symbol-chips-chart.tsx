"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/format-number";
import type { VolumeProfile } from "@/lib/charts/volume-profile";

const W = 360;
const PAD = { t: 10, r: 58, b: 22, l: 8 };
const BAR_GAP = 0.75;
const MIN_PLOT_H = 260;

const COL = {
  resist: "#e89a3c",
  avg: "var(--aw-ink-muted-80,var(--muted))",
  support: "var(--brand)",
} as const;

type Props = {
  profile: VolumeProfile;
  dateLabel?: string;
};

function yOfPrice(
  price: number,
  priceHi: number,
  priceLo: number,
  plotH: number,
) {
  const span = priceHi - priceLo || 1;
  return PAD.t + ((priceHi - price) / span) * plotH;
}

export function SymbolChipsChart({ profile, dateLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const layout = useMemo(() => {
    const sorted = [...profile.buckets].reverse();
    const n = Math.max(1, sorted.length);
    const plotH = Math.max(MIN_PLOT_H, n * 6.5);
    const barH = Math.max(3.2, (plotH - BAR_GAP * (n - 1)) / n);
    const maxPct = Math.max(1, ...sorted.map((b) => b.pct));
    const priceHi = profile.priceHi ?? sorted[0]?.price ?? 1;
    const priceLo = profile.priceLo ?? sorted[n - 1]?.price ?? 0;
    const last = profile.lastPrice;
    return {
      rows: sorted,
      maxPct,
      plotH,
      barH,
      H: plotH + PAD.t + PAD.b,
      priceHi,
      priceLo,
      last,
    };
  }, [profile]);

  const { rows, maxPct, plotH, barH, H, priceHi, priceLo, last } = layout;
  const plotW = W - PAD.l - PAD.r;

  const guides = useMemo(() => {
    const items: { key: string; price: number; color: string }[] = [];
    if (profile.vah != null) {
      items.push({ key: "resist", price: profile.vah, color: COL.resist });
    }
    if (profile.avgCost != null) {
      items.push({ key: "avg", price: profile.avgCost, color: COL.avg });
    }
    if (profile.val != null) {
      items.push({ key: "support", price: profile.val, color: COL.support });
    }
    return items;
  }, [profile.vah, profile.avgCost, profile.val]);

  const vaBand = useMemo(() => {
    if (profile.val == null || profile.vah == null) return null;
    const yTop = yOfPrice(profile.vah, priceHi, priceLo, plotH);
    const yBot = yOfPrice(profile.val, priceHi, priceLo, plotH);
    return { y: yTop, h: Math.max(2, yBot - yTop) };
  }, [profile.val, profile.vah, priceHi, priceLo, plotH]);

  const active = hover != null ? rows[hover] : null;

  return (
    <div className="space-y-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full max-w-full"
        style={{ minHeight: MIN_PLOT_H }}
        role="img"
        onMouseLeave={() => setHover(null)}
      >
        {vaBand ? (
          <rect
            x={PAD.l}
            y={vaBand.y}
            width={plotW}
            height={vaBand.h}
            fill="var(--foreground)"
            opacity={0.05}
          />
        ) : null}

        {rows.map((b, i) => {
          const y = PAD.t + i * (barH + BAR_GAP);
          const w = Math.max(1.5, (b.pct / maxPct) * plotW);
          const above = last != null && b.price >= last;
          // CN chip convention: 套牢(above)=down/green, 获利(below)=up/red
          const fill = above ? "var(--down)" : "var(--up)";
          const dim = hover != null && hover !== i;
          return (
            <g key={`${b.price}-${i}`}>
              <rect
                x={PAD.l}
                y={y}
                width={w}
                height={barH}
                rx={0.4}
                fill={fill}
                opacity={dim ? 0.25 : 0.72}
              />
              <rect
                x={PAD.l}
                y={y}
                width={plotW}
                height={barH + BAR_GAP}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            </g>
          );
        })}

        <line
          x1={W - PAD.r}
          x2={W - PAD.r}
          y1={PAD.t}
          y2={PAD.t + plotH}
          stroke="var(--border)"
          strokeWidth={1}
        />

        {guides.map((g) => {
          const y = yOfPrice(g.price, priceHi, priceLo, plotH);
          return (
            <g key={g.key}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke={g.color}
                strokeWidth={1}
                strokeDasharray={g.key === "avg" ? "3 2" : undefined}
                opacity={0.9}
              />
              <rect
                x={W - PAD.r + 2}
                y={y - 8}
                width={52}
                height={16}
                rx={2}
                fill={g.color}
                opacity={g.key === "avg" ? 0.2 : 0.9}
              />
              <text
                x={W - PAD.r + 28}
                y={y + 4}
                textAnchor="middle"
                fill={
                  g.key === "avg"
                    ? "var(--foreground)"
                    : "var(--on-brand, #fff)"
                }
                style={{
                  fontSize: 10,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 600,
                }}
              >
                {formatNumber(g.price, { maximumFractionDigits: 2 })}
              </text>
            </g>
          );
        })}

        {active ? (
          <text
            x={W - PAD.r - 4}
            y={PAD.t + hover! * (barH + BAR_GAP) + barH / 2 + 3}
            textAnchor="end"
            fill="var(--foreground)"
            style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(active.pct, { maximumFractionDigits: 1 })}%
          </text>
        ) : null}

        {dateLabel ? (
          <text
            x={W - PAD.r}
            y={H - 6}
            textAnchor="end"
            fill="var(--muted)"
            style={{ fontSize: 10 }}
          >
            {dateLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
