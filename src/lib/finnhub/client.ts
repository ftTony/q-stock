import { cachedFetch } from "@/lib/cache";
import { FinnhubError } from "@/lib/market/providers/finnhub";
import { finnhubFetch } from "@/lib/market/providers/finnhub";

export { FinnhubError };

/** @deprecated Prefer `@/lib/market` — kept for transitional imports */
export {
  getQuote,
  getQuotes,
  getDailyCandles,
  getMonthlyCandles,
  searchSymbols,
} from "@/lib/market";

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

export interface BasicFinancials {
  metric: Record<string, number | null | undefined>;
  metricType?: string;
  series?: unknown;
  symbol?: string;
}

export async function getEarnings(symbol: string): Promise<EarningsItem[]> {
  return cachedFetch(`fh:earnings:${symbol}`, 600_000, async () => {
    const data = await finnhubFetch<EarningsItem[]>("/stock/earnings", {
      symbol,
      limit: 16,
    });
    return Array.isArray(data) ? data : [];
  });
}

export async function getEarningsCalendar(
  symbol: string,
  from: string,
  to: string,
): Promise<EarningsCalendarItem[]> {
  return cachedFetch(`fh:earnings-cal:${symbol}:${from}:${to}`, 600_000, async () => {
    const data = await finnhubFetch<{ earningsCalendar?: EarningsCalendarItem[] }>(
      "/calendar/earnings",
      { symbol, from, to, international: "false" },
    );
    return data.earningsCalendar ?? [];
  });
}

export async function getBasicFinancials(
  symbol: string,
): Promise<BasicFinancials | null> {
  return cachedFetch(`fh:basic-fin:${symbol}`, 600_000, async () => {
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
  return cachedFetch(`fh:news:${symbol}:${from}:${to}`, 300_000, () =>
    finnhubFetch<CompanyNewsItem[]>("/company-news", { symbol, from, to }),
  );
}

export async function getMarketNews(
  category: "general" | "crypto" = "general",
): Promise<CompanyNewsItem[]> {
  return cachedFetch(`fh:market-news:${category}`, 180_000, () =>
    finnhubFetch<CompanyNewsItem[]>("/news", { category }),
  );
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
  return cachedFetch(`fh:press:${symbol}`, 600_000, async () => {
    try {
      const data = await finnhubFetch<{ majorDevelopment?: PressReleaseItem[] }>(
        "/press-releases",
        { symbol },
      );
      return data.majorDevelopment ?? [];
    } catch (err) {
      if (err instanceof FinnhubError && err.status === 403) return [];
      throw err;
    }
  });
}
