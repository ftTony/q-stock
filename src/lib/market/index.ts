import {
  listProvidersFor,
  listProvidersForCandles,
  withProviderFailover,
} from "@/lib/market/router";
import type { QuoteWithSource } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

export {
  getActiveProviders,
  getProviderPriority,
  isProviderEnabled,
  listContentProviders,
  listProvidersFor,
  listProvidersForCandles,
} from "@/lib/market/router";
export type { ContentProviderId } from "@/lib/market/router";
export type { MarketProviderId, QuoteWithSource } from "@/lib/market/types";
export { MarketDataError } from "@/lib/market/types";

export async function getQuote(
  symbol: string,
  assetType: AssetType,
): Promise<QuoteWithSource> {
  return withProviderFailover(
    assetType,
    (p) => p.getQuote(symbol, assetType),
    `quote ${symbol}`,
  );
}

export async function getQuotes(
  items: { symbol: string; assetType: AssetType }[],
): Promise<QuoteWithSource[]> {
  if (!items.length) return [];

  // Group by asset type; use first available provider's batch, then fill gaps
  const byType = new Map<AssetType, typeof items>();
  for (const item of items) {
    const list = byType.get(item.assetType) ?? [];
    list.push(item);
    byType.set(item.assetType, list);
  }

  const out: QuoteWithSource[] = [];
  for (const [assetType, group] of byType) {
    const providers = listProvidersFor(assetType);
    if (!providers.length) continue;

    const remaining = [...group];
    for (const p of providers) {
      if (!remaining.length) break;
      try {
        const quotes = await p.getQuotes(remaining);
        const got = new Set(quotes.map((q) => q.symbol));
        out.push(...quotes);
        for (let i = remaining.length - 1; i >= 0; i--) {
          if (got.has(remaining[i].symbol.toUpperCase()) ||
              got.has(remaining[i].symbol)) {
            remaining.splice(i, 1);
          }
        }
        // Also remove by normalized match
        const gotUpper = new Set([...got].map((s) => s.toUpperCase()));
        for (let i = remaining.length - 1; i >= 0; i--) {
          if (gotUpper.has(remaining[i].symbol.toUpperCase())) {
            remaining.splice(i, 1);
          }
        }
      } catch (err) {
        console.warn(
          `[market] batch quotes via ${p.id} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }
  return out;
}

export async function getDailyCandles(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
): Promise<OhlcvBar[]> {
  return withProviderFailover(
    assetType,
    (p) => p.getDailyCandles(symbol, assetType, from, to),
    `daily ${symbol}`,
    listProvidersForCandles(assetType),
  );
}

export async function getMonthlyCandles(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
): Promise<OhlcvBar[]> {
  return withProviderFailover(
    assetType,
    (p) => p.getMonthlyCandles(symbol, assetType, from, to),
    `monthly ${symbol}`,
    listProvidersForCandles(assetType),
  );
}

export async function searchSymbols(
  q: string,
  assetType: AssetType,
): Promise<SearchResult[]> {
  return withProviderFailover(
    assetType,
    (p) => p.searchSymbols(q, assetType),
    `search ${q}`,
  );
}
