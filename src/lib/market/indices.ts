import type { AssetType } from "@/lib/types";

export type MarketIndexId =
  | "SPX"
  | "IXIC"
  | "DJI"
  | "HSI"
  | "HSTECH"
  | "HSCEI";

export type MarketIndexDef = {
  id: MarketIndexId;
  /** Internal symbol used for quotes / matching. */
  symbol: string;
  assetType: AssetType;
  /** i18n key under market.* */
  nameKey: string;
};

/** US: S&P 500, Nasdaq Composite, Dow Jones. */
export const US_MARKET_INDICES: MarketIndexDef[] = [
  { id: "SPX", symbol: "SPX", assetType: "stock", nameKey: "indexSpx" },
  { id: "IXIC", symbol: "IXIC", assetType: "stock", nameKey: "indexIxic" },
  { id: "DJI", symbol: "DJI", assetType: "stock", nameKey: "indexDji" },
];

/** HK: Hang Seng, Hang Seng Tech, HS China Enterprises. */
export const HK_MARKET_INDICES: MarketIndexDef[] = [
  { id: "HSI", symbol: "HSI", assetType: "hk", nameKey: "indexHsi" },
  { id: "HSTECH", symbol: "HSTECH", assetType: "hk", nameKey: "indexHstech" },
  { id: "HSCEI", symbol: "HSCEI", assetType: "hk", nameKey: "indexHscei" },
];

export function indicesForMarket(
  assetType: AssetType,
): MarketIndexDef[] {
  if (assetType === "hk") return HK_MARKET_INDICES;
  if (assetType === "stock") return US_MARKET_INDICES;
  return [];
}

/** Longbridge OpenAPI index wire codes. */
export const INDEX_LONGBRIDGE: Record<string, string> = {
  SPX: ".SPX.US",
  IXIC: ".IXIC.US",
  DJI: ".DJI.US",
  HSI: "HSI.HK",
  HSTECH: "HSTECH.HK",
  HSCEI: "HSCEI.HK",
};

/** Futu OpenAPI index wire codes. */
export const INDEX_FUTU: Record<string, string> = {
  SPX: "US..SPX",
  IXIC: "US..IXIC",
  DJI: "US..DJI",
  HSI: "HK.800000",
  HSTECH: "HK.800100",
  HSCEI: "HK.800150",
};

/** Finnhub index symbols (often paid; used as last resort). */
export const INDEX_FINNHUB: Record<string, string> = {
  SPX: "^GSPC",
  IXIC: "^IXIC",
  DJI: "^DJI",
  HSI: "^HSI",
  HSTECH: "HSTECH.HK",
  HSCEI: "^HSCE",
};

export function isMarketIndexSymbol(symbol: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    INDEX_LONGBRIDGE,
    symbol.toUpperCase().trim(),
  );
}
