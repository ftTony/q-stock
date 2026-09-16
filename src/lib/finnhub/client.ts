import { cachedFetch } from "@/lib/cache";
import type { AssetType, OhlcvBar, Quote, SearchResult } from "@/lib/types";
import { normalizeSymbol, toFinnhubSymbol } from "@/lib/types";

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

export async function getQuote(
  symbol: string,
  assetType: AssetType,
): Promise<Quote> {
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
    };
  });
}

export async function getQuotes(
  items: { symbol: string; assetType: AssetType }[],
): Promise<Quote[]> {
  const results = await Promise.allSettled(
    items.map((i) => getQuote(i.symbol, i.assetType)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
    .map((r) => r.value);
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

export async function getDailyCandles(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
): Promise<OhlcvBar[]> {
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
    return mapCandles(raw);
  });
}

export async function getMonthlyCandles(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
): Promise<OhlcvBar[]> {
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
}

interface SearchHit {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export async function searchSymbols(
  q: string,
  assetType: AssetType,
): Promise<SearchResult[]> {
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
      ];
    }
    const data = await finnhubFetch<{ count: number; result: SearchHit[] }>(
      "/search",
      { q: query },
    );
    return (data.result ?? [])
      .filter((r) => r.type === "Common Stock" || r.symbol.includes("."))
      .slice(0, 20)
      .map((r) => ({
        symbol: r.symbol.split(".")[0],
        displaySymbol: r.displaySymbol,
        description: r.description,
        assetType: "stock" as const,
        type: r.type,
      }));
  });
}

export interface CompanyNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export async function getCompanyNews(
  symbol: string,
  from: string,
  to: string,
): Promise<CompanyNewsItem[]> {
  const key = `fh:news:${symbol}:${from}:${to}`;
  return cachedFetch(key, 300_000, async () => {
    return finnhubFetch<CompanyNewsItem[]>("/company-news", {
      symbol,
      from,
      to,
    });
  });
}

export async function getMarketNews(
  category: "general" | "crypto" = "general",
): Promise<CompanyNewsItem[]> {
  const key = `fh:market-news:${category}`;
  return cachedFetch(key, 180_000, async () => {
    return finnhubFetch<CompanyNewsItem[]>("/news", { category });
  });
}

export interface EarningsItem {
  actual: number | null;
  estimate: number | null;
  period: string;
  quarter: number;
  symbol: string;
  year: number;
  surprise?: number | null;
  surprisePercent?: number | null;
}

export async function getEarnings(symbol: string): Promise<EarningsItem[]> {
  const key = `fh:earnings:${symbol}`;
  return cachedFetch(key, 600_000, async () => {
    return finnhubFetch<EarningsItem[]>("/stock/earnings", {
      symbol,
      limit: 12,
    });
  });
}

export interface PressReleaseItem {
  datetime: string;
  description?: string;
  headline?: string;
  symbol?: string;
  url?: string;
}

export async function getPressReleases(
  symbol: string,
): Promise<PressReleaseItem[]> {
  const key = `fh:press:${symbol}`;
  return cachedFetch(key, 600_000, async () => {
    try {
      const data = await finnhubFetch<{
        majorDevelopment?: PressReleaseItem[];
      }>("/press-releases", { symbol });
      return data.majorDevelopment ?? [];
    } catch (err) {
      if (err instanceof FinnhubError && err.status === 403) {
        return [];
      }
      throw err;
    }
  });
}
