"use client";

/** Tiny SVG sparkline with area fill, derived from quote OHLC. */
export function Sparkline({
  open,
  high,
  low,
  close,
  up,
}: {
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
}) {
  const min = Math.min(open, high, low, close);
  const max = Math.max(open, high, low, close);
  const span = max - min || 1;
  const pts = [
    { x: 0, y: open },
    { x: 22, y: (open + high) / 2 },
    { x: 40, y: high },
    { x: 58, y: low },
    { x: 80, y: close },
  ].map((p) => ({
    x: p.x,
    y: 26 - ((p.y - min) / span) * 20 - 3,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L80,28 L0,28 Z`;
  const color = up ? "var(--up)" : "var(--down)";
  const gradId = `sg-${up ? "u" : "d"}-${Math.round(close * 100)}`;

  return (
    <svg width="80" height="28" viewBox="0 0 80 28" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[4].x} cy={pts[4].y} r="2.1" fill={color} />
    </svg>
  );
}
