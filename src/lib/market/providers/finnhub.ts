import { cachedFetch } from "@/lib/cache";
import { mapPoolSettled } from "@/lib/map-pool";
import type { AssetType, OhlcvBar, Quote, SearchResult } from "@/lib/types";
import { normalizeSymbol, toFinnhubSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";

const BASE = "https://finnhub.io/api/v1";

export class FinnhubError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "FinnhubError";
  }
}

async function finnhubFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  retries = 2,
): Promise<T> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    throw new FinnhubError("FINNHUB_API_KEY is not configured");
  }

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("token", token);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 0 },
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        lastError = new FinnhubError("Finnhub rate limited", 429);
        continue;
      }
      if (!res.ok) {
        throw new FinnhubError(`Finnhub HTTP ${res.status}`, res.status);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new FinnhubError("Finnhub request failed");
}

interface RawQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface RawCandle {
  c?: number[];
  h?: number[];
  l?: number[];
  o?: number[];
  v?: number[];
  t?: number[];
  s: string;
}

function mapCandles(raw: RawCandle): OhlcvBar[] {
  if (raw.s !== "ok" || !raw.t?.length) return [];
  const bars: OhlcvBar[] = [];
  for (let i = 0; i < raw.t.length; i++) {
    bars.push({
      time: raw.t[i],
      open: raw.o![i],
      high: raw.h![i],
      low: raw.l![i],
      close: raw.c![i],
      volume: raw.v?.[i] ?? 0,
    });
  }
  return bars;
}

async function fhGetQuote(
  symbol: string,
  assetType: AssetType,
): Promise<QuoteWithSource> {
  const normalized = normalizeSymbol(symbol, assetType);
  const fh = toFinnhubSymbol(normalized, assetType);
  const key = `fh:quote:${assetType}:${normalized}`;

  return cachedFetch(key, 15_000, async () => {
    const raw = await finnhubFetch<RawQuote>("/quote", { symbol: fh });
    return {
      symbol: normalized,
      assetType,
      price: raw.c ?? 0,
      change: raw.d ?? 0,
      percentChange: raw.dp ?? 0,
      high: raw.h ?? 0,
      low: raw.l ?? 0,
      open: raw.o ?? 0,
      previousClose: raw.pc ?? 0,
      timestamp: raw.t ?? Math.floor(Date.now() / 1000),
      source: "finnhub" as const,
    };
  });
}

export const finnhubProvider: MarketDataProvider = {
  id: "finnhub",

  isConfigured() {
    return Boolean(process.env.FINNHUB_API_KEY);
  },

  supports(assetType) {
    // Prefer US + crypto; HK quotes via Finnhub are best-effort (.HK suffix)
    return assetType === "stock" || assetType === "crypto" || assetType === "hk";
  },

  async getQuote(symbol, assetType) {
    try {
      return await fhGetQuote(symbol, assetType);
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Finnhub quote failed",
        "finnhub",
      );
    }
  },

  async getQuotes(items) {
    return mapPoolSettled(items.slice(0, 80), 6, (i) =>
      fhGetQuote(i.symbol, i.assetType),
    );
  },

  async getDailyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const fh = toFinnhubSymbol(normalized, assetType);
    const key = `fh:candle:D:${assetType}:${normalized}:${from}:${to}`;
    return cachedFetch(key, 60_000, async () => {
      const path = assetType === "crypto" ? "/crypto/candle" : "/stock/candle";
      const raw = await finnhubFetch<RawCandle>(path, {
        symbol: fh,
        resolution: "D",
        from,
        to,
      });
      const bars = mapCandles(raw);
      if (!bars.length) {
        throw new MarketDataError(
          `Finnhub returned no daily candles for ${fh}`,
          "finnhub",
        );
      }
      return bars;
    });
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const fh = toFinnhubSymbol(normalized, assetType);
    const key = `fh:candle:M:${assetType}:${normalized}:${from}:${to}`;
    return cachedFetch(key, 120_000, async () => {
      const path = assetType === "crypto" ? "/crypto/candle" : "/stock/candle";
      const raw = await finnhubFetch<RawCandle>(path, {
        symbol: fh,
        resolution: "M",
        from,
        to,
      });
      return mapCandles(raw);
    });
  },

  async getIntradayCandles(symbol, assetType, from, to, interval) {
    const normalized = normalizeSymbol(symbol, assetType);
    const fh = toFinnhubSymbol(normalized, assetType);
    const key = `fh:candle:${interval}m:${assetType}:${normalized}:${from}:${to}`;
    return cachedFetch(key, 30_000, async () => {
      const path = assetType === "crypto" ? "/crypto/candle" : "/stock/candle";
      const raw = await finnhubFetch<RawCandle>(path, {
        symbol: fh,
        resolution: interval,
        from,
        to,
      });
      const bars = mapCandles(raw);
      if (!bars.length) {
        throw new MarketDataError(
          `Finnhub returned no ${interval}m candles for ${fh}`,
          "finnhub",
        );
      }
      return bars;
    });
  },

  async searchSymbols(q, assetType) {
    const query = q.trim();
    if (query.length < 1) return [];
    const key = `fh:search:${assetType}:${query.toUpperCase()}`;

    return cachedFetch(key, 300_000, async () => {
      if (assetType === "crypto") {
        const upper = query.toUpperCase();
        return [
          {
            symbol: normalizeSymbol(upper, "crypto"),
            displaySymbol: normalizeSymbol(upper, "crypto"),
            description: `${normalizeSymbol(upper, "crypto")} / USDT`,
            assetType: "crypto" as const,
            type: "Crypto",
          },
        ] satisfies SearchResult[];
      }
      if (assetType === "hk") {
        const sym = normalizeSymbol(query, "hk");
        return [
          {
            symbol: sym,
            displaySymbol: `${sym}.HK`,
            description: `${sym} (HK)`,
            assetType: "hk" as const,
            type: "Common Stock",
          },
        ] satisfies SearchResult[];
      }
      const data = await finnhubFetch<{
        count: number;
        result: {
          description: string;
          displaySymbol: string;
          symbol: string;
          type: string;
        }[];
      }>("/search", { q: query });

      const seen = new Set<string>();
      const out: SearchResult[] = [];
      for (const r of data.result ?? []) {
        const type = (r.type || "").trim();
        // US equity search: skip warrants/bonds and foreign listings.
        if (
          type &&
          type !== "Common Stock" &&
          type !== "ETP" &&
          !/^ETF/i.test(type)
        ) {
          continue;
        }
        if (/\.(HK|L|TO|T|AX|SS|SZ|TWO|KS|KQ|NS|BO|NS)$/i.test(r.symbol)) {
          continue;
        }
        const symbol = r.symbol.split(".")[0]?.toUpperCase();
        if (!symbol || seen.has(symbol)) continue;
        seen.add(symbol);
        out.push({
          symbol,
          displaySymbol: r.displaySymbol || symbol,
          description: r.description || symbol,
          assetType: "stock",
          type: type || "Common Stock",
        });
        if (out.length >= 12) break;
      }
      return out;
    });
  },
};

export { finnhubFetch };

