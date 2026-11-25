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

/** Rank-table row: quote plus optional industry/enrichment fields. */
export type AnalysisTableRow = Quote & {
  marketCap?: number;
  turnoverRate?: number;
  changeSpeed?: number;
  volumeRatio?: number;
  /** 委比 % when bid/ask size known. */
  orderRatio?: number;
  /** 振幅 % from high/low/prevClose when computable. */
  amplitude?: number;
  /** Multi-day / YTD change % from broker calc (or candles later). */
  change5d?: number;
  change10d?: number;
  change20d?: number;
  change60d?: number;
  change120d?: number;
  change250d?: number;
  changeYtd?: number;
};

/** Optional calc enrich merged onto rank rows. */
export type AnalysisCalcEnrich = {
  marketCap?: number;
  turnoverRate?: number;
  amplitude?: number;
  volumeRatio?: number;
  changeSpeed?: number;
  change5d?: number;
  change10d?: number;
  change20d?: number;
  change60d?: number;
  change120d?: number;
  change250d?: number;
  changeYtd?: number;
};

export function toAnalysisTableRow(
  stock: IndustryHeatCell["stocks"][number],
  assetType: AnalysisEquityType,
  quote?: Quote | null,
  calc?: AnalysisCalcEnrich | null,
): AnalysisTableRow {
  const base = industryStockToQuote(stock, assetType);
  const q = quote ?? base;
  const change =
    q.change !== 0
      ? q.change
      : q.previousClose > 0
        ? q.price - q.previousClose
        : 0;
  const prev = q.previousClose > 0 ? q.previousClose : null;
  const amplitudeFromQuote =
    prev != null && q.high > 0 && q.low > 0 && q.high !== q.low
      ? ((q.high - q.low) / prev) * 100
      : undefined;
  const bid = q.bidSize;
  const ask = q.askSize;
  const orderRatio =
    bid != null && ask != null && bid + ask > 0
      ? ((bid - ask) / (bid + ask)) * 100
      : undefined;
  return {
    ...q,
    name: q.name || stock.name,
    percentChange: q.percentChange || stock.percentChange,
    change,
    marketCap: calc?.marketCap ?? stock.marketCap,
    amplitude: calc?.amplitude ?? amplitudeFromQuote,
    orderRatio,
    turnoverRate: calc?.turnoverRate,
    volumeRatio: calc?.volumeRatio,
    changeSpeed: calc?.changeSpeed,
    change5d: calc?.change5d,
    change10d: calc?.change10d,
    change20d: calc?.change20d,
    change60d: calc?.change60d,
    change120d: calc?.change120d,
    change250d: calc?.change250d,
    changeYtd: calc?.changeYtd,
  };
}

export type { IndustryHeatCell };
