export type AssetType = "stock" | "hk" | "crypto";

export const ASSET_TYPES = ["stock", "hk", "crypto"] as const;

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
  /** Traded volume (shares / base asset). */
  volume?: number;
  /** Notional turnover (quote currency). */
  turnover?: number;
  /** Best bid / ask (L1). */
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
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

/** Internal HK codes are zero-padded 5 digits (no .HK suffix). */
export const POPULAR_HK = [
  "00700",
  "09988",
  "03690",
  "01810",
  "00941",
  "01299",
  "02318",
  "00388",
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

export function parseAssetType(
  value: string | null | undefined,
): AssetType {
  if (value === "crypto") return "crypto";
  if (value === "hk") return "hk";
  return "stock";
}

/** US or HK listed equities (not crypto). */
export function isEquity(assetType: AssetType): boolean {
  return assetType === "stock" || assetType === "hk";
}

/** Finnhub fundamentals / US-centric company endpoints. */
export function isUsEquity(assetType: AssetType): boolean {
  return assetType === "stock";
}

/** Map internal ticker to Finnhub exchange symbol. */
export function toFinnhubSymbol(symbol: string, assetType: AssetType): string {
  const s = symbol.toUpperCase().replace(/^BINANCE:/, "");
  if (assetType === "crypto") {
    if (s.includes(":")) return s;
    const base = s.replace(/USDT$/, "");
    return `BINANCE:${base}USDT`;
  }
  if (assetType === "hk") {
    const code = s
      .replace(/^HK\./, "")
      .replace(/\.HK$/, "")
      .replace(/\D/g, "");
    if (!code) return s;
    return `${code.padStart(5, "0").replace(/^0+(?=\d)/, "") || code}.HK`;
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
  if (assetType === "hk") {
    const raw = s
      .replace(/^HK\./, "")
      .replace(/\.HK$/, "")
      .replace(/\D/g, "");
    if (!raw) return s;
    return raw.padStart(5, "0");
  }
  return s.replace(/\.US$/i, "").replace(/^US\./, "");
}
