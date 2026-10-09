import type { IndustryHeatCell } from "@/lib/market/industry";
import type { AssetType, Quote } from "@/lib/types";

/** Equity markets only — industry compare is stock/hk/cn. */
export type AnalysisEquityType = Extract<AssetType, "stock" | "hk" | "cn">;

export type AnalysisWorkspace = "boards" | "compare";

export type AnalysisBasketItem = {
  symbol: string;
  assetType: AssetType;
  name?: string;
  price?: number;
  change?: number;
  percentChange?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  volume?: number;
  industryId?: string;
  industryName?: string;
};

export const ANALYSIS_BASKET_MAX = 4;
export const ANALYSIS_BASKET_MIN = 2;
export const ANALYSIS_RECENT_KEY = "q-stock:analysis-recent";
export const ANALYSIS_RECENT_MAX = 8;

export type AnalysisRecentItem = {
  symbol: string;
  assetType: AssetType;
};

export function basketKey(item: { symbol: string; assetType: AssetType }) {
  return `${item.assetType}:${item.symbol}`;
}

export function quoteToBasketItem(
  q: Quote,
  industry?: { id: string; name: string },
): AnalysisBasketItem {
  return {
    symbol: q.symbol,
    assetType: q.assetType,
    name: q.name,
    price: q.price,
    change: q.change,
    percentChange: q.percentChange,
    high: q.high,
    low: q.low,
    previousClose: q.previousClose,
    volume: q.volume,
    industryId: industry?.id,
    industryName: industry?.name,
  };
}

export function industryStockToQuote(
  stock: IndustryHeatCell["stocks"][number],
  assetType: AnalysisEquityType,
): Quote {
  return {
    symbol: stock.symbol,
    assetType,
    name: stock.name,
    price: stock.price,
    change: 0,
    percentChange: stock.percentChange,
    high: stock.price,
    low: stock.price,
    open: stock.price,
    previousClose: stock.price,
    timestamp: Date.now(),
  };
}

export type { IndustryHeatCell };
