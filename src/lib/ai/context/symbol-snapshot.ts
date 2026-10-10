import { format, subDays, subMonths, addMonths } from "date-fns";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getCompanyNews,
  getEarnings,
  getEarningsCalendar,
  getMarketNews,
} from "@/lib/finnhub/client";
import { getQuote } from "@/lib/market";
import {
  fetchCandleFeatures,
  type CandleFeatures,
} from "@/lib/ai/context/candle-features";
import type { AssetType } from "@/lib/types";
import { isUsEquity, toFinnhubSymbol } from "@/lib/types";

function truncate(s: string | undefined, max: number): string {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export type SymbolSnapshot = {
  symbol: string;
  assetType: AssetType;
  quote: {
    price: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    previousClose: number;
    timestamp: number;
  } | null;
  candles: CandleFeatures | null;
  news: Array<{
    date?: string;
    headline: string;
    summary: string;
    source?: string;
  }>;
  earningsSurprises: Array<{
    period?: string;
    year?: number;
    quarter?: number;
    actual?: number | null;
    estimate?: number | null;
    surprisePercent?: number | null;
  }>;
  earningsUpcoming: Array<{
    date: string;
    quarter?: number;
    year?: number;
    epsEstimate?: number | null;
  }>;
  metrics: Array<{ key: string; value: number }>;
  sources: {
    news: number;
    earnings: number;
    metrics: number;
    hasQuote: boolean;
    candleBars: number;
  };
  degraded: boolean;
};

export async function buildSymbolSnapshot(opts: {
  symbol: string;
  assetType: AssetType;
  includeCandles?: boolean;
  newsLimit?: number;
}): Promise<SymbolSnapshot> {
  const symbol = opts.symbol.toUpperCase();
  const assetType = opts.assetType;
  const newsLimit = opts.newsLimit ?? 10;
  let degraded = false;

  const newsPromise =
    assetType === "crypto"
      ? getMarketNews("crypto").then((all) => {
          const filtered = all.filter(
            (n) =>
              n.headline?.toUpperCase().includes(symbol) ||
              n.related?.toUpperCase().includes(symbol),
          );
          return (filtered.length ? filtered : all).slice(0, newsLimit);
        })
      : (() => {
          const to = format(new Date(), "yyyy-MM-dd");
          const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
          const fhSym =
            assetType === "hk" ? toFinnhubSymbol(symbol, "hk") : symbol;
          return getCompanyNews(fhSym, from, to).then((n) =>
            n.slice(0, newsLimit),
          );
        })();

  const today = new Date();
  const calFrom = format(subMonths(today, 3), "yyyy-MM-dd");
  const calTo = format(addMonths(today, 9), "yyyy-MM-dd");
  const usEquity = isUsEquity(assetType);

  const [newsRes, quoteRes, earningsRes, calendarRes, metricsRes, candleRes] =
    await Promise.allSettled([
      newsPromise,
      getQuote(symbol, assetType),
      usEquity ? getEarnings(symbol) : Promise.resolve([]),
      usEquity
        ? getEarningsCalendar(symbol, calFrom, calTo)
        : Promise.resolve([]),
      usEquity ? getBasicFinancials(symbol) : Promise.resolve(null),
      opts.includeCandles !== false
        ? fetchCandleFeatures({ symbol, assetType })
        : Promise.resolve(null),
    ]);

  if (newsRes.status === "rejected") degraded = true;
  if (quoteRes.status === "rejected") degraded = true;
  if (candleRes.status === "rejected") degraded = true;
  if (
    usEquity &&
    earningsRes.status === "rejected" &&
    calendarRes.status === "rejected" &&
    metricsRes.status === "rejected"
  ) {
    degraded = true;
  }

  const news = newsRes.status === "fulfilled" ? newsRes.value : [];
  const quote = quoteRes.status === "fulfilled" ? quoteRes.value : null;
  const surprises =
    earningsRes.status === "fulfilled" ? earningsRes.value.slice(0, 6) : [];
  const calendar =
    calendarRes.status === "fulfilled" ? calendarRes.value : [];
  const basic = metricsRes.status === "fulfilled" ? metricsRes.value : null;
  const candles =
    candleRes.status === "fulfilled" ? candleRes.value : null;

  const todayStr = format(today, "yyyy-MM-dd");
  const upcoming = calendar
    .filter((c) => c.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const metric = basic?.metric ?? {};
  const metrics: Array<{ key: string; value: number }> = [];
  for (const key of BASIC_METRIC_KEYS) {
    const value = metric[key];
    if (typeof value === "number") metrics.push({ key, value });
  }

  return {
    symbol,
    assetType,
    quote: quote
      ? {
          price: quote.price,
          change: quote.change,
          percentChange: quote.percentChange,
          high: quote.high,
          low: quote.low,
          previousClose: quote.previousClose,
          timestamp: quote.timestamp,
        }
      : null,
    candles,
    news: news.map((n) => ({
      date: n.datetime
        ? new Date(n.datetime * 1000).toISOString().slice(0, 10)
        : undefined,
      headline: truncate(n.headline, 140),
      summary: truncate(n.summary, 180),
      source: n.source,
    })),
    earningsSurprises: surprises.map((e) => ({
      period: e.period,
      year: e.year,
      quarter: e.quarter,
      actual: e.actual,
      estimate: e.estimate,
      surprisePercent: e.surprisePercent,
    })),
    earningsUpcoming: upcoming.map((c) => ({
      date: c.date,
      quarter: c.quarter,
      year: c.year,
      epsEstimate: c.epsEstimate,
    })),
    metrics: metrics.slice(0, 10),
    sources: {
      news: news.length,
      earnings: surprises.length + upcoming.length,
      metrics: metrics.length,
      hasQuote: Boolean(quote),
      candleBars: candles?.barCount ?? 0,
    },
    degraded,
  };
}
