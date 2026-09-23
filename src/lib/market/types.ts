import type { AssetType, OhlcvBar, Quote, SearchResult } from "@/lib/types";

export type MarketProviderId = "longbridge" | "futu" | "finnhub" | "binance";

export type QuoteWithSource = Quote & { source?: MarketProviderId };

export interface MarketDataProvider {
  readonly id: MarketProviderId;
  isConfigured(): boolean;
  /** Return false to skip this provider for the given asset (e.g. crypto on brokers). */
  supports?(assetType: AssetType): boolean;
  getQuote(symbol: string, assetType: AssetType): Promise<QuoteWithSource>;
  getQuotes(
    items: { symbol: string; assetType: AssetType }[],
  ): Promise<QuoteWithSource[]>;
  getDailyCandles(
    symbol: string,
    assetType: AssetType,
    from: number,
    to: number,
  ): Promise<OhlcvBar[]>;
  getMonthlyCandles(
    symbol: string,
    assetType: AssetType,
    from: number,
    to: number,
  ): Promise<OhlcvBar[]>;
  searchSymbols(q: string, assetType: AssetType): Promise<SearchResult[]>;
}

export class MarketDataError extends Error {
  constructor(
    message: string,
    public provider?: MarketProviderId,
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}
