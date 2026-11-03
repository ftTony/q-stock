import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import {
  fetchFutuDepth,
  fetchFutuTrades,
} from "@/lib/market/providers/futu-book";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import {
  fetchLbDepth,
  fetchLbTrades,
} from "@/lib/market/providers/longbridge-book";
import { hasLongbridgeCreds } from "@/lib/market/providers/longbridge-client";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

/**
 * Depth / trades: Longbridge first (SDK), then Futu REST.
 * Live updates still come from quote-ws broker push when available.
 */
export async function fetchDepthBook(
  symbol: string,
  assetType: AssetType,
  maxLevels = 10,
): Promise<DepthBook> {
  const errors: string[] = [];
  if (hasLongbridgeCreds()) {
    try {
      return await fetchLbDepth(symbol, assetType, maxLevels);
    } catch (err) {
      errors.push(
        `longbridge: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  if (isFutuConfigured()) {
    try {
      return await fetchFutuDepth(symbol, assetType, maxLevels);
    } catch (err) {
      errors.push(
        `futu: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  throw new MarketDataError(
    errors.length
      ? `Depth failed: ${errors.join(" | ")}`
      : "No broker configured for depth",
  );
}

export async function fetchTradeTicks(
  symbol: string,
  assetType: AssetType,
  count = 50,
): Promise<TradeTick[]> {
  const errors: string[] = [];
  if (hasLongbridgeCreds()) {
    try {
      return await fetchLbTrades(symbol, assetType, count);
    } catch (err) {
      errors.push(
        `longbridge: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  if (isFutuConfigured()) {
    try {
      return await fetchFutuTrades(symbol, assetType, count);
    } catch (err) {
      errors.push(
        `futu: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  throw new MarketDataError(
    errors.length
      ? `Trades failed: ${errors.join(" | ")}`
      : "No broker configured for trades",
  );
}
