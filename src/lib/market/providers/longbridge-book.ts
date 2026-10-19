import { cachedFetch } from "@/lib/cache";
import type {
  DepthBook,
  DepthLevel,
  TradeTick,
} from "@/lib/market/book-types";
import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

export type { DepthBook, DepthLevel, TradeTick };

function assertEquity(assetType: AssetType) {
  if (assetType === "crypto") {
    throw new MarketDataError("Longbridge book is equity-only", "longbridge");
  }
}

function mapLevel(row: {
  price: { toNumber(): number } | null;
  volume: number;
  orderNum: number;
}): DepthLevel | null {
  const price = dec(row.price);
  if (!(price > 0)) return null;
  return {
    price,
    volume: Number(row.volume ?? 0),
    orderNum: Number(row.orderNum ?? 0),
  };
}

export async function fetchLbDepth(
  symbol: string,
  assetType: AssetType,
  maxLevels = 10,
): Promise<DepthBook> {
  assertEquity(assetType);
  if (!hasLongbridgeCreds()) {
    throw new MarketDataError("Longbridge credentials not configured", "longbridge");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const levels = Math.min(10, Math.max(1, maxLevels));
  const key = `lb:depth:${lbSym}:${levels}`;

  return cachedFetch(key, 3_000, async () => {
    const ctx = await getQuoteCtx();
    const depth = await ctx.depth(lbSym);
    const bids = (depth.bids ?? [])
      .map(mapLevel)
      .filter((x): x is DepthLevel => x != null)
      .slice(0, levels);
    const asks = (depth.asks ?? [])
      .map(mapLevel)
      .filter((x): x is DepthLevel => x != null)
      .slice(0, levels);
    if (!bids.length && !asks.length) {
      throw new MarketDataError(`No depth for ${lbSym}`, "longbridge");
    }
    return { bids, asks };
  });
}

export async function fetchLbTrades(
  symbol: string,
  assetType: AssetType,
  count = 50,
): Promise<TradeTick[]> {
  assertEquity(assetType);
  if (!hasLongbridgeCreds()) {
    throw new MarketDataError("Longbridge credentials not configured", "longbridge");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const n = Math.min(50, Math.max(1, count));
  const key = `lb:trades:${lbSym}:${n}`;

  return cachedFetch(key, 3_000, async () => {
    const ctx = await getQuoteCtx();
    const rows = await ctx.trades(lbSym, n);
    const out: TradeTick[] = [];
    for (const t of rows ?? []) {
      const price = dec(t.price);
      if (!(price > 0)) continue;
      const dir = Number(t.direction);
      out.push({
        price,
        volume: Number(t.volume ?? 0),
        time: Math.floor((t.timestamp?.getTime?.() ?? Date.now()) / 1000),
        direction: dir === 2 ? "up" : dir === 1 ? "down" : "neutral",
      });
    }
    if (!out.length) {
      throw new MarketDataError(`No trades for ${lbSym}`, "longbridge");
    }
    return out;
  });
}
