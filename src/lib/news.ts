import { cachedFetch } from "@/lib/cache";
import {
  getLongbridgeNews,
  type LongbridgeNewsItem,
} from "@/lib/market/providers/longbridge";
import {
  getCompanyNews,
  getMarketNews,
  type CompanyNewsItem,
} from "@/lib/finnhub/client";
import type { AssetType } from "@/lib/types";
import { toFinnhubSymbol } from "@/lib/types";
import { format, subDays } from "date-fns";

export type NewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
  related?: string;
  image?: string;
  category?: string;
};

function mapLbNews(items: LongbridgeNewsItem[]): NewsItem[] {
  return items.map((n) => ({
    headline: n.headline,
    summary: n.summary,
    url: n.url,
    datetime: n.datetime,
    source: n.source,
  }));
}

function mapFhNews(items: CompanyNewsItem[]): NewsItem[] {
  return items.map((n) => ({
    headline: n.headline ?? "",
    summary: n.summary,
    url: n.url,
    datetime: n.datetime,
    source: n.source,
    related: n.related,
    image: n.image,
    category: n.category,
  }));
}

/**
 * Company news: Longbridge first for stock/hk; Finnhub fallback (esp. US).
 */
export async function getSymbolNews(
  symbol: string,
  assetType: AssetType,
): Promise<{ news: NewsItem[]; source: string | null; degraded: boolean }> {
  const sym = symbol.toUpperCase();

  if (assetType === "stock" || assetType === "hk") {
    try {
      const lb = await getLongbridgeNews(sym, assetType);
      if (lb.length > 0) {
        return { news: mapLbNews(lb), source: "longbridge", degraded: false };
      }
    } catch (err) {
      console.warn(
        "[news] longbridge failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (assetType === "crypto") {
    const market = await getMarketNews("crypto");
    const filtered = market.filter(
      (n) =>
        n.headline?.toUpperCase().includes(sym) ||
        n.related?.toUpperCase().includes(sym),
    );
    const list = filtered.length ? filtered : market.slice(0, 20);
    return {
      news: mapFhNews(list as CompanyNewsItem[]),
      source: "finnhub",
      degraded: list.length === 0,
    };
  }

  try {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const fhSym =
      assetType === "hk" ? toFinnhubSymbol(sym, "hk") : sym;
    const fh = await getCompanyNews(fhSym, from, to);
    const mapped = mapFhNews(fh);
    return {
      news: mapped,
      source: mapped.length ? "finnhub" : null,
      degraded: mapped.length === 0,
    };
  } catch (err) {
    console.warn(
      "[news] finnhub failed:",
      err instanceof Error ? err.message : err,
    );
    return { news: [], source: null, degraded: true };
  }
}
