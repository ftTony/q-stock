import { analyzeTrend } from "@/lib/ai/analyze-trend";
import {
  getMarketSentiment,
  getSymbolSentiment,
  type SentimentSnapshot,
} from "@/lib/adanos/client";
import { cachedFetch } from "@/lib/cache";
import { getQuotes } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import type { AssetType } from "@/lib/types";

const AI_TTL_MS = 6 * 60 * 60_000;

export type DigestLocale = "zh-CN" | "zh-TW" | "en";

export type DigestRow = {
  symbol: string;
  assetType: AssetType;
  price: number | null;
  percentChange: number | null;
  sentiment: string;
  aiAdvice: string;
};

export type WatchlistDigestPayload = {
  tradeDate: string;
  locale: DigestLocale;
  marketSentiment: string;
  rows: DigestRow[];
};

/** Map DB `LocaleCode` / similar strings to digest UI locale. */
export function localeFromUser(code: string): DigestLocale {
  if (code === "zh_TW" || code === "zh-TW") return "zh-TW";
  if (code === "en") return "en";
  return "zh-CN";
}

function formatSentiment(s?: SentimentSnapshot): string {
  if (!s?.available) return "—";
  const parts: string[] = [];
  if (typeof s.sentiment_score === "number") {
    parts.push(`score ${s.sentiment_score.toFixed(2)}`);
  }
  if (typeof s.bullish_pct === "number") {
    parts.push(`bull ${s.bullish_pct.toFixed(0)}%`);
  }
  if (s.trend) parts.push(String(s.trend));
  return parts.length ? parts.join(" · ") : "—";
}

function pickSymbolSentiment(bundle: {
  news?: SentimentSnapshot;
  reddit?: SentimentSnapshot;
}): SentimentSnapshot | undefined {
  if (bundle.news?.available) return bundle.news;
  if (bundle.reddit?.available) return bundle.reddit;
  return bundle.news ?? bundle.reddit;
}

function formatAiAdvice(
  result: Awaited<ReturnType<typeof analyzeTrend>>,
): string {
  if (!result.available || !result.analysis) {
    return result.message?.slice(0, 120) || "—";
  }
  const a = result.analysis;
  const bias =
    a.bias === "bullish" ? "↑" : a.bias === "bearish" ? "↓" : "→";
  const conf = Math.round(a.confidence * 100);
  const summary = a.summary.replace(/\s+/g, " ").trim().slice(0, 160);
  return `${bias} ${a.bias} (${conf}%) ${summary}`;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    for (;;) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]!);
    }
  }
  const n = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

export async function gatherWatchlistDigest(opts: {
  userId: string;
  locale: string;
  tradeDate: string;
  items: Array<{ symbol: string; assetType: AssetType }>;
  aiMax?: number;
}): Promise<WatchlistDigestPayload> {
  const locale = localeFromUser(opts.locale);
  const aiMax = opts.aiMax ?? Number(process.env.WATCHLIST_DIGEST_AI_MAX || 8);

  return withUserMarket(opts.userId, async () => {
    const quotes = await getQuotes(
      opts.items.map((i) => ({
        symbol: i.symbol,
        assetType: i.assetType,
      })),
    ).catch(() => []);
    const quoteMap = new Map(
      quotes.map((q) => [`${q.assetType}:${q.symbol}`, q]),
    );

    let marketSentiment = "—";
    try {
      const market = await getMarketSentiment("stock");
      marketSentiment = formatSentiment(market);
    } catch {
      marketSentiment = "—";
    }

    const withAi = opts.items.slice(0, Math.max(0, aiMax));
    const aiKeys = new Set(
      withAi.map((i) => `${i.assetType}:${i.symbol.toUpperCase()}`),
    );

    const sentiments = await mapPool(opts.items, 3, async (item) => {
      try {
        const bundle = await getSymbolSentiment(item.symbol, item.assetType);
        return formatSentiment(pickSymbolSentiment(bundle));
      } catch {
        return "—";
      }
    });

    const aiAdvice = await mapPool(opts.items, 1, async (item) => {
      const key = `${item.assetType}:${item.symbol.toUpperCase()}`;
      if (!aiKeys.has(key)) return "—";
      const cacheKey = `ai:trend:digest:${opts.userId}:${item.assetType}:${item.symbol.toUpperCase()}:${locale}:${opts.tradeDate}`;
      try {
        const result = await cachedFetch(cacheKey, AI_TTL_MS, () =>
          analyzeTrend({
            symbol: item.symbol,
            assetType: item.assetType,
            locale,
            userId: opts.userId,
          }),
        );
        return formatAiAdvice(result);
      } catch {
        return "—";
      }
    });

    const rows: DigestRow[] = opts.items.map((item, idx) => {
      const q = quoteMap.get(`${item.assetType}:${item.symbol}`);
      return {
        symbol: item.symbol,
        assetType: item.assetType,
        price: q && Number.isFinite(q.price) ? q.price : null,
        percentChange:
          q && Number.isFinite(q.percentChange) ? q.percentChange : null,
        sentiment: sentiments[idx] ?? "—",
        aiAdvice: aiAdvice[idx] ?? "—",
      };
    });

    return {
      tradeDate: opts.tradeDate,
      locale,
      marketSentiment,
      rows,
    };
  });
}
