import { cachedFetch } from "@/lib/cache";
import { getMarketCreds } from "@/lib/market/creds-context";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { OhlcvBar, SearchResult } from "@/lib/types";
import { normalizeSymbol } from "@/lib/types";

/**
 * OKX v5 public market API — no key required for ticker/candles.
 * Optional user API key headers when BYOK is saved (private endpoints later).
 */
const BASES = [
  process.env.OKX_API_URL?.replace(/\/+$/, "") || "https://www.okx.com",
  "https://okx.com",
];

type OkxEnvelope<T> = {
  code?: string;
  msg?: string;
  data?: T;
};

function toInstId(symbol: string): string {
  const base = normalizeSymbol(symbol, "crypto");
  return `${base}-USDT`;
}

function hasUserApiKey(): boolean {
  return Boolean(getMarketCreds().okx?.apiKey?.trim());
}

async function okxFetch<T>(
  path: string,
  query: Record<string, string | number>,
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    qs.set(k, String(v));
  }
  const creds = getMarketCreds().okx;
  let lastErr: Error | null = null;

  for (const base of BASES) {
    try {
      const url = `${base}${path}?${qs.toString()}`;
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Q-Stock/1.0)",
      };
      // Public market endpoints ignore auth; attach key when present for consistency
      if (creds?.apiKey) {
        headers["OK-ACCESS-KEY"] = creds.apiKey;
      }
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new MarketDataError(
          `OKX HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`,
          "okx",
        );
      }
      const json = (await res.json()) as OkxEnvelope<T>;
      if (json.code != null && json.code !== "0") {
        throw new MarketDataError(
          `OKX ${json.code}: ${json.msg || "request failed"}`,
          "okx",
        );
      }
      if (json.data === undefined) {
        throw new MarketDataError("OKX empty response", "okx");
      }
      return json.data;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastErr ?? new MarketDataError("OKX request failed", "okx");
}

/** OKX candle row: [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm] */
type OkxCandle = string[];

async function fetchCandles(
  symbol: string,
  bar: "1D" | "1Mutc",
  fromSec: number,
  toSec: number,
): Promise<OhlcvBar[]> {
  const instId = toInstId(symbol);
  const out: OhlcvBar[] = [];
  let after: string | undefined; // paginate older: after = older timestamp ms

  // Recent window first; walk back with `after`
  for (let page = 0; page < 20 && out.length < 5000; page++) {
    const query: Record<string, string | number> = {
      instId,
      bar,
      limit: 100,
    };
    if (after) query.after = after;

    const chunk = await okxFetch<OkxCandle[]>("/api/v5/market/candles", query);
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

    const oldest = Number(chunk[chunk.length - 1][0]);
    if (!Number.isFinite(oldest)) break;
    if (oldest / 1000 < fromSec) break;
    const nextAfter = String(oldest);
    if (nextAfter === after) break;
    after = nextAfter;
    if (chunk.length < 100) break;
  }

  // history-candles for deeper range if still short
  if (out.length < 30) {
    try {
      const hist = await okxFetch<OkxCandle[]>(
        "/api/v5/market/history-candles",
        {
          instId,
          bar,
          limit: 100,
          after: String(toSec * 1000),
        },
      );
      for (const row of hist) {
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
    } catch {
      /* ignore */
    }
  }

  const map = new Map<number, OhlcvBar>();
  for (const b of out) map.set(b.time, b);
  return [...map.values()].sort((a, b) => a.time - b.time);
}

export const okxProvider: MarketDataProvider = {
  id: "okx",

  isConfigured() {
    return true; // public market data always available
  },

  supports(assetType) {
    return assetType === "crypto";
  },

  async getQuote(symbol, assetType) {
    if (assetType !== "crypto") {
      throw new MarketDataError("OKX provider is crypto-only", "okx");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const instId = toInstId(normalized);
    const mode = hasUserApiKey() ? "key" : "public";
    const key = `okx:quote:${mode}:${normalized}`;

    return cachedFetch(key, 10_000, async () => {
      const rows = await okxFetch<
        {
          last?: string;
          open24h?: string;
          high24h?: string;
          low24h?: string;
          sodUtc0?: string;
          vol24h?: string;
          volCcy24h?: string;
          bidPx?: string;
          askPx?: string;
          bidSz?: string;
          askSz?: string;
          ts?: string;
        }[]
      >("/api/v5/market/ticker", { instId });
      const raw = rows[0];
      if (!raw) {
        throw new MarketDataError(`OKX no ticker for ${instId}`, "okx");
      }
      const price = Number(raw.last ?? 0);
      const open = Number(raw.open24h ?? raw.sodUtc0 ?? price);
      const change = price - open;
      const percentChange = open > 0 ? (change / open) * 100 : 0;
      const volume = Number(raw.vol24h);
      const turnover = Number(raw.volCcy24h);
      const bid = Number(raw.bidPx);
      const ask = Number(raw.askPx);
      const bidSize = Number(raw.bidSz);
      const askSize = Number(raw.askSz);
      return {
        symbol: normalized,
        assetType: "crypto",
        price,
        change,
        percentChange,
        high: Number(raw.high24h ?? price),
        low: Number(raw.low24h ?? price),
        open,
        previousClose: open,
        timestamp: Math.floor(Number(raw.ts ?? Date.now()) / 1000),
        ...(Number.isFinite(volume) && volume > 0 ? { volume } : {}),
        ...(Number.isFinite(turnover) && turnover > 0 ? { turnover } : {}),
        ...(Number.isFinite(bid) && bid > 0 ? { bid } : {}),
        ...(Number.isFinite(ask) && ask > 0 ? { ask } : {}),
        ...(Number.isFinite(bidSize) && bidSize > 0 ? { bidSize } : {}),
        ...(Number.isFinite(askSize) && askSize > 0 ? { askSize } : {}),
        source: "okx",
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
      throw new MarketDataError("OKX provider is crypto-only", "okx");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const key = `okx:candle:D:${normalized}:${from}:${to}`;
    return cachedFetch(key, 60_000, async () => {
      const bars = await fetchCandles(normalized, "1D", from, to);
      if (!bars.length) {
        throw new MarketDataError(
          `OKX returned no daily candles for ${normalized}`,
          "okx",
        );
      }
      return bars;
    });
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    if (assetType !== "crypto") {
      throw new MarketDataError("OKX provider is crypto-only", "okx");
    }
    const normalized = normalizeSymbol(symbol, "crypto");
    const key = `okx:candle:M:${normalized}:${from}:${to}`;
    return cachedFetch(key, 120_000, async () => {
      return fetchCandles(normalized, "1Mutc", from, to);
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
        description: `${sym} / USDT (OKX)`,
        assetType: "crypto",
        type: "Crypto",
      },
    ];
  },
};
