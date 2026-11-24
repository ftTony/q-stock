import type { OhlcvBar } from "@/lib/types";

/** Cap points on the baseline overlay — keep draw cheap on 1GB hosts. */
export const BASELINE_POINTS_MAX = 800;
export const BASELINE_GROUP = "chart-baseline";
export const BASELINE_OVERLAY = "chartBaselineFill";

export type BaselineQuote = {
  previousClose?: number | null;
};

type Pt = { x: number; y: number };

/**
 * A-slice baseline source: previous close only.
 * Returns null when unavailable so the pane can degrade quietly.
 */
export function resolveBaselinePrice(
  quote: BaselineQuote | null | undefined,
): number | null {
  const n = Number(quote?.previousClose);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Build fill polygons between a close path and a horizontal baseline.
 * Canvas y grows downward, so price-above-baseline ⇒ point.y < baselineY.
 */
export function buildBaselineFillPolygons(
  coordinates: Pt[],
  baselineY: number,
): { above: Pt[][]; below: Pt[][] } {
  const above: Pt[][] = [];
  const below: Pt[][] = [];
  if (coordinates.length < 2 || !Number.isFinite(baselineY)) {
    return { above, below };
  }

  type Side = "above" | "below" | "on";
  const sideOf = (y: number): Side => {
    if (Math.abs(y - baselineY) < 0.5) return "on";
    return y < baselineY ? "above" : "below";
  };

  const cross = (a: Pt, b: Pt): Pt => {
    const dy = b.y - a.y;
    if (Math.abs(dy) < 1e-9) return { x: b.x, y: baselineY };
    const t = (baselineY - a.y) / dy;
    return { x: a.x + (b.x - a.x) * t, y: baselineY };
  };

  let path: Pt[] = [];
  let side: Side = "on";

  const flush = () => {
    if (path.length < 2 || (side !== "above" && side !== "below")) {
      path = [];
      return;
    }
    const poly = [
      ...path,
      { x: path[path.length - 1]!.x, y: baselineY },
      { x: path[0]!.x, y: baselineY },
    ];
    if (side === "above") above.push(poly);
    else below.push(poly);
    path = [];
  };

  for (let i = 0; i < coordinates.length; i++) {
    const p = coordinates[i]!;
    const s = sideOf(p.y);
    if (i === 0) {
      side = s === "on" ? "on" : s;
      path = [{ ...p }];
      continue;
    }
    const prev = coordinates[i - 1]!;
    const prevSide = sideOf(prev.y);

    if (s === "on") {
      path.push({ ...p });
      flush();
      side = "on";
      path = [{ ...p }];
      continue;
    }

    if (side === "on" || side === s) {
      if (side === "on") side = s;
      path.push({ ...p });
      continue;
    }

    // Crossing baseline between prev and p.
    if (prevSide !== "on" && prevSide !== s) {
      const c = cross(prev, p);
      path.push(c);
      flush();
      side = s;
      path = [c, { ...p }];
    } else {
      flush();
      side = s;
      path = [{ ...p }];
    }
  }
  flush();
  return { above, below };
}

type OverlayHost = {
  removeOverlay: (filter?: { groupId?: string }) => void;
  createOverlay: (value: {
    name: string;
    id?: string;
    groupId?: string;
    lock?: boolean;
    zLevel?: number;
    points: Array<{ timestamp: number; value: number }>;
    extendData?: string;
    styles?: Record<string, unknown>;
  }) => unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- chart lib template variance
type RegisterOverlay = (template: any) => unknown;

const registered = new Set<string>();

/** Register the baseline fill overlay once per page load. */
export function ensureBaselineOverlay(registerOverlay: RegisterOverlay) {
  if (registered.has(BASELINE_OVERLAY)) return;
  registered.add(BASELINE_OVERLAY);
  registerOverlay({
    name: BASELINE_OVERLAY,
    totalStep: 2,
    needDefaultPointFigure: false,
    createPointFigures: ({
      overlay,
      coordinates,
      yAxis,
      bounding,
    }: {
      overlay: {
        extendData?: unknown;
        styles?: {
          line?: { color?: string };
          up?: { color?: string };
          down?: { color?: string };
        };
      };
      coordinates: Pt[];
      yAxis: { convertToPixel: (v: number) => number } | null;
      bounding: { width: number; height: number };
    }) => {
      const baseline = Number(overlay.extendData);
      if (!(baseline > 0) || !yAxis || coordinates.length < 2) return [];

      const baselineY = yAxis.convertToPixel(baseline);
      if (!Number.isFinite(baselineY)) return [];

      const { above, below } = buildBaselineFillPolygons(
        coordinates,
        baselineY,
      );
      const upColor =
        overlay.styles?.up?.color || "rgba(225, 29, 72, 0.18)";
      const downColor =
        overlay.styles?.down?.color || "rgba(22, 163, 74, 0.18)";
      const lineColor =
        overlay.styles?.line?.color || "rgba(148, 163, 184, 0.85)";

      const figures: Array<{
        type: string;
        attrs: unknown;
        styles: unknown;
        ignoreEvent: boolean;
      }> = [];

      for (const poly of above) {
        figures.push({
          type: "polygon",
          attrs: { coordinates: poly },
          styles: {
            style: "fill",
            color: upColor,
            borderSize: 0,
          },
          ignoreEvent: true,
        });
      }
      for (const poly of below) {
        figures.push({
          type: "polygon",
          attrs: { coordinates: poly },
          styles: {
            style: "fill",
            color: downColor,
            borderSize: 0,
          },
          ignoreEvent: true,
        });
      }

      // Horizontal baseline across the pane (close path stays on candle.area).
      figures.push({
        type: "line",
        attrs: {
          coordinates: [
            { x: 0, y: baselineY },
            { x: bounding.width, y: baselineY },
          ],
        },
        styles: {
          style: "dashed",
          color: lineColor,
          size: 1,
          dashedValue: [4, 3],
        },
        ignoreEvent: true,
      });

      return figures;
    },
  });
}

function readUpDown(): { up: string; down: string; muted: string } {
  if (typeof document === "undefined") {
    return { up: "#e11d48", down: "#16a34a", muted: "#94a3b8" };
  }
  const styles = getComputedStyle(document.documentElement);
  return {
    up: styles.getPropertyValue("--up").trim() || "#e11d48",
    down: styles.getPropertyValue("--down").trim() || "#16a34a",
    muted: styles.getPropertyValue("--muted").trim() || "#94a3b8",
  };
}

function withAlpha(hexOrCss: string, alpha: number): string {
  const m = hexOrCss.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return hexOrCss;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Sync or clear the baseline overlay for the current pane. */
export function syncBaselineOverlay(
  chart: OverlayHost | null | undefined,
  opts: {
    enabled: boolean;
    bars: OhlcvBar[];
    baselinePrice: number | null;
  },
) {
  if (!chart) return;
  chart.removeOverlay({ groupId: BASELINE_GROUP });
  const price = opts.baselinePrice;
  if (!opts.enabled || price == null || !(price > 0)) return;
  if (opts.bars.length < 2) return;

  let bars = opts.bars;
  if (bars.length > BASELINE_POINTS_MAX) {
    bars = bars.slice(bars.length - BASELINE_POINTS_MAX);
  }

  const colors = readUpDown();
  chart.createOverlay({
    name: BASELINE_OVERLAY,
    id: `${BASELINE_OVERLAY}-main`,
    groupId: BASELINE_GROUP,
    lock: true,
    zLevel: -1,
    points: bars.map((b) => ({
      timestamp: b.time * 1000,
      value: b.close,
    })),
    extendData: String(price),
    styles: {
      line: { color: colors.muted },
      up: { color: withAlpha(colors.up, 0.2) },
      down: { color: withAlpha(colors.down, 0.2) },
    },
  });
}
