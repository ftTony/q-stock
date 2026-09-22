import type { AssetType } from "@/lib/types";
import { normalizeSymbol, toFinnhubSymbol } from "@/lib/types";

/** Longbridge: AAPL → AAPL.US ; BTC → BTC.US (if supported) */
export function toLongbridgeSymbol(
  symbol: string,
  assetType: AssetType,
): string {
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    // Longbridge crypto symbols vary; use .US crypto ticker when possible
    return `${s}.US`;
  }
  if (s.includes(".")) return s;
  // HK numeric codes
  if (/^\d{1,5}$/.test(s)) {
    return `${s.padStart(5, "0")}.HK`;
  }
  return `${s}.US`;
}

/** Futu OpenAPI: AAPL → US.AAPL ; 00700 → HK.00700 */
export function toFutuSymbol(symbol: string, assetType: AssetType): string {
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    throw new Error("Futu provider does not support crypto");
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
  if (/^\d{1,5}$/.test(s)) {
    return `HK.${s.padStart(5, "0")}`;
  }
  return `US.${s}`;
}

export { normalizeSymbol, toFinnhubSymbol };
