/** Paper-fill markers on the K-line (klinecharts overlays). */

export const TRADE_MARKERS_GROUP = "paper-fills";
export const USER_DRAWINGS_GROUP = "user-drawings";

export type ChartTradeMarker = {
  id: string;
  side: "buy" | "sell";
  /** Unix ms — same unit as klinecharts bar timestamps. */
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
      name: "simpleAnnotation",
      id: `paper-fill-${m.id}`,
      groupId: TRADE_MARKERS_GROUP,
      lock: true,
      points: [{ timestamp: m.timeMs, value: m.price }],
      extendData: m.label,
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
    filledAt?: string | null;
    filledPrice?: number | null;
  }>,
  labels: { buy: string; sell: string },
): ChartTradeMarker[] {
  const out: ChartTradeMarker[] = [];
  for (const o of orders) {
    if (o.status && o.status !== "filled") continue;
    if (o.side !== "buy" && o.side !== "sell") continue;
    if (o.filledPrice == null || !Number.isFinite(o.filledPrice)) continue;
    if (!o.filledAt) continue;
    const timeMs = Date.parse(o.filledAt);
    if (!Number.isFinite(timeMs)) continue;
    out.push({
      id: o.id,
      side: o.side,
      timeMs,
      price: o.filledPrice,
      label: o.side === "buy" ? labels.buy : labels.sell,
    });
  }
  // Stable order for overlay create
  out.sort((a, b) => a.timeMs - b.timeMs);
  return out;
}
