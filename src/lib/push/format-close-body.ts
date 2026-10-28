import type { AssetType } from "@/lib/types";

export type CloseQuoteRow = {
  symbol: string;
  assetType: AssetType;
  price: number | null;
  percentChange: number | null;
};

function fmtPrice(n: number): string {
  if (Math.abs(n) >= 1000) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/** Compact body for a single OS notification (~5–8 symbols). */
export function formatClosePushBody(
  rows: CloseQuoteRow[],
  maxSymbols = 6,
): string {
  const parts: string[] = [];
  for (const row of rows.slice(0, maxSymbols)) {
    if (row.price == null || !Number.isFinite(row.price)) {
      parts.push(`${row.symbol} —`);
      continue;
    }
    const pct =
      row.percentChange != null && Number.isFinite(row.percentChange)
        ? ` ${fmtPct(row.percentChange)}`
        : "";
    parts.push(`${row.symbol} ${fmtPrice(row.price)}${pct}`);
  }
  const more = rows.length > maxSymbols ? ` · +${rows.length - maxSymbols}` : "";
  return parts.join(" · ") + more;
}

export function closePushTitle(locale: string): string {
  if (locale === "en") return "US close · Watchlist";
  if (locale === "zh_TW" || locale === "zh-TW") return "美股收盤 · 自選";
  return "美股收盘 · 自选";
}
