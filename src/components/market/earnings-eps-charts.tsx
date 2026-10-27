"use client";

import type { EarningsSurprise } from "@/components/market/earnings-panel";

/** Reference palette: 实际=红, 预期=灰; 惊喜点 正红/负绿; 折线蓝. */
const COLOR_ACTUAL = "#e11d48";
const COLOR_ESTIMATE = "#c4c4c4";
const COLOR_LINE = "#3b6fd9";
const COLOR_SURPRISE_POS = "#e11d48";
const COLOR_SURPRISE_NEG = "#16a34a";

function shortLabel(e: EarningsSurprise): string {
  if (e.quarter && e.year) return `${String(e.year).slice(2)}Q${e.quarter}`;
  if (e.period) {
    const m = e.period.match(/(\d{4})\D*([1-4])/);
    if (m) return `${m[1]!.slice(2)}Q${m[2]}`;
    return e.period.slice(0, 7);
  }
  return "?";
}

function surprisePct(e: EarningsSurprise): number | null {
  if (e.surprisePercent != null && Number.isFinite(e.surprisePercent)) {
    return e.surprisePercent;
  }
  if (
    e.actual != null &&
    e.estimate != null &&
    Number.isFinite(e.actual) &&
    Number.isFinite(e.estimate) &&
    e.estimate !== 0
  ) {
    return ((e.actual - e.estimate) / Math.abs(e.estimate)) * 100;
  }
  return null;
}

type Point = {
  label: string;
  actual: number | null;
  estimate: number | null;
  surprise: number | null;
};

/** Shared X layout so bar groups and surprise dots share the same column centers. */
const LAYOUT = {
  w: 560,
  padL: 12,
  padR: 12,
  barH: 168,
  lineH: 148,
  padT: 10,
  padB: 24,
} as const;

function xCenter(i: number, n: number): number {
  const plotW = LAYOUT.w - LAYOUT.padL - LAYOUT.padR;
  const groupW = plotW / Math.max(n, 1);
  return LAYOUT.padL + groupW * i + groupW / 2;
}

/** Newest-first EPS actual vs estimate + surprise % — aligned like reference. */
export function EarningsEpsCharts({
  surprises,
  labels,
}: {
  surprises: EarningsSurprise[];
  labels: {
    chartEps: string;
    chartSurprise: string;
    actual: string;
    estimate: string;
  };
}) {
  const series: Point[] = [...surprises]
    .filter((s) => s.actual != null || s.estimate != null)
    .sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.quarter - a.quarter,
    )
    .slice(0, 8)
    .map((s) => ({
      label: shortLabel(s),
      actual: s.actual,
      estimate: s.estimate,
      surprise: surprisePct(s),
    }));

  if (!series.length) return null;

  const hasSurprise = series.some((s) => s.surprise != null);

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.15px] text-[var(--foreground)]">
          {labels.chartEps}
        </h3>
        <EpsBarChart data={series} actualLabel={labels.actual} estimateLabel={labels.estimate} />
        <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: COLOR_ACTUAL }}
            />
            {labels.actual}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: COLOR_ESTIMATE }}
            />
            {labels.estimate}
          </span>
        </div>
      </section>

      {hasSurprise ? (
        <section>
          <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.15px] text-[var(--foreground)]">
            {labels.chartSurprise}
          </h3>
          <SurpriseLineChart data={series} />
        </section>
      ) : null}
    </div>
  );
}

function EpsBarChart({
  data,
  actualLabel,
  estimateLabel,
}: {
  data: Point[];
  actualLabel: string;
  estimateLabel: string;
}) {
  const { w, padL, padR, padT, padB, barH: h } = LAYOUT;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const vals = data
    .flatMap((d) => [d.actual, d.estimate])
    .filter((v): v is number => v != null);
  // Floor at 0 when all positive — matches reference baseline at bottom
  const max = Math.max(...vals, 0.01);
  const min = Math.min(0, ...vals);
  const span = max - min || 1;
  const n = data.length;
  const groupW = plotW / Math.max(n, 1);
  const barW = Math.min(16, Math.max(6, groupW * 0.3));
  const yScale = (v: number) => padT + plotH - ((v - min) / span) * plotH;
  const zeroY = yScale(0);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={actualLabel}
    >
      <line
        x1={padL}
        y1={zeroY}
        x2={w - padR}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {data.map((d, i) => {
        const cx = xCenter(i, n);
        return (
          <g key={`${d.label}-${i}`}>
            {d.estimate != null && (
              <rect
                x={cx - barW - 1.5}
                y={Math.min(yScale(d.estimate), zeroY)}
                width={barW}
                height={Math.max(1, Math.abs(yScale(d.estimate) - zeroY))}
                fill={COLOR_ESTIMATE}
              >
                <title>{`${estimateLabel}: ${d.estimate}`}</title>
              </rect>
            )}
            {d.actual != null && (
              <rect
                x={cx + 1.5}
                y={Math.min(yScale(d.actual), zeroY)}
                width={barW}
                height={Math.max(1, Math.abs(yScale(d.actual) - zeroY))}
                fill={COLOR_ACTUAL}
              >
                <title>{`${actualLabel}: ${d.actual}`}</title>
              </rect>
            )}
            <text
              x={cx}
              y={h - 6}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SurpriseLineChart({ data }: { data: Point[] }) {
  const { w, padL, padR, padT, padB, lineH: h } = LAYOUT;
  const plotH = h - padT - padB;
  const n = data.length;
  const nums = data
    .map((d) => d.surprise)
    .filter((v): v is number => v != null);
  if (!nums.length) return null;

  const max = Math.max(...nums, 0);
  const min = Math.min(...nums, 0);
  const span = max - min || 1;
  const yAt = (v: number) => padT + plotH - ((v - min) / span) * plotH;
  const zeroY = yAt(0);

  const path = data
    .map((d, i) =>
      d.surprise == null ? null : { i, v: d.surprise, x: xCenter(i, n) },
    )
    .filter((p): p is { i: number; v: number; x: number } => Boolean(p))
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${yAt(p.v)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      <line
        x1={padL}
        y1={zeroY}
        x2={w - padR}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke={COLOR_LINE} strokeWidth={1.75} />
      {data.map((d, i) => {
        if (d.surprise == null) return null;
        const cx = xCenter(i, n);
        const pos = d.surprise >= 0;
        return (
          <g key={`${d.label}-s-${i}`}>
            <circle
              cx={cx}
              cy={yAt(d.surprise)}
              r={3.5}
              fill={pos ? COLOR_SURPRISE_POS : COLOR_SURPRISE_NEG}
            >
              <title>
                {`${d.label}: ${pos ? "+" : ""}${d.surprise.toFixed(1)}%`}
              </title>
            </circle>
            <text
              x={cx}
              y={h - 6}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
