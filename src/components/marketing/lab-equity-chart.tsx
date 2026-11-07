"use client";

import { useCallback, useRef, useState } from "react";
import { LAB_SAMPLE, LAB_SAMPLE_EQUITY } from "@/lib/marketing/lab-sample";

/**
 * /lab 首屏的净值对比曲线（客户端组件）：
 * 桌面 hover / 移动端触摸时显示十字线 + 浮层（日期、规则净值、买入持有）。
 * 数据仍是 LAB_SAMPLE_EQUITY（runReplay 实跑抽点），不是示意图。
 */

const W = 520;
const H = 150;
const PAD = 6;
const N = LAB_SAMPLE_EQUITY.length;

const values = LAB_SAMPLE_EQUITY.flatMap((p) => [p.e, p.b]);
const min = Math.min(...values);
const max = Math.max(...values);
const span = max - min || 1;

const x = (i: number) => PAD + (i * (W - PAD * 2)) / (N - 1);
const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2);

const line = (key: "e" | "b") =>
  LAB_SAMPLE_EQUITY.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

const baseY = y(LAB_SAMPLE.initialCash);

/** 千分位整数，不用 locale 相关 API，避免 SSR/CSR 水合差异。 */
function fmt(v: number) {
  const s = Math.round(v).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function LabEquityChart({
  ruleLabel,
  buyHoldLabel,
  ariaLabel,
}: {
  ruleLabel: string;
  buyHoldLabel: string;
  ariaLabel: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState<number | null>(null);

  const locate = useCallback((clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const padPx = (PAD / W) * rect.width;
    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left - padPx) / (rect.width - padPx * 2)),
    );
    setIdx(Math.round(ratio * (N - 1)));
  }, []);

  const point = idx === null ? null : LAB_SAMPLE_EQUITY[idx];
  // 浮层靠右半个图时向左翻，避免溢出卡片。
  const flip = idx !== null && idx > N * 0.58;

  return (
    <div
      ref={wrapRef}
      className="relative touch-pan-y"
      onMouseMove={(e) => locate(e.clientX)}
      onMouseLeave={() => setIdx(null)}
      onTouchStart={(e) => locate(e.touches[0].clientX)}
      onTouchMove={(e) => locate(e.touches[0].clientX)}
      onTouchEnd={() => setIdx(null)}
    >
      <svg
        className="h-[150px] w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        <line
          x1={PAD}
          x2={W - PAD}
          y1={baseY}
          y2={baseY}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <polyline
          points={line("b")}
          fill="none"
          stroke="var(--muted)"
          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
        <polyline
          points={line("e")}
          fill="none"
          stroke="var(--brand-text)"
          strokeWidth="1.8"
        />
        {idx !== null && point && (
          <g>
            <line
              x1={x(idx)}
              x2={x(idx)}
              y1={PAD}
              y2={H - PAD}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <circle cx={x(idx)} cy={y(point.b)} r="3" fill="var(--muted)" />
            <circle
              cx={x(idx)}
              cy={y(point.e)}
              r="3.5"
              fill="var(--brand-text)"
              stroke="var(--panel)"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {idx !== null && point && (
        <div
          className={`pointer-events-none absolute top-1 z-10 min-w-[150px] rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 text-[11px] shadow-md ${
            flip ? "right-1" : "left-1"
          }`}
          style={flip ? undefined : { left: `min(${(x(idx) / W) * 100}%, calc(100% - 160px))` }}
        >
          <span className="block text-[10px] tabular-nums text-[var(--muted)]">
            {point.d}
          </span>
          <span className="mt-1 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
              <i className="inline-block h-0.5 w-3 rounded-full bg-[var(--brand-text)]" />
              {ruleLabel}
            </span>
            <b className="tabular-nums">{fmt(point.e)}</b>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
              <i className="inline-block h-0.5 w-3 rounded-full border-t border-dashed border-[var(--muted)]" />
              {buyHoldLabel}
            </span>
            <b className="tabular-nums">{fmt(point.b)}</b>
          </span>
        </div>
      )}
    </div>
  );
}
