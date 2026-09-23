import { cachedFetch } from "@/lib/cache";
import { toLongbridgeSymbol, normalizeSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

type LbModule = typeof import("longbridge");

let lbPromise: Promise<LbModule> | null = null;
let quoteCtx: InstanceType<LbModule["QuoteContext"]> | null = null;

function hasLongbridgeCreds(): boolean {
  return Boolean(
    process.env.LONGBRIDGE_APP_KEY &&
      process.env.LONGBRIDGE_APP_SECRET &&
      process.env.LONGBRIDGE_ACCESS_TOKEN,
  );
}

async function loadLb(): Promise<LbModule> {
  if (!lbPromise) {
    lbPromise = import("longbridge");
  }
  return lbPromise;
}

async function getCtx(): Promise<InstanceType<LbModule["QuoteContext"]>> {
  if (quoteCtx) return quoteCtx;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
  );
  quoteCtx = lb.QuoteContext.new(config);
  return quoteCtx;
}

function dec(v: { toNumber(): number } | null | undefined): number {
  if (v == null) return 0;
  try {
    return v.toNumber();
  } catch {
    return Number(String(v)) || 0;
  }
}

function unixToNaiveDate(
  lb: LbModule,
  unixSec: number,
): InstanceType<LbModule["NaiveDate"]> {
  const d = new Date(unixSec * 1000);
  return new lb.NaiveDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

function mapLbCandles(
  sticks: {
    timestamp: { getTime(): number };
    open: { toNumber(): number } | null;
    high: { toNumber(): number } | null;
    low: { toNumber(): number } | null;
    close: { toNumber(): number } | null;
    volume?: number | null;
  }[],
  from: number,
  to: number,
): OhlcvBar[] {
  return sticks
    .map((c) => ({
      time: Math.floor(c.timestamp.getTime() / 1000),
      open: dec(c.open),
      high: dec(c.high),
      low: dec(c.low),
      close: dec(c.close),
      volume: c.volume ?? 0,
    }))
    .filter((b) => b.time >= from && b.time <= to)
    .sort((a, b) => a.time - b.time);
}

async function fetchLbHistoryBars(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  period: number,
): Promise<OhlcvBar[]> {
  if (assetType === "crypto") {
    throw new MarketDataError("Longbridge crypto candles unsupported", "longbridge");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const lbSym = toLongbridgeSymbol(normalized, assetType);
  const lb = await loadLb();
  const ctx = await getCtx();
  const start = unixToNaiveDate(lb, from);
  const end = unixToNaiveDate(lb, to);

  try {
    const sticks = await ctx.historyCandlesticksByDate(
      lbSym,
      period,
      0, // AdjustType.NoAdjust
      start,
      end,
      0, // TradeSessions.Intraday
    );
    const bars = mapLbCandles(sticks, from, to);
    if (bars.length) return bars;
  } catch (err) {
    console.warn(
      "[longbridge] historyCandlesticksByDate failed, fallback to candlesticks:",
      err instanceof Error ? err.message : err,
    );
  }

  // Fallback: latest-N window (works near "now", not deep history)
  const daySpan = Math.max(1, Math.ceil((to - from) / 86400));
  const count = Math.min(1000, daySpan + 5);
  const sticks = await ctx.candlesticks(lbSym, period, count, 0, 0);
  const bars = mapLbCandles(sticks, from, to);
  if (!bars.length) {
    throw new MarketDataError(
      `Longbridge has no candles for ${lbSym} in ${from}-${to}`,
      "longbridge",
    );
  }
  return bars;
}

export const longbridgeProvider: MarketDataProvider = {
  id: "longbridge",

  isConfigured() {
    return hasLongbridgeCreds();
  },

  supports(assetType) {
    // Crypto quotes/candles go through Binance / Finnhub
    return assetType === "stock" || assetType === "hk";
  },

  async getQuote(symbol, assetType) {
    if (assetType === "crypto") {
      throw new MarketDataError("Longbridge crypto not preferred", "longbridge");
    }
    const normalized = normalizeSymbol(symbol, assetType);
    const lbSym = toLongbridgeSymbol(normalized, assetType);
    const key = `lb:quote:${assetType}:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const ctx = await getCtx();
        const rows = await ctx.quote([lbSym]);
        const q = rows[0];
        if (!q) {
          throw new MarketDataError(`No quote for ${lbSym}`, "longbridge");
        }
        const price = dec(q.lastDone);
        const prev = dec(q.prevClose);
        const change = price - prev;
        const percentChange = prev ? (change / prev) * 100 : 0;
        const volume = Number(q.volume ?? 0);
        const turnover = dec(
          (q as { turnover?: { toNumber(): number } | null }).turnover,
        );
        let bid: number | undefined;
        let ask: number | undefined;
        let bidSize: number | undefined;
        let askSize: number | undefined;
        try {
          const depthFn = (
            ctx as {
              depth?: (symbol: string) => Promise<{
                bid?: { price?: { toNumber(): number }; volume?: number }[];
                ask?: { price?: { toNumber(): number }; volume?: number }[];
              }>;
            }
          ).depth;
          if (typeof depthFn === "function") {
            const depth = await depthFn.call(ctx, lbSym);
            const b0 = depth?.bid?.[0];
            const a0 = depth?.ask?.[0];
            const bp = b0?.price != null ? dec(b0.price) : 0;
            const ap = a0?.price != null ? dec(a0.price) : 0;
            if (bp > 0) bid = bp;
            if (ap > 0) ask = ap;
            if (b0?.volume != null && Number(b0.volume) > 0) {
              bidSize = Number(b0.volume);
            }
            if (a0?.volume != null && Number(a0.volume) > 0) {
              askSize = Number(a0.volume);
            }
          }
        } catch {
          /* depth optional */
        }
        return {
          symbol: normalized,
          assetType,
          price,
          change,
          percentChange,
          high: dec(q.high),
          low: dec(q.low),
          open: dec(q.open),
          previousClose: prev,
          timestamp: Math.floor((q.timestamp?.getTime?.() ?? Date.now()) / 1000),
          ...(volume > 0 ? { volume } : {}),
          ...(turnover > 0 ? { turnover } : {}),
          ...(bid != null ? { bid } : {}),
          ...(ask != null ? { ask } : {}),
          ...(bidSize != null ? { bidSize } : {}),
          ...(askSize != null ? { askSize } : {}),
          source: "longbridge" as const,
        } satisfies QuoteWithSource;
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Longbridge quote failed",
        "longbridge",
      );
    }
  },

  async getQuotes(items) {
    const equityItems = items.filter(
      (i) => i.assetType === "stock" || i.assetType === "hk",
    );
    if (!equityItems.length) return [];

    try {
      const ctx = await getCtx();
      const map = new Map(
        equityItems.map((i) => {
          const n = normalizeSymbol(i.symbol, i.assetType);
          return [toLongbridgeSymbol(n, i.assetType), { ...i, normalized: n }] as const;
        }),
      );
      const rows = await ctx.quote([...map.keys()]);
      const out: QuoteWithSource[] = [];
      for (const q of rows) {
        const meta = map.get(q.symbol);
        if (!meta) continue;
        const price = dec(q.lastDone);
        const prev = dec(q.prevClose);
        const change = price - prev;
        const volume = Number(q.volume ?? 0);
        const turnover = dec(
          (q as { turnover?: { toNumber(): number } | null }).turnover,
        );
        out.push({
          symbol: meta.normalized,
          assetType: meta.assetType,
          price,
          change,
          percentChange: prev ? (change / prev) * 100 : 0,
          high: dec(q.high),
          low: dec(q.low),
          open: dec(q.open),
          previousClose: prev,
          timestamp: Math.floor((q.timestamp?.getTime?.() ?? Date.now()) / 1000),
          ...(volume > 0 ? { volume } : {}),
          ...(turnover > 0 ? { turnover } : {}),
          source: "longbridge",
        });
      }
      return out;
    } catch (err) {
      // fall back to sequential
      const results = await Promise.allSettled(
        equityItems.map((i) => longbridgeProvider.getQuote(i.symbol, i.assetType)),
      );
      return results
        .filter((r): r is PromiseFulfilledResult<QuoteWithSource> => r.status === "fulfilled")
        .map((r) => r.value);
    }
  },

  async getDailyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const key = `lb:candle:D:${normalized}:${from}:${to}`;
    return cachedFetch(key, 60_000, () =>
      fetchLbHistoryBars(symbol, assetType, from, to, 14),
    );
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    const normalized = normalizeSymbol(symbol, assetType);
    const key = `lb:candle:M:${normalized}:${from}:${to}`;
    return cachedFetch(key, 120_000, () =>
      fetchLbHistoryBars(symbol, assetType, from, to, 16),
    );
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType === "crypto") return [];
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const type: AssetType = assetType === "hk" ? "hk" : "stock";
    const sym = normalizeSymbol(
      query.replace(/\.US$/i, "").replace(/\.HK$/i, "").replace(/^HK\./, ""),
      type,
    );
    return [
      {
        symbol: sym,
        displaySymbol: type === "hk" ? `${sym}.HK` : `${sym}.US`,
        description: `${sym} (Longbridge)`,
        assetType: type,
        type: "Common Stock",
      },
    ];
  },
};

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
    const ctx = await getCtx();
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

const contentCtxCache = new Map<
  LbLanguageId,
  InstanceType<LbModule["ContentContext"]>
>();

const fundamentalCtxCache = new Map<
  LbLanguageId,
  InstanceType<LbModule["FundamentalContext"]>
>();

/** Longbridge Language enum: 0=zh-CN, 1=zh-HK, 2=en. */
type LbLanguageId = 0 | 1 | 2 | "default";

/** Map UI locale to Longbridge language id (default keeps env `LONGBRIDGE_LANGUAGE`). */
function lbLanguage(locale?: string): LbLanguageId {
  const l = (locale || "").toLowerCase();
  if (l.startsWith("zh-cn")) return 0;
  if (l.startsWith("zh")) return 1;
  if (l === "en") return 2;
  return "default";
}

async function getContentCtx(language: LbLanguageId = "default") {
  const cached = contentCtxCache.get(language);
  if (cached) return cached;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
    language === "default" ? undefined : { language },
  );
  const ctx = lb.ContentContext.new(config);
  contentCtxCache.set(language, ctx);
  return ctx;
}

async function getFundamentalCtx(language: LbLanguageId = "default") {
  const cached = fundamentalCtxCache.get(language);
  if (cached) return cached;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    process.env.LONGBRIDGE_APP_KEY!,
    process.env.LONGBRIDGE_APP_SECRET!,
    process.env.LONGBRIDGE_ACCESS_TOKEN!,
    language === "default" ? undefined : { language },
  );
  const ctx = lb.FundamentalContext.new(config);
  fundamentalCtxCache.set(language, ctx);
  return ctx;
}

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

function strOrUndef(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v);
}

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
  // v2: fixed HK unpadded symbol (700.HK)
  const key = `lb:earnings:v2:${assetType}:${normalized}`;

  return cachedFetch(key, 600_000, async () => {
    const fund = await getFundamentalCtx();

    const [valuationRes, consensusRes] = await Promise.allSettled([
      fund.valuation(lbSym),
      fund.consensus(lbSym),
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
