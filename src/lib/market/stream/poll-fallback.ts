import type { IndexQuote } from "@/components/market/markets-types";
import { getQuotes } from "@/lib/market";
import { defsToIndexQuotes } from "@/lib/market/index-quotes";
import {
  allIndexInternals,
  indexDefsForAssetType,
  type InternalSymbol,
} from "@/lib/market/stream/symbol-map";
import type { AssetType, Quote } from "@/lib/types";

export function pollIntervalMs(): number {
  const n = Number(process.env.QUOTE_POLL_MS || 1500);
  if (!Number.isFinite(n)) return 1500;
  return Math.min(10_000, Math.max(500, Math.floor(n)));
}

export async function fetchQuotesFor(
  items: InternalSymbol[],
): Promise<Quote[]> {
  if (!items.length) return [];
  const unique = new Map<string, InternalSymbol>();
  for (const it of items) {
    unique.set(`${it.assetType}:${it.symbol.toUpperCase()}`, {
      assetType: it.assetType,
      symbol: it.symbol.toUpperCase(),
    });
  }
  try {
    return await getQuotes([...unique.values()]);
  } catch (err) {
    console.warn(
      "[quote-ws] poll getQuotes failed:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export function quotesToIndexBundles(
  quotes: Quote[],
): Partial<Record<Exclude<AssetType, "crypto">, IndexQuote[]>> {
  const out: Partial<Record<Exclude<AssetType, "crypto">, IndexQuote[]>> = {};
  for (const market of ["stock", "hk", "cn"] as const) {
    const defs = indexDefsForAssetType(market);
    out[market] = defsToIndexQuotes(defs, quotes);
  }
  return out;
}

export function indexItems(): InternalSymbol[] {
  return allIndexInternals();
}
