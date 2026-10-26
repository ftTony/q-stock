/** Chart PNG export with Futu-style brand marks (i18n brand from caller). */

const DEFAULT_DOMAIN = "q-stock.cn";
const DEFAULT_LOGO_SRC = "/logo-light.png?v=2";
const FONT =
  'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

export type ChartScreenshotOpts = {
  domain?: string;
  /** Localized product name from `app.name` (required for corner mark). */
  brand?: string;
  /** Locale-aware mark; defaults to light logo. */
  logoSrc?: string;
  filename?: string;
};

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

/**
 * Composite chart PNG:
 * - center: large semi-transparent domain
 * - bottom strip: logo + localized brand name
 */
export async function watermarkChartPng(
  chartDataUrl: string,
  opts?: ChartScreenshotOpts,
): Promise<string> {
  const domain = (opts?.domain || DEFAULT_DOMAIN).trim() || DEFAULT_DOMAIN;
  const brand = (opts?.brand || "").trim();
  const logoSrc = (opts?.logoSrc || DEFAULT_LOGO_SRC).trim() || DEFAULT_LOGO_SRC;

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

  const footerH = Math.round(64 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = chartW;
  canvas.height = chartH + footerH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return chartDataUrl;

  ctx.drawImage(chart, 0, 0);

  const targetW = chartW * 0.36;
  let centerSize = Math.round(Math.min(chartW, chartH) * 0.09);
  centerSize = Math.max(28, Math.min(centerSize, 96));
  ctx.font = `600 ${centerSize}px ${FONT}`;
  const textW = ctx.measureText(domain).width;
  if (textW > targetW && textW > 0) {
    centerSize = Math.max(24, Math.round(centerSize * (targetW / textW)));
    ctx.font = `600 ${centerSize}px ${FONT}`;
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(120, 130, 145, 0.22)";
  ctx.fillText(domain, chartW / 2, chartH * 0.42);
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, chartH, chartW, footerH);
  ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
  ctx.lineWidth = Math.max(1, Math.round(scale));
  ctx.beginPath();
  ctx.moveTo(0, chartH + 0.5);
  ctx.lineTo(chartW, chartH + 0.5);
  ctx.stroke();

  const padX = Math.round(16 * scale);
  const logoH = Math.round(40 * scale);
  const gap = Math.round(10 * scale);
  const brandSize = Math.round(26 * scale);
  const midY = chartH + footerH / 2;

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
    ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
    ctx.fillText(brand, cursorX, midY);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

export async function downloadChartScreenshot(
  chartDataUrl: string,
  opts?: ChartScreenshotOpts,
) {
  const stamped = await watermarkChartPng(chartDataUrl, opts);
  const a = document.createElement("a");
  a.href = stamped;
  a.download = opts?.filename || "chart.png";
  a.click();
}
