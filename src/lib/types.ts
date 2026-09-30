export type AssetType = "stock" | "hk" | "crypto" | "cn";

export const ASSET_TYPES = ["stock", "hk", "crypto", "cn"] as const;

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
  /** Display name from rank API when available. */
  name?: string;
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

/** A-share thscode (exchange suffix required). */
export const POPULAR_CN = [
  "600519.SH",
  "000001.SZ",
  "000858.SZ",
  "601318.SH",
  "300750.SZ",
  "002594.SZ",
  "601012.SH",
  "000333.SZ",
] as const;

export function parseAssetType(
  value: string | null | undefined,
): AssetType {
  if (value === "crypto") return "crypto";
  if (value === "hk") return "hk";
  if (value === "cn") return "cn";
  return "stock";
}

/** US, HK, or CN listed equities (not crypto). */
export function isEquity(assetType: AssetType): boolean {
  return assetType === "stock" || assetType === "hk" || assetType === "cn";
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
  if (assetType === "cn") {
    return normalizeCnThscode(s);
  }
  return s.replace(/\.US$/i, "").replace(/^US\./, "");
}

/** Infer SH/SZ/BJ exchange from bare A-share code digits. */
export function inferCnExchange(code: string): "SH" | "SZ" | "BJ" {
  const digits = code.replace(/\D/g, "");
  if (digits.startsWith("6") || digits.startsWith("9")) return "SH";
  if (digits.startsWith("4") || digits.startsWith("8")) return "BJ";
  return "SZ";
}

/** Canonical A-share id: `600519.SH`. */
export function normalizeCnThscode(symbol: string): string {
  let s = symbol.toUpperCase().trim();
  s = s.replace(/^SH\./, "").replace(/^SZ\./, "").replace(/^BJ\./, "");
  const m = s.match(/^(\d{6})\.(SH|SZ|BJ)$/);
  if (m) return `${m[1]}.${m[2]}`;
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 6) {
    const code = digits.slice(-6);
    return `${code}.${inferCnExchange(code)}`;
  }
  if (digits.length > 0) {
    const code = digits.padStart(6, "0");
    return `${code}.${inferCnExchange(code)}`;
  }
  return s;
}
