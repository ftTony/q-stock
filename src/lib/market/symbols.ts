import type { AssetType } from "@/lib/types";
import { normalizeSymbol, toFinnhubSymbol as baseFinnhub } from "@/lib/types";
import {
  INDEX_FINNHUB,
  INDEX_FUTU,
  INDEX_LONGBRIDGE,
  isMarketIndexSymbol,
} from "@/lib/market/indices";

function indexCode(symbol: string): string {
  return symbol
    .toUpperCase()
    .trim()
    .replace(/^\./, "")
    .replace(/\.US$/i, "")
    .replace(/\.HK$/i, "")
    .replace(/^US\./, "")
    .replace(/^HK\./, "");
}

/** Longbridge: AAPL → AAPL.US ; 00700 → 700.HK ; SPX → .SPX.US ; HSI → HSI.HK */
export function toLongbridgeSymbol(
  symbol: string,
  assetType: AssetType,
): string {
  const code = indexCode(symbol);
  if (isMarketIndexSymbol(code)) {
    return INDEX_LONGBRIDGE[code];
  }
  const s = normalizeSymbol(symbol, assetType);
  if (assetType === "crypto") {
    return `${s}.US`;
  }
  if (assetType === "hk") {
    // OpenAPI expects unpadded codes: 700.HK (not 00700.HK)
    const bare = s.replace(/^0+/, "") || "0";
    return `${bare}.HK`;
  }
  if (s.includes(".")) return s;
  return `${s}.US`;
}

/** Futu OpenAPI: AAPL → US.AAPL ; 00700 → HK.00700 ; indices via INDEX_FUTU */
export function toFutuSymbol(symbol: string, assetType: AssetType): string {
  const code = indexCode(symbol);
  if (isMarketIndexSymbol(code)) {
    return INDEX_FUTU[code];
  }
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

export function toFinnhubSymbol(symbol: string, assetType: AssetType): string {
  const code = indexCode(symbol);
  if (isMarketIndexSymbol(code)) {
    return INDEX_FINNHUB[code];
  }
  return baseFinnhub(symbol, assetType);
}

export { normalizeSymbol };
