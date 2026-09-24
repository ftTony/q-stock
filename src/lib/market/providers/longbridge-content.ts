import { cachedFetch } from "@/lib/cache";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";
import {
  getContentCtx,
  getFundamentalCtx,
  getQuoteCtx,
  hasLongbridgeCreds,
  lbLanguage,
  strOrUndef,
} from "@/lib/market/providers/longbridge-client";

export type LongbridgePressItem = {
  headline: string;
  datetime: string;
  url?: string;
  description?: string;
  source: "longbridge";
};

/** Regulatory filings / announcements via Longbridge QuoteContext.filings */
export async function getLongbridgeFilings(
  symbol: string,
  assetType: AssetType,
): Promise<LongbridgePressItem[]> {
  if (!hasLongbridgeCreds()) return [];
  if (assetType !== "stock" && assetType !== "hk") return [];

  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const key = `lb:filings:${assetType}:${normalized}`;

  return cachedFetch(key, 600_000, async () => {
    const ctx = await getQuoteCtx();
    const rows = await ctx.filings(lbSym);
    return (rows ?? []).slice(0, 40).map((f) => {
      const published = f.publishedAt;
      const datetime =
        published instanceof Date
          ? published.toISOString()
          : String(published ?? "");
      const urls = f.fileUrls ?? [];
      return {
        headline: f.title || f.fileName || "Filing",
        datetime,
        url: urls[0] || undefined,
        description: f.description || undefined,
        source: "longbridge" as const,
      };
    });
  });
}

export type LongbridgeNewsItem = {
  headline: string;
  summary?: string;
  url?: string;
  datetime: number;
  source: "longbridge";
};

/** Company news via Longbridge ContentContext.news */
export async function getLongbridgeNews(
  symbol: string,
  assetType: AssetType,
  locale?: string,
): Promise<LongbridgeNewsItem[]> {
  if (!hasLongbridgeCreds()) return [];
  if (assetType !== "stock" && assetType !== "hk") return [];

  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const lang = lbLanguage(locale);
  const key = `lb:news:${assetType}:${normalized}:${lang}`;

  return cachedFetch(key, 300_000, async () => {
    const ctx = await getContentCtx(lang);
    const rows = await ctx.news(lbSym);
    return (rows ?? []).slice(0, 40).map((n) => {
      const published = n.publishedAt;
      const datetime =
        published instanceof Date
          ? Math.floor(published.getTime() / 1000)
          : Math.floor(Date.now() / 1000);
      return {
        headline: n.title || "News",
        summary: n.description || undefined,
        url: n.url || undefined,
        datetime,
        source: "longbridge" as const,
      };
    });
  });
}

export type LongbridgeCompanyProfile = {
  name?: string;
  companyName?: string;
  ticker?: string;
  logo?: string;
  website?: string;
  category?: string;
  founded?: string;
  listingDate?: string;
  market?: string;
  region?: string;
  address?: string;
  employees?: string;
  chairman?: string;
  manager?: string;
  secretary?: string;
  brief?: string;
};

export type LongbridgeOfficer = {
  name?: string;
  nameZhcn?: string;
  nameEn?: string;
  title?: string;
  bio?: string;
  photo?: string;
  wikiUrl?: string;
};

function toPlainCompany(c: unknown): LongbridgeCompanyProfile {
  const o = (c ?? {}) as Record<string, unknown>;
  return {
    name: strOrUndef(o.name),
    companyName: strOrUndef(o.companyName),
    ticker: strOrUndef(o.ticker),
    logo: strOrUndef(o.icon),
    website: strOrUndef(o.website),
    category: strOrUndef(o.category),
    founded: strOrUndef(o.founded),
    listingDate: strOrUndef(o.listingDate),
    market: strOrUndef(o.market),
    region: strOrUndef(o.region),
    address: strOrUndef(o.address),
    employees: strOrUndef(o.employees),
    chairman: strOrUndef(o.chairman),
    manager: strOrUndef(o.manager),
    secretary: strOrUndef(o.secretary),
    brief: strOrUndef(o.profile),
  };
}

/** Company overview via Longbridge (US + HK). */
export async function getLongbridgeCompany(
  symbol: string,
  assetType: AssetType,
  locale?: string,
): Promise<LongbridgeCompanyProfile | null> {
  if (!hasLongbridgeCreds()) return null;
  if (assetType !== "stock" && assetType !== "hk") return null;

  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const lang = lbLanguage(locale);
  const key = `lb:company:v2:${assetType}:${normalized}:${lang}`;

  return cachedFetch(key, 86400_000, async () => {
    const fund = await getFundamentalCtx(lang);
    const data = await fund.company(lbSym);
    const profile = toPlainCompany(data);
    if (!profile.name && !profile.companyName) return null;
    return profile;
  });
}

/** Executive / board members via Longbridge (US + HK). */
export async function getLongbridgeExecutive(
  symbol: string,
  assetType: AssetType,
  locale?: string,
): Promise<LongbridgeOfficer[]> {
  if (!hasLongbridgeCreds()) return [];
  if (assetType !== "stock" && assetType !== "hk") return [];

  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const lang = lbLanguage(locale);
  const key = `lb:executive:v2:${assetType}:${normalized}:${lang}`;

  return cachedFetch(key, 86400_000, async () => {
    const fund = await getFundamentalCtx(lang);
    const data = await fund.executive(lbSym);
    const officers: LongbridgeOfficer[] = [];
    const zh = lang === 0 || lang === 1;
    for (const group of data?.professionalList ?? []) {
      for (const p of group?.professionals ?? []) {
        if (!p) continue;
        // Longbridge provides explicit zh-cn / en variants — pick by UI locale
        // (do not rely on `name`, which may ignore the SDK language setting).
        const localized = zh
          ? strOrUndef(p.nameZhcn) ?? strOrUndef(p.name)
          : strOrUndef(p.nameEn) ?? strOrUndef(p.name);
        officers.push({
          name:
            localized ?? strOrUndef(p.nameEn) ?? strOrUndef(p.nameZhcn),
          nameZhcn: strOrUndef(p.nameZhcn),
          nameEn: strOrUndef(p.nameEn),
          title: strOrUndef(p.title),
          bio: strOrUndef(p.biography),
          photo: strOrUndef(p.photo),
          wikiUrl: strOrUndef(p.wikiUrl),
        });
      }
    }
    return officers;
  });
}

export type LongbridgeEarningsBundle = {
  surprises: {
    actual: number | null;
    estimate: number | null;
    period: string;
    quarter: number;
    year: number;
    surprise?: number | null;
    surprisePercent?: number | null;
  }[];
  calendar: {
    upcoming: {
      date: string;
      epsActual: number | null;
      epsEstimate: number | null;
      hour: string;
      quarter: number;
      revenueActual: number | null;
      revenueEstimate: number | null;
      year: number;
    }[];
    recent: {
      date: string;
      epsActual: number | null;
      epsEstimate: number | null;
      hour: string;
      quarter: number;
      revenueActual: number | null;
      revenueEstimate: number | null;
      year: number;
    }[];
  };
  metrics: { key: string; value: number | null }[];
};

function numOrNull(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function latestValuation(
  metric?: { list: { value?: string }[]; median?: string; high?: string } | null,
): number | null {
  if (metric?.list?.length) {
    // Prefer newest point
    for (let i = metric.list.length - 1; i >= 0; i--) {
      const n = numOrNull(metric.list[i]?.value);
      if (n != null) return n;
    }
  }
  return numOrNull((metric as { current?: string } | null | undefined)?.current)
    ?? numOrNull(metric?.median);
}

function parseQuarter(periodText: string, fiscalPeriod: string): number {
  const m = (periodText || fiscalPeriod || "").match(/Q\s*([1-4])/i);
  if (m) return Number(m[1]);
  const fp = Number(fiscalPeriod);
  if (fp >= 1 && fp <= 4) return fp;
  if (/semi|h1|interim|saf/i.test(periodText + fiscalPeriod)) return 2;
  if (/annual|全年|年报|^af$/i.test(periodText + fiscalPeriod)) return 4;
  return 0;
}

function pickEpsDetail(
  details: {
    key: string;
    name: string;
    description: string;
    actual?: string;
    estimate?: string;
    compValue?: string;
    isReleased: boolean;
  }[],
) {
  return (
    details.find((d) => d.key === "eps") ||
    details.find((d) => d.key === "normalized_eps") ||
    details.find((d) => /eps/i.test(d.key) || /eps|每股收益/i.test(d.name))
  );
}

/** HK/US earnings: valuation + consensus from Longbridge (HK code must be 700.HK) */
export async function getLongbridgeEarnings(
  symbol: string,
  assetType: AssetType,
): Promise<LongbridgeEarningsBundle | null> {
  if (!hasLongbridgeCreds()) return null;
  if (assetType !== "stock" && assetType !== "hk") return null;

  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  // v3: also fill marketCap from staticInfo
  const key = `lb:earnings:v3:${assetType}:${normalized}`;

  return cachedFetch(key, 600_000, async () => {
    const fund = await getFundamentalCtx();
    const quoteCtx = await getQuoteCtx();

    const [valuationRes, consensusRes, staticRes, quoteRes] =
      await Promise.allSettled([
        fund.valuation(lbSym),
        fund.consensus(lbSym),
        quoteCtx.staticInfo([lbSym]),
        quoteCtx.quote([lbSym]),
      ]);

    if (valuationRes.status === "rejected") {
      console.warn("[longbridge] valuation", valuationRes.reason);
    }
    if (consensusRes.status === "rejected") {
      console.warn("[longbridge] consensus", consensusRes.reason);
    }

    const metrics: { key: string; value: number | null }[] = [];
    if (valuationRes.status === "fulfilled") {
      const m = valuationRes.value.metrics;
      const pe = latestValuation(m.pe);
      const pb = latestValuation(m.pb);
      const ps = latestValuation(m.ps);
      const dy = latestValuation(m.dvdYld);
      if (pe != null) metrics.push({ key: "peTTM", value: pe });
      if (pb != null) metrics.push({ key: "pbAnnual", value: pb });
      if (ps != null) metrics.push({ key: "psTTM", value: ps });
      if (dy != null) {
        metrics.push({ key: "dividendYieldIndicatedAnnual", value: dy });
      }
    }

    // Market cap (Finnhub convention: millions) from shares × last price
    if (
      staticRes.status === "fulfilled" &&
      quoteRes.status === "fulfilled"
    ) {
      const info = staticRes.value?.[0];
      const q = quoteRes.value?.[0];
      const shares = Number(info?.totalShares ?? 0);
      const price =
        q?.lastDone != null
          ? typeof q.lastDone.toNumber === "function"
            ? q.lastDone.toNumber()
            : Number(q.lastDone)
          : 0;
      if (shares > 0 && price > 0) {
        metrics.push({
          key: "marketCapitalization",
          value: (shares * price) / 1e6,
        });
      }
    }

    const surprises: LongbridgeEarningsBundle["surprises"] = [];
    const upcoming: LongbridgeEarningsBundle["calendar"]["upcoming"] = [];
    const recent: LongbridgeEarningsBundle["calendar"]["recent"] = [];

    if (consensusRes.status === "fulfilled") {
      for (const report of consensusRes.value.list ?? []) {
        const epsDetail = pickEpsDetail(report.details ?? []);
        if (!epsDetail) continue;
        const actual = numOrNull(epsDetail.actual);
        const estimate = numOrNull(epsDetail.estimate);
        const surprise = numOrNull(epsDetail.compValue);
        let surprisePercent: number | null = null;
        if (surprise != null && estimate != null && estimate !== 0) {
          surprisePercent = (surprise / Math.abs(estimate)) * 100;
        } else if (actual != null && estimate != null && estimate !== 0) {
          surprisePercent = ((actual - estimate) / Math.abs(estimate)) * 100;
        }
        const quarter = parseQuarter(
          report.periodText,
          String(report.fiscalPeriod ?? ""),
        );
        const period = report.periodText || `${report.fiscalYear} Q${quarter}`;
        const row = {
          actual,
          estimate,
          period,
          quarter,
          year: report.fiscalYear,
          surprise:
            surprise ??
            (actual != null && estimate != null ? actual - estimate : null),
          surprisePercent,
        };

        if (epsDetail.isReleased && (actual != null || estimate != null)) {
          surprises.push(row);
          recent.push({
            date: `${report.fiscalYear}-Q${quarter || 1}`,
            epsActual: actual,
            epsEstimate: estimate,
            hour: "",
            quarter,
            revenueActual: null,
            revenueEstimate: null,
            year: report.fiscalYear,
          });
        } else if (!epsDetail.isReleased && estimate != null) {
          upcoming.push({
            date: `${report.fiscalYear}-Q${quarter || 1}`,
            epsActual: null,
            epsEstimate: estimate,
            hour: "",
            quarter,
            revenueActual: null,
            revenueEstimate: null,
            year: report.fiscalYear,
          });
        }
      }
    }

    // Chronological: surprises oldest→newest for charts (API often returns newest first)
    surprises.reverse();
    upcoming.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.quarter - b.quarter,
    );
    recent.sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.quarter - a.quarter,
    );

    if (!metrics.length && !surprises.length && !upcoming.length && !recent.length) {
      return null;
    }

    return {
      surprises: surprises.slice(-16),
      calendar: {
        upcoming: upcoming.slice(0, 8),
        recent: recent.slice(0, 8),
      },
      metrics,
    };
  });
}
