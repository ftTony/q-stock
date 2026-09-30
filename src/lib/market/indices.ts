import type { AssetType } from "@/lib/types";

export type MarketIndexId =
  | "SPX"
  | "IXIC"
  | "DJI"
  | "HSI"
  | "HSTECH"
  | "HSCEI"
  | "SSEC"
  | "SZI"
  | "CHINEXT";

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

/** CN: Shanghai Composite, Shenzhen Component, ChiNext. */
export const CN_MARKET_INDICES: MarketIndexDef[] = [
  { id: "SSEC", symbol: "000001.SH", assetType: "cn", nameKey: "indexSsec" },
  { id: "SZI", symbol: "399001.SZ", assetType: "cn", nameKey: "indexSzi" },
  {
    id: "CHINEXT",
    symbol: "399006.SZ",
    assetType: "cn",
    nameKey: "indexChinext",
  },
];

const CN_INDEX_THSCODES = new Set(
  CN_MARKET_INDICES.map((d) => d.symbol.toUpperCase()),
);

export function isCnIndexThscode(symbol: string): boolean {
  return CN_INDEX_THSCODES.has(symbol.toUpperCase().trim());
}

export function indicesForMarket(assetType: AssetType): MarketIndexDef[] {
  if (assetType === "hk") return HK_MARKET_INDICES;
  if (assetType === "stock") return US_MARKET_INDICES;
  if (assetType === "cn") return CN_MARKET_INDICES;
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
  SSEC: "000001.SH",
  SZI: "399001.SZ",
  CHINEXT: "399006.SZ",
  "000001.SH": "000001.SH",
  "399001.SZ": "399001.SZ",
  "399006.SZ": "399006.SZ",
};

/** Futu OpenAPI index wire codes. */
export const INDEX_FUTU: Record<string, string> = {
  SPX: "US..SPX",
  IXIC: "US..IXIC",
  DJI: "US..DJI",
  HSI: "HK.800000",
  HSTECH: "HK.800100",
  HSCEI: "HK.800150",
  SSEC: "SH.000001",
  SZI: "SZ.399001",
  CHINEXT: "SZ.399006",
  "000001.SH": "SH.000001",
  "399001.SZ": "SZ.399001",
  "399006.SZ": "SZ.399006",
};

/** Finnhub index symbols (often paid; used as last resort). */
export const INDEX_FINNHUB: Record<string, string> = {
  SPX: "^GSPC",
  IXIC: "^IXIC",
  DJI: "^DJI",
  HSI: "^HSI",
  HSTECH: "HSTECH.HK",
  HSCEI: "^HSCE",
  SSEC: "000001.SS",
  SZI: "399001.SZ",
  CHINEXT: "399006.SZ",
  "000001.SH": "000001.SS",
  "399001.SZ": "399001.SZ",
  "399006.SZ": "399006.SZ",
};

export function isMarketIndexSymbol(symbol: string): boolean {
  const s = symbol.toUpperCase().trim();
  if (Object.prototype.hasOwnProperty.call(INDEX_LONGBRIDGE, s)) return true;
  return isCnIndexThscode(s);
}
