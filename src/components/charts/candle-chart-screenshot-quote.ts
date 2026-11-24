import type { ScreenshotQuoteInfo } from "@/components/charts/candle-chart-screenshot";
import { formatDate, formatNumber, formatTime } from "@/lib/format-number";
import { displayName, localizedNameFromQuote } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

export type QuoteHeaderLabels = {
  sessionOpen: string;
  sessionClosed: string;
  open: string;
  high: string;
  low: string;
  prevClose: string;
  volume: string;
  turnover: string;
};

function compactAmount(v: number | undefined, locale: string): string {
  if (v == null || Number.isNaN(v)) return "-";
  const abs = Math.abs(v);
  const unit = (divisor: number, suffix: string) =>
    `${formatNumber(v / divisor, { locale, maximumFractionDigits: 2 })}${suffix}`;
  if (locale.startsWith("zh")) {
    if (abs >= 1e8) return unit(1e8, "亿");
    if (abs >= 1e4) return unit(1e4, "万");
  }
  if (abs >= 1e9) return unit(1e9, "B");
  if (abs >= 1e6) return unit(1e6, "M");
  if (abs >= 1e3) return unit(1e3, "K");
  return formatNumber(v, { locale, maximumFractionDigits: 2 });
}

/** Build the pre-formatted quote block rendered into the exported PNG. */
export function buildScreenshotQuote(
  quote: Quote,
  symbol: string,
  assetType: AssetType,
  locale: string,
  labels: QuoteHeaderLabels,
  sessionOpen: boolean,
): ScreenshotQuoteInfo {
  const fmt = (v: number) =>
    formatNumber(v, { locale, maximumFractionDigits: 6 });
  const up = quote.change >= 0;
  const changeText = `${up ? "+" : ""}${fmt(quote.change)}`;
  const pctText = `${quote.percentChange >= 0 ? "+" : ""}${quote.percentChange.toFixed(2)}%`;
  // Quote timestamps from providers are seconds, not milliseconds.
  const time = quote.timestamp
    ? `${formatDate(quote.timestamp * 1000, { locale })} ${formatTime(quote.timestamp * 1000, { locale, assetType })}`
    : "";
  return {
    symbol,
    name: displayName(
      symbol,
      assetType,
      localizedNameFromQuote(quote, locale),
      locale,
    ),
    statusTime: [sessionOpen ? labels.sessionOpen : labels.sessionClosed, time]
      .filter(Boolean)
      .join(" "),
    price: fmt(quote.price),
    change: changeText,
    percentChange: pctText,
    trend: up ? "up" : "down",
    stats: [
      { label: labels.high, value: fmt(quote.high) },
      { label: labels.open, value: fmt(quote.open) },
      { label: labels.volume, value: compactAmount(quote.volume, locale) },
      { label: labels.low, value: fmt(quote.low) },
      { label: labels.prevClose, value: fmt(quote.previousClose) },
      { label: labels.turnover, value: compactAmount(quote.turnover, locale) },
    ],
  };
}
