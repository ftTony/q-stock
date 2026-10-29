import type { ChartCandleType } from "@/components/charts/candle-chart-settings";
import { resolveCandleType } from "@/components/charts/candle-chart-settings";
import type { OhlcvBar } from "@/lib/types";

export type TipLabels = {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export function toKLineData(bars: OhlcvBar[]) {
  return bars.map((b) => ({
    timestamp: b.time * 1000,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const dark = document.documentElement.classList.contains("dark");
  return {
    up: styles.getPropertyValue("--up").trim() || "#e11d48",
    down: styles.getPropertyValue("--down").trim() || "#16a34a",
    fg: styles.getPropertyValue("--foreground").trim() || "#edf2ff",
    muted: styles.getPropertyValue("--muted").trim() || "#8b97ad",
    bg: styles.getPropertyValue("--panel").trim() || "#0f1520",
    border: styles.getPropertyValue("--border").trim() || "#1c2433",
    grid: dark ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.18)",
  };
}

/** Chart PNG export fill — follows current theme panel. */
export function readChartExportBg(): string {
  if (typeof document === "undefined") return "#ffffff";
  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue("--panel").trim() || "#ffffff";
}

/** Map product chart type → klinecharts candle.type. */
export function toKlineCandleType(
  type: ChartCandleType,
): "area" | "candle_solid" {
  return type === "area" ? "area" : "candle_solid";
}

/** @deprecated Prefer resolveCandleType + toKlineCandleType */
export function candleTypeFromResolution(
  resolution: string,
): "area" | "candle_solid" {
  return toKlineCandleType(resolveCandleType({}, resolution));
}

export function buildChartStyles(
  labels: TipLabels,
  resolution = "D",
  opts?: {
    liveSession?: boolean;
    /** Hide axis line that sits on the panel split. */
    flushEdge?: boolean;
    /** Hide OHLC tip (e.g. while exporting a PNG). */
    hideCandleTooltip?: boolean;
    /** Explicit product chart type; falls back to resolution default. */
    chartType?: ChartCandleType;
    /** No left drawing strip — shrink tip offset (multi-chart). */
    noDrawingStrip?: boolean;
  },
) {
  const c = readThemeColors();
  const flushEdge = Boolean(opts?.flushEdge);
  // Always use a dark glass tip + light text — theme CSS vars can make
  // legend titles land as near-black on a dark rect (unreadable on mobile).
  const tipBg = "rgba(12, 18, 28, 0.94)";
  const tipBorder = "rgba(148, 163, 184, 0.35)";
  const tipLabel = "#94a3b8";
  const tipValue = "#f1f5f9";
  const narrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;
  // HTML overlays sit above the canvas tooltip — keep rect clear of them.
  // Left: drawing strip (~44px) + padding. Right: fullscreen btn (~right-12 + 32).
  const tipOffsetLeft = opts?.noDrawingStrip ? (narrow ? 8 : 12) : narrow ? 48 : 52;
  const tipOffsetRight = opts?.noDrawingStrip
    ? narrow
      ? 12
      : 16
    : narrow
      ? 52
      : 56;
  const tipOffsetTop = 8;
  // Area tip pulse only while the venue is in regular session (crypto = always).
  const live = Boolean(opts?.liveSession);

  const tipLegend = (
    title: string,
    value: string,
  ): {
    title: { text: string; color: string };
    value: { text: string; color: string };
  } => ({
    title: { text: title, color: tipLabel },
    value: { text: value, color: tipValue },
  });

  return {
    grid: {
      horizontal: { color: c.grid },
      vertical: { color: c.grid },
    },
    candle: {
      type: toKlineCandleType(
        opts?.chartType ?? resolveCandleType({}, resolution),
      ),
      bar: {
        upColor: c.up,
        downColor: c.down,
        noChangeColor: c.muted,
        upBorderColor: c.up,
        downBorderColor: c.down,
        noChangeBorderColor: c.muted,
        upWickColor: c.up,
        downWickColor: c.down,
        noChangeWickColor: c.muted,
      },
      area: {
        point: {
          show: live,
          animation: live,
          animationDuration: 1000,
        },
      },
      priceMark: {
        high: {
          show: !narrow,
          color: c.muted,
          textSize: 10,
        },
        low: {
          show: !narrow,
          color: c.muted,
          textSize: 10,
        },
        last: {
          upColor: c.up,
          downColor: c.down,
          noChangeColor: c.muted,
        },
      },
      tooltip: {
        showRule: opts?.hideCandleTooltip ? "none" : "always",
        showType: "rect",
        offsetLeft: tipOffsetLeft,
        offsetTop: tipOffsetTop,
        offsetRight: tipOffsetRight,
        offsetBottom: 6,
        rect: {
          position: "fixed",
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 6,
          paddingBottom: 6,
          offsetLeft: 0,
          offsetTop: 0,
          offsetRight: 0,
          offsetBottom: 4,
          borderRadius: 8,
          borderSize: 1,
          borderColor: tipBorder,
          color: tipBg,
        },
        title: {
          show: true,
          size: narrow ? 11 : 12,
          color: tipLabel,
          marginLeft: 4,
          marginTop: 2,
          marginRight: 4,
          marginBottom: 2,
        },
        legend: {
          size: narrow ? 10 : 11,
          color: tipValue,
          marginLeft: 4,
          marginTop: 1,
          marginRight: 4,
          marginBottom: 1,
          template: [
            tipLegend(`${labels.time}: `, "{time}"),
            tipLegend(`${labels.open}: `, "{open}"),
            tipLegend(`${labels.high}: `, "{high}"),
            tipLegend(`${labels.low}: `, "{low}"),
            tipLegend(`${labels.close}: `, "{close}"),
            tipLegend(`${labels.volume}: `, "{volume}"),
          ],
        },
        text: { color: tipValue },
      },
    },
    indicator: {
      tooltip: {
        showRule: narrow ? "follow_cross" : "always",
        showType: "standard",
        offsetLeft: tipOffsetLeft,
        offsetTop: 2,
        offsetRight: tipOffsetRight,
        title: {
          show: true,
          size: narrow ? 10 : 11,
          color: tipLabel,
          marginLeft: 4,
          marginTop: 1,
          marginRight: 4,
          marginBottom: 1,
        },
        legend: {
          size: narrow ? 10 : 11,
          color: tipValue,
          marginLeft: 4,
          marginTop: 1,
          marginRight: 4,
          marginBottom: 1,
        },
        text: { color: tipValue },
      },
    },
    xAxis: {
      axisLine: {
        show: !flushEdge,
        color: c.border,
        size: flushEdge ? 0 : 1,
      },
      tickLine: { color: c.border },
      tickText: { color: c.muted },
    },
    yAxis: {
      // Right y-axis spine sits on the chart|rail split — hide it when the
      // workbench draws its own hairline, or the seam reads as a double line.
      axisLine: {
        show: !flushEdge,
        color: flushEdge ? "transparent" : c.border,
        size: flushEdge ? 0 : 1,
      },
      tickLine: {
        show: !flushEdge,
        color: c.border,
        length: flushEdge ? 0 : 3,
      },
      tickText: {
        color: c.muted,
        // Sit labels closer to the panel split (default marginEnd is 6).
        marginEnd: flushEdge ? 2 : 6,
        marginStart: flushEdge ? 2 : 4,
      },
    },
    crosshair: {
      horizontal: {
        line: { color: c.muted },
        text: { backgroundColor: c.border, color: c.fg },
      },
      vertical: {
        line: { color: c.muted },
        text: { backgroundColor: c.border, color: c.fg },
      },
    },
    separator: {
      color: c.border,
    },
  };
}

export function periodFromResolution(resolution: string) {
  if (resolution === "Y") return { type: "year" as const, span: 1 };
  if (resolution === "Q") return { type: "month" as const, span: 3 };
  if (resolution === "5") return { type: "minute" as const, span: 5 };
  if (resolution === "T" || resolution === "1") {
    return { type: "minute" as const, span: 1 };
  }
  return { type: "day" as const, span: 1 };
}
