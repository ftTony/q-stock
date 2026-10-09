import type { IndexQuote } from "@/components/market/markets-types";
import {
  indicesForMarket,
  type MarketIndexDef,
} from "@/lib/market/indices";
import type { AssetType, Quote } from "@/lib/types";
import { normalizeSymbol } from "@/lib/types";

/** Placeholder rows so the ticker always shows names while prices load. */
export function seedIndexQuotes(
  assetType: Exclude<AssetType, "crypto">,
): IndexQuote[] {
  return indicesForMarket(assetType).map((d) => ({
    id: d.id,
    symbol: d.symbol,
    nameKey: d.nameKey,
    assetType: d.assetType,
    price: null,
    change: null,
    percentChange: null,
  }));
}

function hasPrice(row: Pick<IndexQuote, "price"> | Quote | null | undefined): boolean {
  return row != null && row.price != null && Number.isFinite(row.price) && row.price > 0;
}

/** Keep last-good prices when a refresh returns nulls / gaps. */
export function mergeIndexQuotes(
  prev: IndexQuote[] | undefined,
  next: IndexQuote[],
): IndexQuote[] {
  if (!prev?.length) return next;
  const byId = new Map(prev.map((p) => [p.id, p]));
  return next.map((n) => {
    if (hasPrice(n)) return n;
    const old = byId.get(n.id);
    if (old && hasPrice(old)) {
      return {
        ...n,
        price: old.price,
        change: old.change,
        percentChange: old.percentChange,
        open: n.open ?? old.open,
        high: n.high ?? old.high,
        low: n.low ?? old.low,
        previousClose: n.previousClose ?? old.previousClose,
      };
    }
    return n;
  });
}

function indexMatchKeys(def: MarketIndexDef): string[] {
  const keys = new Set<string>();
  const add = (s: string) => {
    const u = s.toUpperCase().trim();
    if (u) keys.add(u);
  };
  add(def.symbol);
  add(def.id);
  try {
    add(normalizeSymbol(def.symbol, def.assetType));
  } catch {
    /* ignore */
  }
  // Finnhub uses .SS for Shanghai Composite
  if (def.symbol.toUpperCase() === "000001.SH") add("000001.SS");
  if (def.symbol.toUpperCase() === "000001.SS") add("000001.SH");
  return [...keys];
}

/** Find a quote for an index def across common symbol aliases. */
export function quoteForIndexDef(
  def: MarketIndexDef,
  quotes: Quote[],
): Quote | undefined {
  const keys = new Set(indexMatchKeys(def));
  for (const q of quotes) {
    if (keys.has(q.symbol.toUpperCase())) return q;
    try {
      const n = normalizeSymbol(q.symbol, def.assetType).toUpperCase();
      if (keys.has(n)) return q;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

export function defsToIndexQuotes(
  defs: MarketIndexDef[],
  quotes: Quote[],
): IndexQuote[] {
  return defs.map((d) => {
    const q = quoteForIndexDef(d, quotes);
    return {
      id: d.id,
      symbol: d.symbol,
      nameKey: d.nameKey,
      assetType: d.assetType,
      price: hasPrice(q) ? q!.price : null,
      change: hasPrice(q) ? (q!.change ?? null) : null,
      percentChange: hasPrice(q) ? (q!.percentChange ?? null) : null,
      open: q?.open ?? null,
      high: q?.high ?? null,
      low: q?.low ?? null,
      previousClose: q?.previousClose ?? null,
    };
  });
}
