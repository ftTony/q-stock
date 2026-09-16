export type AssetType = "stock" | "crypto";

export type CandleResolution = "D" | "Q" | "Y";

export interface OhlcvBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  assetType: AssetType;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface SearchResult {
  symbol: string;
  displaySymbol: string;
  description: string;
  assetType: AssetType;
  type?: string;
}

/** Popular symbols shown on market home when no search. */
export const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "JPM",
] as const;

export const POPULAR_CRYPTO = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
] as const;

/** Map internal crypto ticker to Finnhub exchange symbol. */
export function toFinnhubSymbol(symbol: string, assetType: AssetType): string {
  const s = symbol.toUpperCase().replace(/^BINANCE:/, "");
  if (assetType === "crypto") {
    if (s.includes(":")) return s;
    const base = s.replace(/USDT$/, "");
    return `BINANCE:${base}USDT`;
  }
  return s;
}

export function normalizeSymbol(symbol: string, assetType: AssetType): string {
  const s = symbol.toUpperCase().trim();
  if (assetType === "crypto") {
    return s
      .replace(/^BINANCE:/, "")
      .replace(/USDT$/, "")
      .replace(/USD$/, "");
  }
  return s;
}
