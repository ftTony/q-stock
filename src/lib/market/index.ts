import {
  getProvider,
  listEquityAttempts,
  listProvidersFor,
  listProvidersForCandles,
  runWithEquityAttempt,
  withProviderFailover,
} from "@/lib/market/router";
import {
  MarketDataError,
  type QuoteWithSource,
} from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";
import { normalizeSymbol } from "@/lib/types";
import {
  activeExtendedQuote,
  mergeExtendedQuoteFields,
} from "@/lib/market/extended-hours";
import { getUsMarketPhase } from "@/lib/market/session";

export {
  getActiveProviders,
  getProviderPriority,
  isProviderEnabled,
  listContentProviders,
  listEquityAttempts,
  listProvidersFor,
  listProvidersForCandles,
} from "@/lib/market/router";
export type { ContentProviderId, EquityAttempt } from "@/lib/market/router";
export type { MarketProviderId, QuoteWithSource } from "@/lib/market/types";
export { MarketDataError } from "@/lib/market/types";

function isEquityAsset(assetType: AssetType): boolean {
  return assetType === "stock" || assetType === "hk" || assetType === "cn";
}

function consumeMatchedQuotes(
  remaining: { symbol: string; assetType: AssetType }[],
  quotes: QuoteWithSource[],
) {
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
}

export async function getQuote(
  symbol: string,
  assetType: AssetType,
): Promise<QuoteWithSource> {
  const quote = await withProviderFailover(
    assetType,
    (p) => p.getQuote(symbol, assetType),
    `quote ${symbol}`,
  );
  const [enriched] = await supplementUsExtendedQuotes([quote]);
  return enriched ?? quote;
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
    const remaining = [...group];

    if (isEquityAsset(assetType)) {
      for (const attempt of listEquityAttempts()) {
        if (!remaining.length) break;
        const p = getProvider(attempt.id);
        if (!p || p.supports?.(assetType) === false) continue;
        try {
          const quotes = await runWithEquityAttempt(attempt, () =>
            p.getQuotes(remaining),
          );
          out.push(...quotes);
          consumeMatchedQuotes(remaining, quotes);
        } catch (err) {
          console.warn(
            `[market] batch quotes via ${attempt.id} (${attempt.source}) failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      continue;
    }

    const providers = listProvidersFor(assetType);
    if (!providers.length) continue;

    for (const p of providers) {
      if (!remaining.length) break;
      try {
        const quotes = await p.getQuotes(remaining);
        out.push(...quotes);
        consumeMatchedQuotes(remaining, quotes);
      } catch (err) {
        console.warn(
          `[market] batch quotes via ${p.id} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }
  return supplementUsExtendedQuotes(out);
}

async function supplementUsExtendedQuotes(
  quotes: QuoteWithSource[],
): Promise<QuoteWithSource[]> {
  const phase = getUsMarketPhase();
  if (phase === "regular") return quotes;

  const candidates = quotes.filter(
    (quote) =>
      quote.assetType === "stock" &&
      (!activeExtendedQuote(quote, phase) || !quote.regularSession),
  );
  if (!candidates.length) return quotes;

  const attempt = listEquityAttempts().find(
    (candidate) => candidate.id === "longbridge",
  );
  const provider = getProvider("longbridge");
  if (!attempt || !provider) return quotes;

  try {
    const extendedQuotes = await runWithEquityAttempt(attempt, () =>
      provider.getQuotes(
        candidates.map(({ symbol, assetType }) => ({ symbol, assetType })),
      ),
    );
    const bySymbol = new Map(
      extendedQuotes.map((quote) => [quote.symbol.toUpperCase(), quote]),
    );
    return quotes.map((quote) => {
      if (quote.assetType !== "stock") return quote;
      const extended = bySymbol.get(quote.symbol.toUpperCase());
      return extended
        ? mergeExtendedQuoteFields(quote, extended, phase)
        : quote;
    });
  } catch (err) {
    console.warn(
      "[market] Longbridge extended quote supplement failed:",
      err instanceof Error ? err.message : err,
    );
    return quotes;
  }
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

export async function getIntradayCandles(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  interval: "1" | "5",
): Promise<OhlcvBar[]> {
  const providers = listProvidersForCandles(assetType).filter(
    (p) => typeof p.getIntradayCandles === "function",
  );
  return withProviderFailover(
    assetType,
    (p) => p.getIntradayCandles!(symbol, assetType, from, to, interval),
    `intraday ${interval}m ${symbol}`,
    providers,
  );
}

function isSyntheticBrokerHit(providerId: string, results: SearchResult[]) {
  if (results.length !== 1) return false;
  const d = results[0]?.description ?? "";
  if (providerId === "longbridge" || providerId === "futu") {
    return /\(Longbridge\)|\(Futu\)$/i.test(d);
  }
  // Finnhub only has real multi-hit search for US; HK is an exact-ticker echo.
  if (providerId === "finnhub") {
    return /\(HK\)$/i.test(d);
  }
  return false;
}

/**
 * Equity search order: Futu keyword API → Finnhub → Longbridge (exact-ticker fallback).
 */
export async function searchSymbols(
  q: string,
  assetType: AssetType,
): Promise<SearchResult[]> {
  const query = q.trim();
  if (!query) return [];

  if (isEquityAsset(assetType)) {
    const equityAttempts = listEquityAttempts();
    const prefer = ["futu", "finnhub", "longbridge"] as const;
    const attempts = [
      ...prefer.flatMap((id) => equityAttempts.filter((a) => a.id === id)),
      ...equityAttempts.filter(
        (a) => !(prefer as readonly string[]).includes(a.id),
      ),
    ];
    if (!attempts.length) {
      throw new MarketDataError(
        "No market data providers configured. Set broker/crypto keys in Settings, or FINNHUB_API_KEY.",
      );
    }
    const errors: string[] = [];
    let fallback: SearchResult[] | null = null;
    for (const attempt of attempts) {
      const p = getProvider(attempt.id);
      if (!p) continue;
      try {
        const results = await runWithEquityAttempt(attempt, () =>
          p.searchSymbols(query, assetType),
        );
        if (!results.length) continue;
        if (isSyntheticBrokerHit(p.id, results)) {
          fallback = results;
          continue;
        }
        return results;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${attempt.id}:${attempt.source}: ${msg}`);
        console.warn(
          `[market] search ${query} via ${attempt.id} (${attempt.source}) failed:`,
          msg,
        );
      }
    }
    if (fallback?.length) return fallback;
    if (errors.length) {
      throw new MarketDataError(
        `All providers failed for search ${query}: ${errors.join(" | ")}`,
      );
    }
    return [];
  }

  const providers = listProvidersFor(assetType);
  if (!providers.length) {
    throw new MarketDataError(
      "No market data providers configured. Set broker/crypto keys in Settings, or FINNHUB_API_KEY.",
    );
  }

  const errors: string[] = [];
  let fallback: SearchResult[] | null = null;

  for (const p of providers) {
    try {
      const results = await p.searchSymbols(query, assetType);
      if (!results.length) continue;
      if (isSyntheticBrokerHit(p.id, results)) {
        fallback = results;
        continue;
      }
      return results;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${p.id}: ${msg}`);
      console.warn(`[market] search ${query} via ${p.id} failed:`, msg);
    }
  }

  if (fallback?.length) return fallback;
  if (errors.length) {
    throw new MarketDataError(
      `All providers failed for search ${query}: ${errors.join(" | ")}`,
    );
  }
  return [];
}
