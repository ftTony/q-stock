import { cachedFetch } from "@/lib/cache";
import { FinnhubError, finnhubFetch } from "@/lib/market/providers/finnhub";

export { FinnhubError };

/** @deprecated Prefer `@/lib/market` — kept for transitional imports */
export {
  getQuote,
  getQuotes,
  getDailyCandles,
  getMonthlyCandles,
  searchSymbols,
} from "@/lib/market";

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
    const data = await finnhubFetch<EarningsItem[]>("/stock/earnings", {
      symbol,
      limit: 16,
    });
    return Array.isArray(data) ? data : [];
  });
}

export interface EarningsCalendarItem {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}

export async function getEarningsCalendar(
  symbol: string,
  from: string,
  to: string,
): Promise<EarningsCalendarItem[]> {
  const key = `fh:earnings-cal:${symbol}:${from}:${to}`;
  return cachedFetch(key, 600_000, async () => {
    const data = await finnhubFetch<{
      earningsCalendar?: EarningsCalendarItem[];
    }>("/calendar/earnings", {
      symbol,
      from,
      to,
      international: "false",
    });
    return data.earningsCalendar ?? [];
  });
}

export interface BasicFinancialsMetric {
  [key: string]: number | null | undefined;
}

export interface BasicFinancials {
  metric: BasicFinancialsMetric;
  metricType?: string;
  series?: unknown;
  symbol?: string;
}

export const BASIC_METRIC_KEYS = [
  "peNormalizedAnnual",
  "peTTM",
  "pbAnnual",
  "psTTM",
  "epsAnnual",
  "epsTTM",
  "roeTTM",
  "roaTTM",
  "grossMarginTTM",
  "operatingMarginTTM",
  "netProfitMarginTTM",
  "revenuePerShareTTM",
  "dividendYieldIndicatedAnnual",
  "52WeekHigh",
  "52WeekLow",
  "beta",
  "marketCapitalization",
] as const;

export async function getBasicFinancials(
  symbol: string,
): Promise<BasicFinancials | null> {
  const key = `fh:basic-fin:${symbol}`;
  return cachedFetch(key, 600_000, async () => {
    try {
      const data = await finnhubFetch<BasicFinancials>("/stock/metric", {
        symbol,
        metric: "all",
      });
      return data?.metric ? data : null;
    } catch (err) {
      if (err instanceof FinnhubError && (err.status === 403 || err.status === 404)) {
        return null;
      }
      throw err;
    }
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
