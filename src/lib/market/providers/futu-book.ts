import { cachedFetch } from "@/lib/cache";
import type {
  DepthBook,
  DepthLevel,
  TradeTick,
} from "@/lib/market/book-types";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

function assertEquity(assetType: AssetType) {
  if (assetType === "crypto") {
    throw new MarketDataError("Futu book is equity-only", "futu");
  }
}

function mapLevel(row: {
  price?: number;
  volume?: number;
  order_count?: number;
}): DepthLevel | null {
  const price = Number(row.price);
  if (!(price > 0)) return null;
  return {
    price,
    volume: Number(row.volume ?? 0),
    orderNum: Number(row.order_count ?? 0),
  };
}

function mapDirection(raw: string | undefined): TradeTick["direction"] {
  const d = String(raw ?? "").toUpperCase();
  if (d === "BUY") return "up";
  if (d === "SELL") return "down";
  return "neutral";
}

/**
 * POST /api/v1.0/quote/order-book — one-shot depth snapshot.
 */
export async function fetchFutuDepth(
  symbol: string,
  assetType: AssetType,
  maxLevels = 10,
): Promise<DepthBook> {
  assertEquity(assetType);
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const levels = Math.min(10, Math.max(1, maxLevels));
  const key = `futu:depth:${code}:${levels}`;

  return cachedFetch(key, 3_000, async () => {
    const { data } = await futuRequest<
      Array<{
        code?: string;
        books?: Array<{
          bid_list?: Array<{
            price?: number;
            volume?: number;
            order_count?: number;
          }>;
          ask_list?: Array<{
            price?: number;
            volume?: number;
            order_count?: number;
          }>;
        }>;
      }>
    >("POST", "/api/v1.0/quote/order-book", {
      body: { code, num: levels },
    });

    const row = Array.isArray(data) ? data[0] : null;
    const book = row?.books?.[0];
    const bids = (book?.bid_list ?? [])
      .map(mapLevel)
      .filter((x): x is DepthLevel => x != null)
      .slice(0, levels);
    const asks = (book?.ask_list ?? [])
      .map(mapLevel)
      .filter((x): x is DepthLevel => x != null)
      .slice(0, levels);
    if (!bids.length && !asks.length) {
      throw new MarketDataError(`No depth for ${code}`, "futu");
    }
    return { bids, asks };
  });
}

/**
 * GET /api/v1.0/quote/{symbol}/rt-ticker — latest N trades.
 */
export async function fetchFutuTrades(
  symbol: string,
  assetType: AssetType,
  count = 50,
): Promise<TradeTick[]> {
  assertEquity(assetType);
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const n = Math.min(50, Math.max(1, count));
  const key = `futu:trades:${code}:${n}`;

  return cachedFetch(key, 3_000, async () => {
    const path = `/api/v1.0/quote/${encodeURIComponent(code)}/rt-ticker`;
    const { data } = await futuRequest<{
      volume_precision?: number;
      ticker_list?: Array<{
        time?: number;
        price?: number;
        volume?: number;
        ticker_direction?: string;
        direction?: string;
      }>;
    }>("GET", path, { query: { num: n } });

    const precision = Number(data.volume_precision ?? 0);
    const scale =
      Number.isFinite(precision) && precision > 0 ? 10 ** precision : 1;
    const out: TradeTick[] = [];
    for (const t of data.ticker_list ?? []) {
      const price = Number(t.price);
      if (!(price > 0)) continue;
      const timeMs = Number(t.time);
      out.push({
        price,
        volume: Number(t.volume ?? 0) / scale,
        time: Math.floor(
          (Number.isFinite(timeMs) && timeMs > 0 ? timeMs : Date.now()) / 1000,
        ),
        direction: mapDirection(t.ticker_direction ?? t.direction),
      });
    }
    if (!out.length) {
      throw new MarketDataError(`No trades for ${code}`, "futu");
    }
    return out;
  });
}
