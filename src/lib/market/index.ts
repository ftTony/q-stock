import {
  listProvidersFor,
  listProvidersForCandles,
  withProviderFailover,
} from "@/lib/market/router";
import type { QuoteWithSource } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";
import { normalizeSymbol } from "@/lib/types";

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
        out.push(...quotes);
        const gotKeys = new Set<string>();
        for (const q of quotes) {
          if (!(q.price > 0)) continue;
          gotKeys.add(q.symbol.toUpperCase());
          try {
            gotKeys.add(normalizeSymbol(q.symbol, q.assetType).toUpperCase());
          } catch {
            /* ignore */
          }
        }
        for (let i = remaining.length - 1; i >= 0; i--) {
          const item = remaining[i]!;
          const keys = [
            item.symbol.toUpperCase(),
            normalizeSymbol(item.symbol, item.assetType).toUpperCase(),
          ];
          if (keys.some((k) => gotKeys.has(k))) remaining.splice(i, 1);
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
