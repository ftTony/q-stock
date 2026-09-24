import type { AssetType, Quote } from "@/lib/types";

export type PortfolioRow = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
};

export type PortfolioNewsItem = {
  headline: string;
  url?: string;
  datetime?: number;
  source?: string;
  category?: string;
  image?: string;
};

export type PaperPosition = {
  id: string;
  symbol: string;
  assetType: AssetType;
  qty: number;
  avgCost: number;
  price: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
};

export type PaperOrder = {
  id: string;
  symbol: string;
  assetType: AssetType;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  qty: number;
  limitPrice: number | null;
  stopPrice: number | null;
  status: string;
  filledPrice: number | null;
  filledAt: string | null;
  createdAt: string;
};

export type MarketSentiment = {
  bullish_pct?: number;
  bearish_pct?: number;
  available?: boolean;
  message?: string;
};
