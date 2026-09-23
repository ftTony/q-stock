import { format, subDays, subMonths, addMonths } from "date-fns";
import {
  AiError,
  generateTrendObject,
  isAiConfigured,
} from "@/lib/ai/client";
import {
  BASIC_METRIC_KEYS,
  getBasicFinancials,
  getCompanyNews,
  getEarnings,
  getEarningsCalendar,
  getMarketNews,
} from "@/lib/finnhub/client";
import { getQuote } from "@/lib/market";
import type { AssetType } from "@/lib/types";
import { isUsEquity, toFinnhubSymbol } from "@/lib/types";

export type TrendBias = "bullish" | "neutral" | "bearish";
export type TrendHorizon = "short" | "medium";

export interface TrendAnalysis {
  bias: TrendBias;
  confidence: number;
  horizon: TrendHorizon;
  summary: string;
  drivers: string[];
  risks: string[];
  sourcesUsed: {
    news: number;
    earnings: number;
    metrics: number;
    hasQuote: boolean;
  };
}

export interface AnalyzeTrendResult {
  available: boolean;
  message?: string;
  analysis?: TrendAnalysis;
  degraded: boolean;
  disclaimer: string;
}

const DISCLAIMERS: Record<string, string> = {
  "zh-CN":
    "本分析由 AI 根据公开新闻与财报自动生成，仅供参考，不构成投资建议。",
  "zh-TW":
    "本分析由 AI 根據公開新聞與財報自動生成，僅供參考，不構成投資建議。",
  en: "This analysis is AI-generated from public news and earnings. For reference only; not investment advice.",
};

function disclaimerFor(locale: string): string {
  return DISCLAIMERS[locale] ?? DISCLAIMERS.en;
}

function langLabel(locale: string): string {
  if (locale === "zh-TW") return "Traditional Chinese (zh-TW)";
  if (locale === "zh-CN") return "Simplified Chinese (zh-CN)";
  return "English";
}

function truncate(s: string | undefined, max: number): string {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function notConfiguredMessage(locale: string): string {
  if (locale === "zh-TW") return "未配置 DEEPSEEK_API_KEY，無法生成 AI 分析";
  if (locale === "en") return "DEEPSEEK_API_KEY is not configured";
  return "未配置 DEEPSEEK_API_KEY，无法生成 AI 分析";
}

export async function analyzeTrend(opts: {
  symbol: string;
  assetType: AssetType;
  locale?: string;
}): Promise<AnalyzeTrendResult> {
  const symbol = opts.symbol.toUpperCase();
  const assetType = opts.assetType;
  const locale = opts.locale || "zh-CN";
  const disclaimer = disclaimerFor(locale);

  if (!isAiConfigured()) {
    return {
      available: false,
      message: notConfiguredMessage(locale),
      degraded: false,
      disclaimer,
    };
  }

  let degraded = false;

  const newsPromise =
    assetType === "crypto"
      ? getMarketNews("crypto").then((all) => {
          const filtered = all.filter(
            (n) =>
              n.headline?.toUpperCase().includes(symbol) ||
              n.related?.toUpperCase().includes(symbol),
          );
          return (filtered.length ? filtered : all).slice(0, 12);
        })
      : (() => {
          const to = format(new Date(), "yyyy-MM-dd");
          const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
          const fhSym =
            assetType === "hk" ? toFinnhubSymbol(symbol, "hk") : symbol;
          return getCompanyNews(fhSym, from, to).then((n) => n.slice(0, 12));
        })();

  const today = new Date();
  const calFrom = format(subMonths(today, 3), "yyyy-MM-dd");
  const calTo = format(addMonths(today, 9), "yyyy-MM-dd");
  const usEquity = isUsEquity(assetType);

  const [newsRes, quoteRes, earningsRes, calendarRes, metricsRes] =
    await Promise.allSettled([
      newsPromise,
      getQuote(symbol, assetType),
      usEquity ? getEarnings(symbol) : Promise.resolve([]),
      usEquity
        ? getEarningsCalendar(symbol, calFrom, calTo)
        : Promise.resolve([]),
      usEquity ? getBasicFinancials(symbol) : Promise.resolve(null),
    ]);

  if (newsRes.status === "rejected") degraded = true;
  if (quoteRes.status === "rejected") degraded = true;
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
    earningsRes.status === "fulfilled" ? earningsRes.value.slice(0, 8) : [];
  const calendar =
    calendarRes.status === "fulfilled" ? calendarRes.value : [];
  const basic = metricsRes.status === "fulfilled" ? metricsRes.value : null;

  const upcoming = calendar
    .filter((c) => c.date >= format(today, "yyyy-MM-dd"))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const recentCal = calendar
    .filter((c) => c.date < format(today, "yyyy-MM-dd"))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const metric = basic?.metric ?? {};
  const metrics = BASIC_METRIC_KEYS.map((key) => ({
    key,
    value: typeof metric[key] === "number" ? metric[key] : null,
  })).filter((m) => m.value !== null && m.value !== undefined);

  const newsPayload = news.map((n) => ({
    date: n.datetime
      ? new Date(n.datetime * 1000).toISOString().slice(0, 10)
      : undefined,
    headline: truncate(n.headline, 160),
    summary: truncate(n.summary, 220),
    source: n.source,
  }));

  const sourcesUsed: TrendAnalysis["sourcesUsed"] = {
    news: newsPayload.length,
    earnings: surprises.length + upcoming.length + recentCal.length,
    metrics: metrics.length,
    hasQuote: Boolean(quote),
  };

  const context = {
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
        }
      : null,
    news: newsPayload,
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
      revenueEstimate: c.revenueEstimate,
      hour: c.hour,
    })),
    earningsRecent: recentCal.map((c) => ({
      date: c.date,
      quarter: c.quarter,
      year: c.year,
      epsActual: c.epsActual,
      epsEstimate: c.epsEstimate,
      revenueActual: c.revenueActual,
    })),
    metrics: metrics.slice(0, 12),
  };

  const system = `You are a cautious equity/crypto market analyst. Analyze near-term price trend using ONLY the provided news, earnings, and quote data.
Do not invent facts not supported by the data. If data is sparse, lower confidence and prefer "neutral".
Write summary, drivers, and risks in ${langLabel(locale)}.`;

  const user = `Analyze trend for ${symbol} (${assetType}). Return structured JSON fields (bias, confidence, horizon, summary, drivers, risks).\n\nDATA:\n${JSON.stringify(context)}`;

  try {
    const object = await generateTrendObject({ system, user });
    const analysis: TrendAnalysis = {
      bias: object.bias,
      confidence: Math.max(0, Math.min(1, object.confidence)),
      horizon: object.horizon,
      summary: truncate(object.summary, 800) || "—",
      drivers: object.drivers.filter(Boolean).slice(0, 8),
      risks: object.risks.filter(Boolean).slice(0, 8),
      sourcesUsed,
    };
    return {
      available: true,
      analysis,
      degraded,
      disclaimer,
    };
  } catch (err) {
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "AI analysis failed";
    return {
      available: false,
      message: msg,
      degraded: true,
      disclaimer,
    };
  }
}
