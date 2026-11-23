/** Chart PNG export with Futu-style brand marks (i18n brand from caller). */

import type { ChartCandleType } from "@/components/charts/candle-chart-settings";
import {
  buildChartStyles,
  readChartExportBg,
  type TipLabels,
} from "@/components/charts/candle-chart-styles";

const DEFAULT_DOMAIN = "q-stock.cn";
const DEFAULT_LOGO_SRC = "/logo-light.png?v=2";
const FONT =
  'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

/** Header strip height at scale=1; must cover identity + price + 2 stat rows. */
const QUOTE_HEADER_BASE = 168;

export type ChartScreenshotOpts = {
  domain?: string;
  /** Localized product name from `app.name` (required for corner mark). */
  brand?: string;
  /** Localized tagline from `app.tagline`, drawn next to the brand in footer. */
  tagline?: string;
  /** Locale-aware mark; defaults to light logo. */
  logoSrc?: string;
  filename?: string;
  /** Pre-formatted quote block drawn above the chart (no i18n in this module). */
  quote?: ScreenshotQuoteInfo;
};

/** One label/value cell in the quote header (3 columns × 2 rows). */
export type ScreenshotQuoteStat = { label: string; value: string };

/**
 * Symbol identity + quote snapshot rendered into the exported PNG header.
 * All strings are formatted by the caller (which owns locale/i18n).
 */
export type ScreenshotQuoteInfo = {
  symbol: string;
  name: string;
  /** e.g. "休市中 11/20 16:00:00" */
  statusTime: string;
  price: string;
  change: string;
  percentChange: string;
  trend: "up" | "down" | "flat";
  stats: ScreenshotQuoteStat[];
};

/**
 * Minimal structural slice of klinecharts' `Chart` we rely on.
 * `getConvertPictureUrl` must mirror the library's own (narrow) params:
 * widening `type` to `string` makes the real chart non-assignable.
 */
type ChartExportApi = {
  setStyles: (styles: never) => void;
  resize: () => void;
  getConvertPictureUrl: (
    includeOverlay?: boolean,
    type?: "png" | "jpeg" | "bmp",
    backgroundColor?: string,
  ) => string;
};

export type ChartCaptureMode = "download" | "copy";

type CaptureChartOpts = {
  chart: ChartExportApi;
  labels: TipLabels;
  resolution: string;
  liveSession: boolean;
  flushEdge: boolean;
  domain: string;
  brand: string;
  tagline: string;
  logoSrc: string;
  filename: string;
  chartType?: ChartCandleType;
  quote?: ScreenshotQuoteInfo;
};

/** Sanitize ticker for download filenames. */
export function chartScreenshotFilename(symbol: string, now = new Date()): string {
  const code = (symbol || "chart")
    .trim()
    .replace(/[^\w.\u4e00-\u9fff-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "chart";
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${code}_${stamp}.png`;
}

/**
 * Hide OHLC tip, rasterize main canvas, restore styles, return watermarked
 * PNG data URL. klinecharts needs 2 rAFs after setStyles to paint.
 */
export async function captureChartPng(
  opts: Omit<CaptureChartOpts, "filename">,
): Promise<string | null> {
  const { chart, labels, resolution } = opts;
  const styleOpts = {
    liveSession: opts.liveSession,
    flushEdge: opts.flushEdge,
    chartType: opts.chartType,
  };
  const restoreStyles = () => {
    chart.setStyles(buildChartStyles(labels, resolution, styleOpts) as never);
  };
  const nextFrame = () =>
    new Promise<void>((r) => requestAnimationFrame(() => r()));

  try {
    chart.setStyles(
      buildChartStyles(labels, resolution, {
        ...styleOpts,
        hideCandleTooltip: true,
      }) as never,
    );
    chart.resize();
    await Promise.resolve();
    await nextFrame();
    await nextFrame();

    const url = chart.getConvertPictureUrl(false, "png", readChartExportBg());
    restoreStyles();
    if (!url) return null;
    return watermarkChartPng(url, {
      domain: opts.domain,
      brand: opts.brand,
      tagline: opts.tagline,
      logoSrc: opts.logoSrc,
      quote: opts.quote,
    });
  } catch {
    try {
      restoreStyles();
    } catch {
      /* ignore restore failure */
    }
    return null;
  }
}

function triggerPngDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename || "chart.png";
  a.click();
}

/** Capture then download or copy to clipboard. */
export async function captureChartAction(
  mode: ChartCaptureMode,
  opts: CaptureChartOpts,
): Promise<"ok" | "unsupported" | "failed"> {
  const stamped = await captureChartPng(opts);
  if (!stamped) return "failed";
  if (mode === "copy") {
    return writePngToClipboard(stamped);
  }
  triggerPngDownload(stamped, opts.filename);
  return "ok";
}

/**
 * @deprecated Prefer `captureChartAction("download", …)`.
 * Hide OHLC tip, rasterize, watermark, then download.
 */
export async function captureAndDownloadChart(opts: CaptureChartOpts) {
  await captureChartAction("download", opts);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src =
      src.startsWith("data:") || src.startsWith("blob:") || /^https?:/i.test(src)
        ? src
        : `${typeof window !== "undefined" ? window.location.origin : ""}${src}`;
  });
}

function readQuoteColors() {
  const fallback = {
    fg: "#edf2ff",
    muted: "#8b97ad",
    border: "#1c2433",
    up: "#22c55e",
    down: "#f87171",
  };
  if (typeof document === "undefined") return fallback;
  const styles = getComputedStyle(document.documentElement);
  // Custom props may be declared as `var(--wb-ink)`; some engines return that
  // raw expression. Resolve through a probe element so canvas gets a real color.
  const pick = (name: string, def: string) => {
    const raw = styles.getPropertyValue(name).trim();
    if (!raw) return def;
    if (!raw.includes("var(")) return raw;
    const probe = document.createElement("span");
    probe.style.color = raw;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color.trim() || def;
    probe.remove();
    return resolved;
  };
  return {
    fg: pick("--foreground", fallback.fg),
    muted: pick("--muted", fallback.muted),
    border: pick("--border", fallback.border),
    up: pick("--up", fallback.up),
    down: pick("--down", fallback.down),
  };
}

/**
 * Draw the symbol identity + quote snapshot above the chart. Layout mirrors
 * the page quote header: code + name / status + time, big price with change,
 * then a 3-column × 2-row stat grid.
 */
function drawQuoteHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: string,
  info: ScreenshotQuoteInfo,
  scale: number,
) {
  const colors = readQuoteColors();
  const pad = Math.round(16 * scale);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const trendColor =
    info.trend === "up"
      ? colors.up
      : info.trend === "down"
        ? colors.down
        : colors.fg;

  // Row 1: code + name (left), status + time (right).
  const identitySize = Math.round(17 * scale);
  const metaSize = Math.round(11 * scale);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `600 ${identitySize}px ${FONT}`;
  ctx.fillStyle = colors.fg;
  let x = pad;
  ctx.fillText(info.symbol, x, pad + identitySize / 2);
  x += ctx.measureText(info.symbol).width + Math.round(8 * scale);
  ctx.font = `400 ${Math.round(13 * scale)}px ${FONT}`;
  ctx.fillStyle = colors.muted;
  ctx.fillText(info.name, x, pad + identitySize / 2);
  if (info.statusTime) {
    ctx.textAlign = "right";
    ctx.font = `400 ${metaSize}px ${FONT}`;
    ctx.fillStyle = colors.muted;
    ctx.fillText(info.statusTime, width - pad, pad + identitySize / 2);
  }

  // Row 2: price (colored) + change + percent.
  const priceSize = Math.round(30 * scale);
  const changeSize = Math.round(14 * scale);
  const priceY = pad + identitySize + Math.round(6 * scale) + priceSize / 2;
  ctx.textAlign = "left";
  ctx.font = `700 ${priceSize}px ${FONT}`;
  ctx.fillStyle = trendColor;
  ctx.fillText(info.price, pad, priceY);
  x = pad + ctx.measureText(info.price).width + Math.round(10 * scale);
  ctx.font = `600 ${changeSize}px ${FONT}`;
  ctx.fillStyle = trendColor;
  ctx.fillText(info.change, x, priceY);
  x += ctx.measureText(info.change).width + Math.round(8 * scale);
  ctx.fillText(info.percentChange, x, priceY);

  // Rows 3-4: stat grid, 3 columns × 2 rows (row-major).
  // Each cell stacks label above value; leave enough vertical room so the
  // first row's value never collides with the second row's label.
  const stats = info.stats.slice(0, 6);
  if (stats.length) {
    const labelSize = Math.round(11 * scale);
    const valueSize = Math.round(14 * scale);
    const labelToValue = Math.round(18 * scale);
    const rowStride = Math.round(40 * scale);
    const colW = (width - pad * 2) / 3;
    const gridTop = priceY + priceSize / 2 + Math.round(14 * scale);
    stats.forEach((stat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = pad + col * colW;
      const cellTop = gridTop + row * rowStride;
      ctx.textAlign = "left";
      ctx.font = `400 ${labelSize}px ${FONT}`;
      ctx.fillStyle = colors.muted;
      ctx.fillText(stat.label, cx, cellTop);
      ctx.font = `600 ${valueSize}px ${FONT}`;
      ctx.fillStyle = colors.fg;
      ctx.fillText(stat.value, cx, cellTop + labelToValue);
    });
  }
}

/**
 * Composite chart PNG:
 * - optional top strip: symbol identity + quote snapshot
 * - center: large semi-transparent domain
 * - bottom strip: logo + localized brand name
 */
export async function watermarkChartPng(
  chartDataUrl: string,
  opts?: ChartScreenshotOpts,
): Promise<string> {
  const domain = (opts?.domain || DEFAULT_DOMAIN).trim() || DEFAULT_DOMAIN;
  const brand = (opts?.brand || "").trim();
  const tagline = (opts?.tagline || "").trim();
  const logoSrc = (opts?.logoSrc || DEFAULT_LOGO_SRC).trim() || DEFAULT_LOGO_SRC;
  const quote = opts?.quote;

  const [chart, logo] = await Promise.all([
    loadImage(chartDataUrl),
    loadImage(logoSrc).catch(() =>
      logoSrc === DEFAULT_LOGO_SRC
        ? null
        : loadImage(DEFAULT_LOGO_SRC).catch(() => null),
    ),
  ]);

  const chartW = chart.naturalWidth || chart.width;
  const chartH = chart.naturalHeight || chart.height;
  const scale = Math.max(1, Math.min(chartW, chartH) / 720);
  const exportBg =
    typeof document === "undefined"
      ? "#ffffff"
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--panel")
          .trim() || "#ffffff";

  const headerH = quote ? Math.round(QUOTE_HEADER_BASE * scale) : 0;
  const footerH = Math.round(64 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = chartW;
  canvas.height = headerH + chartH + footerH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return chartDataUrl;

  if (quote) drawQuoteHeader(ctx, chartW, headerH, exportBg, quote, scale);
  ctx.drawImage(chart, 0, headerH);

  const targetW = chartW * 0.36;
  let centerSize = Math.round(Math.min(chartW, chartH) * 0.09);
  centerSize = Math.max(28, Math.min(centerSize, 96));
  ctx.font = `600 ${centerSize}px ${FONT}`;
  const textW = ctx.measureText(domain).width;
  if (textW > targetW && textW > 0) {
    centerSize = Math.max(24, Math.round(centerSize * (targetW / textW)));
    ctx.font = `600 ${centerSize}px ${FONT}`;
  }
  const themeColors = readQuoteColors();
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = themeColors.muted;
  ctx.globalAlpha = 0.22;
  ctx.fillText(domain, chartW / 2, headerH + chartH * 0.42);
  ctx.restore();

  const footerY = headerH + chartH;
  ctx.fillStyle = exportBg;
  ctx.fillRect(0, footerY, chartW, footerH);
  ctx.strokeStyle = themeColors.border;
  ctx.lineWidth = Math.max(1, Math.round(scale));
  ctx.beginPath();
  ctx.moveTo(0, footerY + 0.5);
  ctx.lineTo(chartW, footerY + 0.5);
  ctx.stroke();

  const padX = Math.round(16 * scale);
  const logoH = Math.round(40 * scale);
  const gap = Math.round(10 * scale);
  const brandSize = Math.round(26 * scale);
  const midY = footerY + footerH / 2;

  let cursorX = padX;
  if (logo && logo.naturalHeight > 0) {
    const logoW = Math.round((logo.naturalWidth / logo.naturalHeight) * logoH);
    ctx.drawImage(logo, cursorX, midY - logoH / 2, logoW, logoH);
    cursorX += logoW + gap;
  }

  if (brand) {
    ctx.save();
    ctx.font = `700 ${brandSize}px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = themeColors.fg;
    ctx.fillText(brand, cursorX, midY);
    cursorX += ctx.measureText(brand).width + Math.round(14 * scale);
    ctx.restore();
  }

  if (tagline) {
    ctx.save();
    ctx.font = `400 ${Math.round(14 * scale)}px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = themeColors.muted;
    ctx.fillText(tagline, cursorX, midY);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

export async function downloadChartScreenshot(
  chartDataUrl: string,
  opts?: ChartScreenshotOpts,
) {
  const stamped = await watermarkChartPng(chartDataUrl, opts);
  triggerPngDownload(stamped, opts?.filename || "chart.png");
}

async function writePngToClipboard(
  pngDataUrl: string,
): Promise<"ok" | "unsupported" | "failed"> {
  try {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof ClipboardItem === "undefined"
    ) {
      return "unsupported";
    }
    const res = await fetch(pngDataUrl);
    const blob = await res.blob();
    const png =
      blob.type === "image/png"
        ? blob
        : new Blob([await blob.arrayBuffer()], { type: "image/png" });
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    return "ok";
  } catch {
    return "failed";
  }
}

/** Watermark (if needed) then copy PNG to the system clipboard. */
export async function copyChartScreenshot(
  chartDataUrl: string,
  opts?: ChartScreenshotOpts,
): Promise<"ok" | "unsupported" | "failed"> {
  const stamped = await watermarkChartPng(chartDataUrl, opts);
  return writePngToClipboard(stamped);
}
