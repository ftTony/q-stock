/** Paper-fill markers on the K-line (klinecharts overlays). */

export const TRADE_MARKERS_GROUP = "paper-fills";
export const USER_DRAWINGS_GROUP = "user-drawings";
export const PAPER_FILL_OVERLAY = "paperFillMarker";

/** Cap overlays — dense fills must not storm createOverlay on small hosts. */
export const TRADE_MARKERS_MAX = 40;

export type ChartTradeMarker = {
  id: string;
  side: "buy" | "sell";
  /** Unix ms — preferably snapped to a bar timestamp. */
  timeMs: number;
  price: number;
  /** Short label shown on the annotation (e.g. 买 / 卖). */
  label: string;
};

type OverlayHost = {
  removeOverlay: (filter?: { groupId?: string }) => void;
  createOverlay: (value: {
    name: string;
    id?: string;
    groupId?: string;
    lock?: boolean;
    points: Array<{ timestamp: number; value: number }>;
    extendData?: string;
    styles?: Record<string, unknown>;
  }) => unknown;
};

/** Loose boundary for klinecharts `registerOverlay` (generic OverlayTemplate). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- chart lib template variance
type RegisterOverlay = (template: any) => unknown;

let paperFillRegistered = false;

/**
 * Compact buy/sell pin (stem up for buy, down for sell) — readable on candle
 * and area, unlike the stock simpleAnnotation which always draws upward.
 */
export function ensurePaperFillOverlay(registerOverlay: RegisterOverlay) {
  if (paperFillRegistered) return;
  paperFillRegistered = true;
  registerOverlay({
    name: PAPER_FILL_OVERLAY,
    totalStep: 2,
    createPointFigures: ({
      overlay,
      coordinates,
    }: {
      overlay: { extendData?: unknown; styles?: Record<string, unknown> };
      coordinates: Array<{ x: number; y: number }>;
    }) => {
      const raw = String(overlay.extendData ?? "");
      const sep = raw.indexOf(":");
      const side = sep >= 0 ? raw.slice(0, sep) : "buy";
      const text = sep >= 0 ? raw.slice(sep + 1) : raw;
      const isBuy = side === "buy";
      const startX = coordinates[0]?.x ?? 0;
      const startY = coordinates[0]?.y ?? 0;
      const stem = 22;
      const tipY = isBuy ? startY - stem : startY + stem;
      const arrowY = isBuy ? tipY - 5 : tipY + 5;
      const textY = isBuy ? arrowY - 2 : arrowY + 2;

      return [
        {
          type: "polygon",
          attrs: {
            coordinates: [
              { x: startX, y: startY - 4 },
              { x: startX + 4, y: startY },
              { x: startX, y: startY + 4 },
              { x: startX - 4, y: startY },
            ],
          },
          ignoreEvent: true,
        },
        {
          type: "line",
          attrs: {
            coordinates: [
              { x: startX, y: startY },
              { x: startX, y: tipY },
            ],
          },
          ignoreEvent: true,
        },
        {
          type: "polygon",
          attrs: {
            coordinates: isBuy
              ? [
                  { x: startX, y: tipY },
                  { x: startX - 4, y: arrowY },
                  { x: startX + 4, y: arrowY },
                ]
              : [
                  { x: startX, y: tipY },
                  { x: startX - 4, y: arrowY },
                  { x: startX + 4, y: arrowY },
                ],
          },
          ignoreEvent: true,
        },
        {
          type: "text",
          attrs: {
            x: startX,
            y: textY,
            text,
            align: "center",
            baseline: isBuy ? "bottom" : "top",
          },
          ignoreEvent: true,
        },
      ];
    },
  });
}

function readUpDown() {
  if (typeof document === "undefined") {
    return { up: "#e11d48", down: "#16a34a" };
  }
  const styles = getComputedStyle(document.documentElement);
  return {
    up: styles.getPropertyValue("--up").trim() || "#e11d48",
    down: styles.getPropertyValue("--down").trim() || "#16a34a",
  };
}

/** Parse API filledAt (ISO string) or legacy Date-like values. */
export function parseFilledAtMs(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    // Heuristic: seconds vs ms
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? t : null;
  }
  if (typeof value === "string" && value.trim()) {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}

/**
 * Snap fill time onto a bar so the pin sits on a candle/area point
 * (intraday fills on D would otherwise float between daily bars).
 */
export function snapTradeMarkerTimeMs(
  timeMs: number,
  bars: Array<{ time: number }>,
): number {
  if (!bars.length || !Number.isFinite(timeMs)) return timeMs;
  const first = bars[0].time * 1000;
  const last = bars[bars.length - 1].time * 1000;
  if (timeMs >= last) return last;
  if (timeMs <= first) return first;
  let snapped = bars[0].time;
  for (const b of bars) {
    const t = b.time * 1000;
    if (t <= timeMs) snapped = b.time;
    else break;
  }
  return snapped * 1000;
}

export function snapTradeMarkersToBars(
  markers: ChartTradeMarker[],
  bars: Array<{ time: number }>,
): ChartTradeMarker[] {
  if (!markers.length || !bars.length) return markers;
  return markers.map((m) => ({
    ...m,
    timeMs: snapTradeMarkerTimeMs(m.timeMs, bars),
  }));
}

/** Replace all paper-fill overlays. Safe to call when chart is ready. */
export function syncTradeMarkers(
  chart: OverlayHost | null | undefined,
  markers: ChartTradeMarker[],
) {
  if (!chart) return;
  chart.removeOverlay({ groupId: TRADE_MARKERS_GROUP });
  if (!markers.length) return;

  const colors = readUpDown();
  for (const m of markers) {
    if (!Number.isFinite(m.timeMs) || !Number.isFinite(m.price)) continue;
    const color = m.side === "buy" ? colors.up : colors.down;
    chart.createOverlay({
      name: PAPER_FILL_OVERLAY,
      id: `paper-fill-${m.side}-${m.id}`,
      groupId: TRADE_MARKERS_GROUP,
      lock: true,
      points: [{ timestamp: m.timeMs, value: m.price }],
      extendData: `${m.side}:${m.label}`,
      styles: {
        line: { color, style: "solid", size: 1 },
        polygon: { color, style: "fill", borderColor: color, borderSize: 1 },
        text: {
          color,
          size: 11,
          weight: "bold",
          family: "system-ui, sans-serif",
        },
      },
    });
  }
}

export function ordersToTradeMarkers(
  orders: Array<{
    id: string;
    side: string;
    status?: string;
    filledAt?: string | Date | number | null;
    filledPrice?: number | null;
  }>,
  labels: { buy: string; sell: string },
): ChartTradeMarker[] {
  const out: ChartTradeMarker[] = [];
  for (const o of orders) {
    if (o.status && o.status !== "filled") continue;
    if (o.side !== "buy" && o.side !== "sell") continue;
    if (o.filledPrice == null || !Number.isFinite(o.filledPrice)) continue;
    const timeMs = parseFilledAtMs(o.filledAt);
    if (timeMs == null) continue;
    out.push({
      id: o.id,
      side: o.side,
      timeMs,
      price: o.filledPrice,
      label: o.side === "buy" ? labels.buy : labels.sell,
    });
  }
  out.sort((a, b) => a.timeMs - b.timeMs);
  if (out.length <= TRADE_MARKERS_MAX) return out;
  return out.slice(out.length - TRADE_MARKERS_MAX);
}
