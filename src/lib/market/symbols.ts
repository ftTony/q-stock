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
  if (s.includes(".")) return s;
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
