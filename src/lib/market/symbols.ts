import type { AssetType } from "@/lib/types";
import { normalizeSymbol, toFinnhubSymbol } from "@/lib/types";

/** Longbridge: AAPL → AAPL.US ; 00700 → 00700.HK ; BTC → BTC.US */
export function toLongbridgeSymbol(
  symbol: string,
  assetType: AssetType,
): string {
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    return `${s}.US`;
  }
  if (assetType === "hk") {
    return `${s}.HK`;
  }
  if (s.includes(".")) return s;
  return `${s}.US`;
}

/** Futu OpenAPI: AAPL → US.AAPL ; 00700 → HK.00700 */
export function toFutuSymbol(symbol: string, assetType: AssetType): string {
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    throw new Error("Futu provider does not support crypto");
  }
  if (assetType === "hk") {
    return `HK.${s}`;
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

export { normalizeSymbol, toFinnhubSymbol };
