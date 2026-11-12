import type { AssetType } from "@/lib/types";
import {
  normalizeCnThscode,
  normalizeSymbol,
  toFinnhubSymbol as baseFinnhub,
} from "@/lib/types";
import {
  INDEX_FINNHUB,
  INDEX_FUTU,
  INDEX_LONGBRIDGE,
  isCnIndexThscode,
} from "@/lib/market/indices";

function indexCode(symbol: string): string {
  return symbol
    .toUpperCase()
    .trim()
    .replace(/^\./, "")
    .replace(/\.US$/i, "")
    .replace(/\.HK$/i, "")
    .replace(/\.SH$/i, "")
    .replace(/\.SZ$/i, "")
    .replace(/\.BJ$/i, "")
    .replace(/^US\./, "")
    .replace(/^HK\./, "")
    .replace(/^SH\./, "")
    .replace(/^SZ\./, "")
    .replace(/^BJ\./, "");
}

/** Fuyao / display thscode (always `######.SH|SZ|BJ`). */
export function toThscode(symbol: string): string {
  return normalizeCnThscode(symbol);
}

/** Longbridge: AAPL → AAPL.US ; 00700 → 700.HK ; 600519.SH → 600519.SH */
export function toLongbridgeSymbol(
  symbol: string,
  assetType: AssetType,
): string {
  const upper = symbol.toUpperCase().trim();
  if (isCnIndexThscode(upper)) {
    return upper;
  }
  const code = indexCode(symbol);
  if (Object.prototype.hasOwnProperty.call(INDEX_LONGBRIDGE, code)) {
    return INDEX_LONGBRIDGE[code];
  }
  if (Object.prototype.hasOwnProperty.call(INDEX_LONGBRIDGE, upper)) {
    return INDEX_LONGBRIDGE[upper];
  }
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    return `${s}.US`;
  }
  if (assetType === "hk") {
    const bare = s.replace(/^0+/, "") || "0";
    return `${bare}.HK`;
  }
  if (assetType === "cn") {
    return toThscode(s);
  }
  // US class shares keep the dot (BRK.B) but still need the .US region suffix.
  if (/\.(US|HK|SH|SZ|BJ)$/i.test(s)) return s;
  return `${s}.US`;
}

/** Futu OpenAPI: AAPL → US.AAPL ; 00700 → HK.00700 ; 600519.SH → SH.600519 */
export function toFutuSymbol(symbol: string, assetType: AssetType): string {
  const upper = symbol.toUpperCase().trim();
  if (Object.prototype.hasOwnProperty.call(INDEX_FUTU, upper)) {
    return INDEX_FUTU[upper];
  }
  const code = indexCode(symbol);
  if (Object.prototype.hasOwnProperty.call(INDEX_FUTU, code)) {
    return INDEX_FUTU[code];
  }
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    throw new Error("Futu provider does not support crypto");
  }
  if (assetType === "hk") {
    return `HK.${s}`;
  }
  if (assetType === "cn") {
    const ths = toThscode(s);
    if (Object.prototype.hasOwnProperty.call(INDEX_FUTU, ths)) {
      return INDEX_FUTU[ths];
    }
    const [ticker, ex] = ths.split(".");
    return `${ex}.${ticker}`;
  }
  if (
    s.startsWith("US.") ||
    s.startsWith("HK.") ||
    s.startsWith("SH.") ||
    s.startsWith("SZ.") ||
    s.startsWith("BJ.")
  ) {
    return s;
  }
  return `US.${s}`;
}

/**
 * Tiger OpenAPI wire symbol (no region suffix).
 * stock → AAPL ; hk → 00700 ; cn → 600519 (market/sec_type in biz, not suffix).
 */
export function toTigerSymbol(symbol: string, assetType: AssetType): string {
  if (assetType === "crypto") {
    throw new Error("Tiger provider does not support crypto");
  }
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "hk") {
    return s.padStart(5, "0");
  }
  if (assetType === "cn") {
    return toThscode(s).split(".")[0] ?? s;
  }
  return s.replace(/\.US$/i, "").replace(/^US\./, "");
}

/** Optional Tiger biz fields for market / sec_type. */
export function tigerMarketBiz(
  assetType: AssetType,
): { market?: string; sec_type?: string } {
  if (assetType === "hk") return { market: "HK", sec_type: "STK" };
  if (assetType === "cn") return { market: "CN", sec_type: "STK" };
  if (assetType === "stock") return { market: "US", sec_type: "STK" };
  return {};
}

export function toFinnhubSymbol(symbol: string, assetType: AssetType): string {
  const upper = symbol.toUpperCase().trim();
  if (Object.prototype.hasOwnProperty.call(INDEX_FINNHUB, upper)) {
    return INDEX_FINNHUB[upper];
  }
  const code = indexCode(symbol);
  if (Object.prototype.hasOwnProperty.call(INDEX_FINNHUB, code)) {
    return INDEX_FINNHUB[code];
  }
  return baseFinnhub(symbol, assetType);
}

export { normalizeSymbol, normalizeCnThscode };
