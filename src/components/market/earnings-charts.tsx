"use client";

import type {
  EarningsCalendarRow,
  EarningsSurprise,
} from "@/components/market/earnings-panel";

function shortLabel(e: EarningsSurprise): string {
  if (e.quarter && e.year) return `${String(e.year).slice(2)}Q${e.quarter}`;
  if (e.period) return e.period.slice(0, 7);
  return "?";
}

export function EarningsCharts({
  surprises,
  recent,
  labels,
}: {
  surprises: EarningsSurprise[];
  recent: EarningsCalendarRow[];
  labels: {
    chartEps: string;
    chartSurprise: string;
    chartRevenue: string;
    actual: string;
    estimate: string;
  };
}) {
  const series = [...surprises]
    .filter((s) => s.actual != null || s.estimate != null)
    .slice(0, 8)
    .reverse();

  const revSeries = [...recent]
    .filter((r) => r.revenueActual != null || r.revenueEstimate != null)
    .slice(0, 8)
    .reverse();

  if (!series.length && !revSeries.length) return null;

  return (
    <div className="space-y-5">
      {series.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 sm:p-4">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {labels.chartEps}
          </h3>
          <EpsBarChart data={series} actualLabel={labels.actual} estimateLabel={labels.estimate} />
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--up)]" />
              {labels.actual}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--muted)] opacity-70" />
              {labels.estimate}
            </span>
          </div>
        </section>
      )}

      {series.some((s) => s.surprisePercent != null) && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 sm:p-4">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {labels.chartSurprise}
          </h3>
          <SurpriseLineChart data={series} />
        </section>
      )}

      {revSeries.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 sm:p-4">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            {labels.chartRevenue}
          </h3>
          <RevenueBarChart data={revSeries} actualLabel={labels.actual} estimateLabel={labels.estimate} />
        </section>
      )}
    </div>
  );
}

function EpsBarChart({
  data,
  actualLabel,
  estimateLabel,
}: {
  data: EarningsSurprise[];
  actualLabel: string;
  estimateLabel: string;
}) {
  const w = 560;
  const h = 180;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const vals = data.flatMap((d) => [d.actual, d.estimate]).filter((v): v is number => v != null);
  const max = Math.max(...vals, 0.01);
  const min = Math.min(...vals, 0);
  const span = max - min || 1;
  const groupW = plotW / data.length;
  const barW = Math.min(16, groupW * 0.32);

  const yScale = (v: number) => padT + plotH - ((v - min) / span) * plotH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={actualLabel}>
      <line
        x1={padL}
        y1={yScale(0)}
        x2={w - padR}
        y2={yScale(0)}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {data.map((d, i) => {
        const cx = padL + groupW * i + groupW / 2;
        const a = d.actual;
        const e = d.estimate;
        return (
          <g key={i}>
            {e != null && (
              <rect
                x={cx - barW - 1}
                y={Math.min(yScale(e), yScale(0))}
                width={barW}
                height={Math.max(1, Math.abs(yScale(e) - yScale(0)))}
                fill="var(--muted)"
                opacity={0.55}
              >
                <title>{`${estimateLabel}: ${e}`}</title>
              </rect>
            )}
            {a != null && (
              <rect
                x={cx + 1}
                y={Math.min(yScale(a), yScale(0))}
                width={barW}
                height={Math.max(1, Math.abs(yScale(a) - yScale(0)))}
                fill="var(--up)"
                opacity={0.9}
              >
                <title>{`${actualLabel}: ${a}`}</title>
              </rect>
            )}
            <text
              x={cx}
              y={h - 8}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {shortLabel(d)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SurpriseLineChart({ data }: { data: EarningsSurprise[] }) {
  const w = 560;
  const h = 160;
  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const pts = data.map((d, i) => ({
    i,
    v: d.surprisePercent,
    label: shortLabel(d),
  }));
  const nums = pts.map((p) => p.v).filter((v): v is number => v != null);
  if (!nums.length) return null;
  const max = Math.max(...nums, 0);
  const min = Math.min(...nums, 0);
  const span = max - min || 1;
  const xAt = (i: number) =>
    padL + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const yAt = (v: number) => padT + plotH - ((v - min) / span) * plotH;
  const path = pts
    .filter((p) => p.v != null)
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${xAt(p.i)} ${yAt(p.v!)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      <line
        x1={padL}
        y1={yAt(0)}
        x2={w - padR}
        y2={yAt(0)}
        stroke="var(--border)"
        strokeDasharray="4 3"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke="var(--brand)" strokeWidth={2} />
      {pts.map((p) =>
        p.v == null ? null : (
          <g key={p.i}>
            <circle
              cx={xAt(p.i)}
              cy={yAt(p.v)}
              r={3.5}
              fill={p.v >= 0 ? "var(--up)" : "var(--down)"}
            >
              <title>{`${p.label}: ${p.v.toFixed(1)}%`}</title>
            </circle>
            <text
              x={xAt(p.i)}
              y={h - 8}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {p.label}
            </text>
          </g>
        ),
      )}
    </svg>
  );
}

function RevenueBarChart({
  data,
  actualLabel,
  estimateLabel,
}: {
  data: EarningsCalendarRow[];
  actualLabel: string;
  estimateLabel: string;
}) {
  const w = 560;
  const h = 180;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const vals = data
    .flatMap((d) => [d.revenueActual, d.revenueEstimate])
    .filter((v): v is number => v != null)
    .map((v) => v / 1e9);
  const max = Math.max(...vals, 0.01);
  const groupW = plotW / data.length;
  const barW = Math.min(16, groupW * 0.32);
  const yScale = (vBn: number) => padT + plotH - (vBn / max) * plotH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      {data.map((d, i) => {
        const cx = padL + groupW * i + groupW / 2;
        const a = d.revenueActual != null ? d.revenueActual / 1e9 : null;
        const e = d.revenueEstimate != null ? d.revenueEstimate / 1e9 : null;
        return (
          <g key={i}>
            {e != null && (
              <rect
                x={cx - barW - 1}
                y={yScale(e)}
                width={barW}
                height={Math.max(1, padT + plotH - yScale(e))}
                fill="var(--muted)"
                opacity={0.55}
              >
                <title>{`${estimateLabel}: ${e.toFixed(2)}B`}</title>
              </rect>
            )}
            {a != null && (
              <rect
                x={cx + 1}
                y={yScale(a)}
                width={barW}
                height={Math.max(1, padT + plotH - yScale(a))}
                fill="var(--brand)"
                opacity={0.85}
              >
                <title>{`${actualLabel}: ${a.toFixed(2)}B`}</title>
              </rect>
            )}
            <text
              x={cx}
              y={h - 8}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              fontSize={10}
            >
              {`${String(d.year).slice(2)}Q${d.quarter}`}
            </text>
          </g>
        );
      })}
      <text x={4} y={padT + 10} className="fill-[var(--muted)]" fontSize={9}>
        $B
      </text>
    </svg>
  );
}
