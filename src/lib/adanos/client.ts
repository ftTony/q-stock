import { cachedFetch } from "@/lib/cache";
import type { AssetType } from "@/lib/types";

const BASE = "https://api.adanos.org";

export class AdanosError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AdanosError";
  }
}

export interface SentimentSnapshot {
  buzz_score?: number;
  sentiment_score?: number;
  bullish_pct?: number;
  bearish_pct?: number;
  trend?: string | null;
  mentions?: number;
  drivers?: Array<{
    ticker?: string;
    symbol?: string;
    mentions?: number;
    buzz_score?: number;
    sentiment_score?: number;
  }>;
  source: string;
  available: boolean;
  message?: string;
}

async function adanosFetch<T>(path: string): Promise<T> {
  const key = process.env.ADANOS_API_KEY;
  if (!key) {
    throw new AdanosError("ADANOS_API_KEY is not configured");
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-API-Key": key },
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 429) {
    throw new AdanosError("Adanos rate limited", 429);
  }
  if (res.status === 401 || res.status === 403) {
    throw new AdanosError("Adanos unauthorized or plan limit", res.status);
  }
  if (!res.ok) {
    throw new AdanosError(`Adanos HTTP ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

function emptySentiment(source: string, message: string): SentimentSnapshot {
  return {
    available: false,
    source,
    message,
  };
}

export async function getSymbolSentiment(
  symbol: string,
  assetType: AssetType,
): Promise<{ news?: SentimentSnapshot; reddit?: SentimentSnapshot }> {
  const sym = symbol.toUpperCase();
  const cacheKey = `adanos:sentiment:${assetType}:${sym}`;

  return cachedFetch(cacheKey, 30 * 60_000, async () => {
    if (assetType === "hk") {
      return {
        news: emptySentiment("hk", "HK sentiment not available via Adanos"),
      };
    }
    if (assetType === "crypto") {
      try {
        const data = await adanosFetch<SentimentSnapshot>(
          `/reddit/crypto/v1/token/${encodeURIComponent(sym)}`,
        );
        return {
          reddit: { ...data, available: true, source: "reddit-crypto" },
        };
      } catch (err) {
        const msg =
          err instanceof AdanosError ? err.message : "Sentiment unavailable";
        return { reddit: emptySentiment("reddit-crypto", msg) };
      }
    }

    const [newsRes, redditRes] = await Promise.allSettled([
      adanosFetch<SentimentSnapshot>(
        `/news/stocks/v1/stock/${encodeURIComponent(sym)}`,
      ),
      adanosFetch<SentimentSnapshot>(
        `/reddit/stocks/v1/stock/${encodeURIComponent(sym)}`,
      ),
    ]);

    return {
      news:
        newsRes.status === "fulfilled"
          ? { ...newsRes.value, available: true, source: "news-stocks" }
          : emptySentiment(
              "news-stocks",
              newsRes.reason instanceof Error
                ? newsRes.reason.message
                : "unavailable",
            ),
      reddit:
        redditRes.status === "fulfilled"
          ? { ...redditRes.value, available: true, source: "reddit-stocks" }
          : emptySentiment(
              "reddit-stocks",
              redditRes.reason instanceof Error
                ? redditRes.reason.message
                : "unavailable",
            ),
    };
  });
}

export async function getMarketSentiment(
  assetType: AssetType,
): Promise<SentimentSnapshot> {
  const cacheKey = `adanos:market:${assetType}`;
  return cachedFetch(cacheKey, 30 * 60_000, async () => {
    if (assetType === "hk") {
      return emptySentiment("hk", "HK market sentiment not available via Adanos");
    }
    try {
      const path =
        assetType === "crypto"
          ? "/reddit/crypto/v1/market-sentiment"
          : "/news/stocks/v1/market-sentiment";
      const data = await adanosFetch<SentimentSnapshot>(path);
      return {
        ...data,
        available: true,
        source: assetType === "crypto" ? "reddit-crypto" : "news-stocks",
      };
    } catch (err) {
      return emptySentiment(
        assetType === "crypto" ? "reddit-crypto" : "news-stocks",
        err instanceof Error ? err.message : "unavailable",
      );
    }
  });
}
