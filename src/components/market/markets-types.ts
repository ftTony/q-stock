import type { AssetType, Quote } from "@/lib/types";

export type RankQuote = Quote & { name?: string };

export type IndexQuote = {
  id: string;
  symbol: string;
  nameKey: string;
  assetType: AssetType;
  price: number | null;
  change: number | null;
  percentChange: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
};
