"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  clamp,
  EARNINGS_YOY_COLOR,
  fmtAxis,
  fmtTip,
  fmtYoyTip,
  qoqFromValues,
  type CompareMode,
} from "@/components/market/earnings-compare";
import {
  EarningsComboTooltip,
  type ComboTipPos,
} from "@/components/market/earnings-combo-tooltip";
import type { EarningsStatement } from "@/lib/earnings/types";

export type { CompareMode };

type Props = {
  statement: EarningsStatement;
  rowKey: string;
  compareMode: CompareMode;
  valueLabel: string;
  compareLabel: string;
};

/** Fixed slot — thin bars, content wider than viewport so drag can reveal history. */
const SLOT_W = 56;
const H = 220;
const PAD_L = 52;
const PAD_T = 14;
const PAD_B = 28;

/** Dual-axis bar + compare line. Drag pans the X axis (no scrollbar). */
export function EarningsComboChart({
  statement,
  rowKey,
  compareMode,
  valueLabel,
  compareLabel,
}: Props) {
  const row = statement.rows.find((r) => r.key === rowKey);
  const clipId = useId().replace(/:/g, "");
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const panXRef = useRef(0);
  const minPanRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startPan: number;
    moved: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [panX, setPanX] = useState(0);
  const [tipPos, setTipPos] = useState<ComboTipPos | null>(null);

  const chronologic = row
    ? statement.periods
        .map((period, i) => ({
          period,
          value: row.values[i] ?? null,
          yoy: row.yoy[i] ?? null,
        }))
        .reverse()
        .filter(
          (
            p,
          ): p is {
            period: (typeof statement.periods)[number];
            value: number;
            yoy: number | null;
          } => p.value != null,
        )
    : [];
  const periods = chronologic.map((p) => p.period);
  const values = chronologic.map((p) => p.value);
  const yoysRaw = chronologic.map((p) => p.yoy);
  const compareRaw =
    compareMode === "off"
      ? []
      : compareMode === "qoq"
        ? qoqFromValues(values)
        : yoysRaw;
  const showCompare = compareMode !== "off";
  const n = periods.length;

  const padR = showCompare ? 48 : 12;
  const plotW = Math.max(n * SLOT_W, SLOT_W);
  const plotH = H - PAD_T - PAD_B;
  const slotW = SLOT_W;
  const barW = Math.min(22, slotW * 0.42);
  const viewW = Math.max(viewportW, 1);
  const clipW = Math.max(0, viewW - PAD_L - padR);
  const minPan = Math.min(0, clipW - plotW);
  const canPan = minPan < 0;
  minPanRef.current = minPan;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n, rowKey]);

  useLayoutEffect(() => {
    panXRef.current = minPan;
    setPanX(minPan);
    setHover(null);
    setTipPos(null);
  }, [rowKey, n, compareMode, minPan]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !n) return;

    const indexAt = (clientX: number, clientY: number): number | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const inv = ctm.inverse();
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const local = pt.matrixTransform(inv);
      const x = local.x - PAD_L - panXRef.current;
      if (x < 0 || x > plotW) return null;
      return Math.min(n - 1, Math.max(0, Math.floor(x / slotW)));
    };

    const applyPan = (next: number) => {
      const clamped = clamp(next, minPanRef.current, 0);
      panXRef.current = clamped;
      setPanX(clamped);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startPan: panXRef.current,
        moved: false,
      };
      setDragging(true);
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (drag && drag.pointerId === e.pointerId) {
        const dx = e.clientX - drag.startX;
        if (Math.abs(dx) > 3) {
          drag.moved = true;
          setHover(null);
          setTipPos(null);
        }
        applyPan(drag.startPan + dx);
        return;
      }
      if (!drag) setHover(indexAt(e.clientX, e.clientY));
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (!drag.moved) setHover(indexAt(e.clientX, e.clientY));
      dragRef.current = null;
      setDragging(false);
    };

    const onLeave = () => {
      if (!dragRef.current) {
        setHover(null);
        setTipPos(null);
      }
    };

    el.addEventListener("pointerdown", onDown, { passive: false });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [n, plotW, slotW]);

  const tipValue = hover != null && row ? values[hover] : null;
  const tipBarTop =
    tipValue != null
      ? (() => {
          const tipMax = Math.max(...values, 0.01);
          const tipMin = Math.min(0, ...values);
          const tipSpan = tipMax - tipMin || 1;
          const y0 = PAD_T + plotH - ((0 - tipMin) / tipSpan) * plotH;
          const y1 = PAD_T + plotH - ((tipValue - tipMin) / tipSpan) * plotH;
          return Math.min(y0, y1);
        })()
      : null;

  useLayoutEffect(() => {
    if (hover == null || tipBarTop == null || !svgRef.current) {
      setTipPos(null);
      return;
    }
    const place = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      // Bar center in root SVG user space (includes pan translate).
      const x = PAD_L + panXRef.current + slotW * hover + slotW / 2;
      const y = tipBarTop;
      const cx = ctm.a * x + ctm.c * y + ctm.e;
      const barScreenY = ctm.b * x + ctm.d * y + ctm.f;
      const tipH = 88;
      const tipHalf = 84;
      const placeAbove = barScreenY - tipH > 8;
      setTipPos({
        left: Math.min(
          window.innerWidth - tipHalf,
          Math.max(tipHalf, cx),
        ),
        top: placeAbove ? barScreenY - 10 : barScreenY + 28,
        place: placeAbove ? "above" : "below",
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [hover, tipBarTop, panX, slotW]);

  if (!row || !n) return null;

  const maxV = Math.max(...values, 0.01);
  const minV = Math.min(0, ...values);
  const spanV = maxV - minV || 1;
  const yBar = (v: number) => PAD_T + plotH - ((v - minV) / spanV) * plotH;

  const compareNums = showCompare
    ? compareRaw.filter((v): v is number => v != null)
    : [];
  const maxY = compareNums.length ? Math.max(...compareNums, 0) : 1;
  const minY = compareNums.length ? Math.min(...compareNums, 0) : 0;
  const spanY = maxY - minY || 1;
  const yLine = (v: number) => PAD_T + plotH - ((v - minY) / spanY) * plotH;

  const linePts = showCompare
    ? compareRaw
        .map((v, i) =>
          v == null
            ? null
            : {
                i,
                v,
                x: PAD_L + slotW * i + slotW / 2,
                y: yLine(v),
              },
        )
        .filter((p): p is { i: number; v: number; x: number; y: number } =>
          Boolean(p),
        )
    : [];
  const path = linePts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const tip =
    hover != null && values[hover] != null && tipPos
      ? {
          period: periods[hover]?.label ?? "",
          value: fmtTip(values[hover]!, row.unit),
          yoy:
            showCompare && compareRaw[hover] != null
              ? fmtYoyTip(compareRaw[hover]!)
              : null,
        }
      : null;

  return (
    <div
      ref={viewportRef}
      className={`relative w-full min-w-0 overflow-hidden touch-none select-none ${
        dragging ? "cursor-grabbing" : canPan ? "cursor-grab" : "cursor-default"
      }`}
      role="region"
      aria-label={valueLabel}
    >
      <svg
        ref={svgRef}
        width={viewW}
        height={H}
        viewBox={`0 0 ${viewW} ${H}`}
        className="pointer-events-none block select-none"
        style={{ width: "100%", height: H }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD_L} y={0} width={clipW} height={H} />
          </clipPath>
        </defs>

        <text x={4} y={PAD_T + 8} className="fill-[var(--muted)]" fontSize={9}>
          {fmtAxis(maxV, row.unit)}
        </text>
        <text x={4} y={PAD_T + plotH} className="fill-[var(--muted)]" fontSize={9}>
          {fmtAxis(minV, row.unit)}
        </text>
        {showCompare ? (
          <>
            <text
              x={viewW - 4}
              y={PAD_T + 8}
              textAnchor="end"
              className="fill-[var(--muted)]"
              fontSize={9}
            >
              {`${maxY >= 0 ? "+" : ""}${maxY.toFixed(1)}%`}
            </text>
            <text
              x={viewW - 4}
              y={PAD_T + plotH}
              textAnchor="end"
              className="fill-[var(--muted)]"
              fontSize={9}
            >
              {`${minY >= 0 ? "+" : ""}${minY.toFixed(1)}%`}
            </text>
          </>
        ) : null}

        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${panX} 0)`}>
            {[0.25, 0.5, 0.75].map((t) => {
              const y = PAD_T + plotH * (1 - t);
              return (
                <line
                  key={t}
                  x1={PAD_L}
                  y1={y}
                  x2={PAD_L + plotW}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={1}
                  opacity={0.55}
                />
              );
            })}
            {values.map((v, i) => {
              const cx = PAD_L + slotW * i + slotW / 2;
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
                  opacity={hover === i ? 1 : 0.88}
                />
              );
            })}
            {path ? (
              <path
                d={path}
                fill="none"
                stroke={EARNINGS_YOY_COLOR}
                strokeWidth={1.75}
              />
            ) : null}
            {linePts.map((p) => (
              <circle
                key={`d-${p.i}`}
                cx={p.x}
                cy={p.y}
                r={hover === p.i ? 4 : 3}
                fill={EARNINGS_YOY_COLOR}
              />
            ))}
            {periods.map((p, i) => (
              <text
                key={`l-${i}`}
                x={PAD_L + slotW * i + slotW / 2}
                y={H - 8}
                textAnchor="middle"
                className="fill-[var(--muted)]"
                fontSize={10}
              >
                {p.label}
              </text>
            ))}
          </g>
        </g>
      </svg>

      {tip && tipPos ? (
        <EarningsComboTooltip
          tip={tip}
          tipPos={tipPos}
          valueLabel={valueLabel}
          compareLabel={compareLabel}
        />
      ) : null}
    </div>
  );
}
