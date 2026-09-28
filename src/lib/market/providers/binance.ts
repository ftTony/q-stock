import { cachedFetch } from "@/lib/cache";
import { getMarketCreds } from "@/lib/market/creds-context";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { OhlcvBar, SearchResult } from "@/lib/types";
import { normalizeSymbol } from "@/lib/types";

/**
 * Official REST hosts (prefer when user saved Binance API Key).
 * Web hosts = same /api/v3 JSON served from binance.com (no key; CN-friendlier).
 */
const API_BASES = [
  process.env.BINANCE_API_URL?.replace(/\/+$/, "") ||
    "https://data-api.binance.vision",
  "https://api.binance.com",
];

const WEB_BASES = [
  process.env.BINANCE_WEB_URL?.replace(/\/+$/, "") || "https://www.binance.com",
  "https://data-api.binance.vision",
];

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  ...unknown[],
];

function toPair(symbol: string): string {
  const base = normalizeSymbol(symbol, "crypto");
  return `${base}USDT`;
}

function hasUserApiKey(): boolean {
  return Boolean(getMarketCreds().binance?.apiKey?.trim());
}

async function binanceFetch<T>(
  path: string,
  query: Record<string, string | number>,
): Promise<{ data: T; via: "api" | "web" }> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    qs.set(k, String(v));
  }
  const useKey = hasUserApiKey();
  const bases = useKey ? API_BASES : WEB_BASES;
  const via: "api" | "web" = useKey ? "api" : "web";
  const apiKey = getMarketCreds().binance?.apiKey?.trim();

  let lastErr: Error | null = null;
  for (const base of bases) {
    try {
      const url = `${base}${path}?${qs.toString()}`;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (useKey && apiKey) {
        headers["X-MBX-APIKEY"] = apiKey;
      } else {
        // Mimic browser hit to www.binance.com public market JSON
        headers["User-Agent"] =
          "Mozilla/5.0 (compatible; Q-Stock/1.0; +https://localhost)";
        headers["Origin"] = "https://www.binance.com";
        headers["Referer"] = "https://www.binance.com/en/trade";
      }
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new MarketDataError(
          `Binance HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`,
          "binance",
        );
      }
      return { data: (await res.json()) as T, via };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }

  // If keyed API failed, one more pass via web hosts without key
  if (useKey) {
    for (const base of WEB_BASES) {
      try {
        const url = `${base}${path}?${qs.toString()}`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(20_000),
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (compatible; Q-Stock/1.0; +https://localhost)",
            Origin: "https://www.binance.com",
            Referer: "https://www.binance.com/en/trade",
          },
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new MarketDataError(
            `Binance web HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`,
            "binance",
          );
        }
        return { data: (await res.json()) as T, via: "web" };
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastErr ?? new MarketDataError("Binance request failed", "binance");
}

async function fetchKlines(
  symbol: string,
  interval: "1d" | "1M",
  fromSec: number,
  toSec: number,
): Promise<OhlcvBar[]> {
  const pair = toPair(symbol);
  const startMs = fromSec * 1000;
  const endMs = toSec * 1000;
  const out: OhlcvBar[] = [];
  let cursor = startMs;

  while (cursor < endMs && out.length < 5000) {
    const { data: chunk } = await binanceFetch<BinanceKline[]>(
      "/api/v3/klines",
      {
        symbol: pair,
        interval,
        startTime: cursor,
        endTime: endMs,
        limit: 1000,
      },
    );
    if (!Array.isArray(chunk) || !chunk.length) break;

    for (const row of chunk) {
      const time = Math.floor(Number(row[0]) / 1000);
      if (time < fromSec || time > toSec) continue;
      out.push({
        time,
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5]),
      });
    }

    const lastOpen = Number(chunk[chunk.length - 1][0]);
    const next = lastOpen + 1;
    if (next <= cursor) break;
    cursor = next;
    if (chunk.length < 1000) break;
  }

  out.sort((a, b) => a.time - b.time);
  const map = new Map<number, OhlcvBar>();
  for (const b of out) map.set(b.time, b);
  return [...map.values()].sort((a, b) => a.time - b.time);
}

export const binanceProvider: MarketDataProvider = {
  id: "binance",

  isConfigured() {
    // Always available: keyed API or www.binance.com web market JSON
    return true;
  },

  supports(assetType) {
    return assetType === "crypto";
  },

  async getQuote(symbol, assetType) {
    if (assetType !== "crypto") {
      throw new MarketDataError("Binance provider is crypto-only", "binance");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const pair = toPair(normalized);
    const mode = hasUserApiKey() ? "key" : "web";
    const key = `bn:quote:${mode}:${normalized}`;

    return cachedFetch(key, 10_000, async () => {
      const { data: raw } = await binanceFetch<{
        lastPrice?: string;
        priceChange?: string;
        priceChangePercent?: string;
        highPrice?: string;
        lowPrice?: string;
        openPrice?: string;
        prevClosePrice?: string;
        closeTime?: number;
        volume?: string;
        quoteVolume?: string;
        bidPrice?: string;
        askPrice?: string;
        bidQty?: string;
        askQty?: string;
      }>("/api/v3/ticker/24hr", { symbol: pair });

      const price = Number(raw.lastPrice ?? 0);
      const prev = Number(raw.prevClosePrice ?? raw.openPrice ?? price);
      const change = Number(raw.priceChange ?? price - prev);
      const volume = Number(raw.volume);
      const turnover = Number(raw.quoteVolume);
      const bid = Number(raw.bidPrice);
      const ask = Number(raw.askPrice);
      const bidSize = Number(raw.bidQty);
      const askSize = Number(raw.askQty);
      return {
        symbol: normalized,
        assetType: "crypto",
        price,
        change,
        percentChange: Number(raw.priceChangePercent ?? 0),
        high: Number(raw.highPrice ?? price),
        low: Number(raw.lowPrice ?? price),
        open: Number(raw.openPrice ?? price),
        previousClose: prev,
        timestamp: Math.floor((raw.closeTime ?? Date.now()) / 1000),
        ...(Number.isFinite(volume) && volume > 0 ? { volume } : {}),
        ...(Number.isFinite(turnover) && turnover > 0 ? { turnover } : {}),
        ...(Number.isFinite(bid) && bid > 0 ? { bid } : {}),
        ...(Number.isFinite(ask) && ask > 0 ? { ask } : {}),
        ...(Number.isFinite(bidSize) && bidSize > 0 ? { bidSize } : {}),
        ...(Number.isFinite(askSize) && askSize > 0 ? { askSize } : {}),
        source: "binance",
      } satisfies QuoteWithSource;
    });
  },

  async getQuotes(items) {
    const crypto = items.filter((i) => i.assetType === "crypto");
    const results = await Promise.allSettled(
      crypto.map((i) => this.getQuote(i.symbol, "crypto")),
    );
    return results
      .filter(
        (r): r is PromiseFulfilledResult<QuoteWithSource> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);
  },

  async getDailyCandles(symbol, assetType, from, to) {
    if (assetType !== "crypto") {
      throw new MarketDataError("Binance provider is crypto-only", "binance");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const mode = hasUserApiKey() ? "key" : "web";
    const key = `bn:candle:D:${mode}:${normalized}:${from}:${to}`;
    return cachedFetch(key, 60_000, async () => {
      const bars = await fetchKlines(normalized, "1d", from, to);
      if (!bars.length) {
        throw new MarketDataError(
          `Binance returned no daily klines for ${normalized}`,
          "binance",
        );
      }
      return bars;
    });
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    if (assetType !== "crypto") {
      throw new MarketDataError("Binance provider is crypto-only", "binance");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const mode = hasUserApiKey() ? "key" : "web";
    const key = `bn:candle:M:${mode}:${normalized}:${from}:${to}`;
    return cachedFetch(key, 120_000, async () => {
      const bars = await fetchKlines(normalized, "1M", from, to);
      if (!bars.length) return [];
      return bars;
    });
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType !== "crypto") return [];
    const sym = normalizeSymbol(q, "crypto");
    if (!sym) return [];
    return [
      {
        symbol: sym,
        displaySymbol: sym,
        description: `${sym} / USDT (Binance)`,
        assetType: "crypto",
        type: "Crypto",
      },
    ];
  },
};
