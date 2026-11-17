/** Paper-fill markers on the K-line (klinecharts overlays). */

export const TRADE_MARKERS_GROUP = "paper-fills";
export const USER_DRAWINGS_GROUP = "user-drawings";
/** Bumped whenever figure geometry changes — klinecharts keeps the first register. */
export const PAPER_FILL_OVERLAY = "paperFillTag";

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

const registeredNames = new Set<string>();

type OverlayStylesBag = {
  line?: { color?: string };
  text?: { backgroundColor?: string };
};

/**
 * Compact buy/sell tag: same-color chip + short stem + dot.
 * Styles are set on each figure so the chip never falls back to chart blue.
 */
export function ensurePaperFillOverlay(registerOverlay: RegisterOverlay) {
  if (registeredNames.has(PAPER_FILL_OVERLAY)) return;
  registeredNames.add(PAPER_FILL_OVERLAY);
  registerOverlay({
    name: PAPER_FILL_OVERLAY,
    totalStep: 2,
    needDefaultPointFigure: false,
    createPointFigures: ({
      overlay,
      coordinates,
    }: {
      overlay: {
        extendData?: unknown;
        styles?: OverlayStylesBag;
      };
      coordinates: Array<{ x: number; y: number }>;
    }) => {
      const raw = String(overlay.extendData ?? "");
      const sep = raw.indexOf(":");
      const side = sep >= 0 ? raw.slice(0, sep) : "buy";
      const text = sep >= 0 ? raw.slice(sep + 1) : raw || "·";
      const isBuy = side === "buy";
      const fill =
        overlay.styles?.text?.backgroundColor ||
        overlay.styles?.line?.color ||
        (isBuy ? "#e11d48" : "#16a34a");

      const x = coordinates[0]?.x ?? 0;
      const y = coordinates[0]?.y ?? 0;
      const stem = 14;
      const tipY = isBuy ? y - stem : y + stem;
      const labelY = isBuy ? tipY - 1 : tipY + 1;

      return [
        {
          type: "circle",
          attrs: { x, y, r: 2.5 },
          styles: {
            color: fill,
            style: "fill",
            borderColor: fill,
            borderSize: 0,
          },
          ignoreEvent: true,
        },
        {
          type: "line",
          attrs: {
            coordinates: [
              { x, y },
              { x, y: tipY },
            ],
          },
          styles: { color: fill, style: "solid", size: 1 },
          ignoreEvent: true,
        },
        {
          type: "text",
          attrs: {
            x,
            y: labelY,
            text,
            align: "center",
            baseline: isBuy ? "bottom" : "top",
          },
          styles: {
            style: "fill",
            color: "#ffffff",
            backgroundColor: fill,
            size: 10,
            weight: "600",
            family: "system-ui, -apple-system, sans-serif",
            borderRadius: 2,
            paddingLeft: 4,
            paddingRight: 4,
            paddingTop: 2,
            paddingBottom: 2,
            borderSize: 0,
            borderColor: "transparent",
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
    const fill = m.side === "buy" ? colors.up : colors.down;
    chart.createOverlay({
      name: PAPER_FILL_OVERLAY,
      id: `paper-fill-${m.side}-${m.id}`,
      groupId: TRADE_MARKERS_GROUP,
      lock: true,
      points: [{ timestamp: m.timeMs, value: m.price }],
      extendData: `${m.side}:${m.label}`,
      styles: {
        // createPointFigures reads these when figure styles need a fill.
        line: { color: fill, style: "solid", size: 1 },
        circle: {
          color: fill,
          style: "fill",
          borderColor: fill,
          borderSize: 0,
        },
        polygon: {
          color: fill,
          style: "fill",
          borderColor: fill,
          borderSize: 0,
        },
        text: {
          color: "#ffffff",
          backgroundColor: fill,
          size: 10,
          weight: "600",
          family: "system-ui, -apple-system, sans-serif",
          borderRadius: 2,
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 2,
          paddingBottom: 2,
          borderSize: 0,
          borderColor: "transparent",
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
