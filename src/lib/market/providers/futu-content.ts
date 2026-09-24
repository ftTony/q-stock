import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";
import type { LongbridgeEarningsBundle } from "@/lib/market/providers/longbridge-content";

/** Soft-fail Futu content calls (-10 no_data, network, etc.). */
async function softFutu<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("-10")) {
      console.warn("[futu-content]", msg.slice(0, 160));
    }
    return fallback;
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function searchKeyword(code: string, assetType: AssetType): string {
  const bare = code.replace(/^(US|HK|SH|SZ|BJ)\./i, "");
  if (assetType === "hk") return bare.replace(/^0+/, "") || bare;
  return bare;
}

function localeToFutuLang(locale?: string): string | undefined {
  if (!locale) return undefined;
  const l = locale.toLowerCase();
  if (l.startsWith("zh-tw") || l.startsWith("zh-hk")) return "zh-HK";
  if (l.startsWith("zh")) return "zh-CN";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("en")) return "en";
  return undefined;
}

// ── Company profile ──────────────────────────────────────────────

type ProfileItem = {
  name?: string;
  value?: string;
  attribute_type?: number;
  field_type?: number;
};

function attr(items: ProfileItem[], type: number): string | undefined {
  const v = items.find((i) => i.attribute_type === type)?.value?.trim();
  return v || undefined;
}

export type FutuCompanyProfile = {
  name?: string;
  companyName?: string;
  ticker?: string;
  website?: string;
  industry?: string;
  country?: string;
  exchange?: string;
  founded?: string;
  listed?: string;
  employees?: string;
  chairman?: string;
  manager?: string;
  secretary?: string;
  brief?: string;
};

export async function getFutuCompany(
  symbol: string,
  assetType: AssetType,
): Promise<FutuCompanyProfile | null> {
  if (!isFutuConfigured()) return null;
  if (assetType !== "stock" && assetType !== "hk") return null;

  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:company:${normalized}`;

  return softFutu(
    () =>
      cachedFetch(key, 600_000, async () => {
        const { data } = await futuRequest<{ items?: ProfileItem[] }>(
          "GET",
          `/api/v1.0/quote/${encodeURIComponent(code)}/company/profile`,
        );
        const items = data.items ?? [];
        if (!items.length) return null;
        const companyName = attr(items, 9);
        const brief = attr(items, 29) || attr(items, 35);
        const profile: FutuCompanyProfile = {
          name: companyName,
          companyName,
          ticker: attr(items, 7) || normalized,
          website: attr(items, 23),
          industry: attr(items, 50),
          country: attr(items, 25) || attr(items, 51),
          exchange: attr(items, 14) || attr(items, 15),
          founded: attr(items, 13),
          listed: attr(items, 10),
          employees: attr(items, 18),
          chairman: attr(items, 37),
          manager: attr(items, 52) || attr(items, 30),
          secretary: attr(items, 39),
          brief,
        };
        if (!profile.name && !profile.brief && !profile.ticker) return null;
        return profile;
      }),
    null,
  );
}

// ── Executives ───────────────────────────────────────────────────

type ExecRow = {
  leader_name?: string;
  display_leader_name?: string;
  position_name?: string;
  leader_age?: string;
};

export type FutuOfficer = {
  name?: string;
  nameEn?: string;
  title?: string;
  age?: number;
};

export async function getFutuExecutives(
  symbol: string,
  assetType: AssetType,
): Promise<FutuOfficer[]> {
  if (!isFutuConfigured()) return [];
  if (assetType !== "stock" && assetType !== "hk") return [];

  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:exec:${normalized}`;

  return softFutu(
    () =>
      cachedFetch(key, 600_000, async () => {
        const { data } = await futuRequest<{ executives?: ExecRow[] }>(
          "GET",
          `/api/v1.0/quote/${encodeURIComponent(code)}/company/executives`,
        );
        return (data.executives ?? []).slice(0, 40).map((e) => {
          const ageN = Number(e.leader_age);
          return {
            name: e.leader_name || e.display_leader_name,
            nameEn: e.display_leader_name,
            title: e.position_name,
            ...(Number.isFinite(ageN) ? { age: ageN } : {}),
          };
        });
      }),
    [],
  );
}

// ── News / announcements via find-news ───────────────────────────

type NewsRow = {
  news_id?: string;
  news_type?: string;
  title?: string;
  publish_time?: number;
  url?: string;
  img_url?: string;
};

function newsRowsOf(data: unknown): NewsRow[] {
  if (Array.isArray(data)) return data as NewsRow[];
  if (data && typeof data === "object") {
    const d = data as { list?: NewsRow[]; items?: NewsRow[] };
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.items)) return d.items;
  }
  return [];
}

async function fetchFutuFindNews(
  symbol: string,
  assetType: AssetType,
  newsType: 1 | 2,
  locale?: string,
  limit = 30,
): Promise<
  {
    headline: string;
    url?: string;
    datetime: number;
    image?: string;
    source: "futu";
  }[]
> {
  if (!isFutuConfigured()) return [];
  if (assetType !== "stock" && assetType !== "hk") return [];

  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const q = searchKeyword(code, assetType);
  const lang = localeToFutuLang(locale);
  const key = `futu:find-news:${newsType}:${normalized}:${lang ?? ""}:${limit}`;

  return softFutu(
    () =>
      cachedFetch(key, 300_000, async () => {
        const { data } = await futuRequest<unknown>("GET", "/api/v1.0/quote/find-news", {
          query: {
            symbol: q,
            size: Math.min(50, Math.max(1, limit)),
            news_type: newsType,
            sort_type: 2,
            ...(lang ? { lang } : {}),
          },
        });
        return newsRowsOf(data)
          .map((n) => {
            const headline = stripHtml(n.title || "");
            if (!headline) return null;
            const ts = Number(n.publish_time ?? 0);
            return {
              headline,
              url: n.url || undefined,
              datetime: ts > 1e12 ? Math.floor(ts / 1000) : ts || Math.floor(Date.now() / 1000),
              image: n.img_url || undefined,
              source: "futu" as const,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x != null)
          .slice(0, limit);
      }),
    [],
  );
}

export async function getFutuNews(
  symbol: string,
  assetType: AssetType,
  locale?: string,
) {
  return fetchFutuFindNews(symbol, assetType, 1, locale);
}

export async function getFutuPress(
  symbol: string,
  assetType: AssetType,
  locale?: string,
) {
  const rows = await fetchFutuFindNews(symbol, assetType, 2, locale);
  return rows.map((n) => ({
    headline: n.headline,
    datetime: new Date(n.datetime * 1000).toISOString(),
    url: n.url,
    source: "futu" as const,
  }));
}

// ── Earnings ─────────────────────────────────────────────────────

const METRIC_NAME_MAP: Record<string, string> = {
  "Basic Earnings Per Share": "epsTTM",
  "Diluted Earnings Per Share": "epsAnnual",
  ROE: "roeTTM",
  ROA: "roaTTM",
  "Gross Profit Ratio": "grossMarginTTM",
  "Operating Profit Ratio": "operatingMarginTTM",
  "Net Profit Ratio": "netProfitMarginTTM",
};

type StmtItem = {
  display_name?: string;
  data?: number;
  yoy?: number;
};
type StmtReport = {
  fiscal_year?: number;
  financial_type?: number;
  period_text?: string;
  date_time?: number;
  item_list?: StmtItem[];
};
type EarnHistRow = {
  fiscal_year?: number;
  financial_type?: number;
  period_text?: string;
  pub_trading_day_str?: string;
  pub_time?: number;
  close_price?: number;
  last_close_price?: number;
};

function parseQuarter(periodText: string, financialType?: number): number {
  const m = (periodText || "").match(/Q\s*([1-4])/i);
  if (m) return Number(m[1]);
  if (financialType != null && financialType >= 1 && financialType <= 4) {
    return financialType;
  }
  return 0;
}

export async function getFutuEarnings(
  symbol: string,
  assetType: AssetType,
): Promise<LongbridgeEarningsBundle | null> {
  if (!isFutuConfigured()) return null;
  if (assetType !== "stock" && assetType !== "hk") return null;

  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:earnings:v1:${normalized}`;

  return softFutu(
    () =>
      cachedFetch(key, 300_000, async () => {
        const pathBase = `/api/v1.0/quote/${encodeURIComponent(code)}`;

        const [stmtRes, histRes, snapRes] = await Promise.all([
          softFutu(
            () =>
              futuRequest<{ report_list?: StmtReport[] }>("GET", `${pathBase}/financials/statements`, {
                query: { statement_type: 4, limit: 12 },
              }),
            { data: { report_list: [] } },
          ),
          softFutu(
            () =>
              futuRequest<{ records?: EarnHistRow[] }>(
                "GET",
                `${pathBase}/financials/earnings-price-history`,
              ),
            { data: { records: [] } },
          ),
          softFutu(
            () =>
              futuRequest<{
                snapshot_list?: Array<{
                  pe_ratio?: number;
                  pe_ttm_ratio?: number;
                  pb_ratio?: number;
                  highest52weeks_price?: number;
                  lowest52weeks_price?: number;
                  total_market_val?: number;
                }>;
              }>("POST", "/api/v1.0/quote/snapshot", {
                body: { code_list: [code] },
              }),
            { data: { snapshot_list: [] } },
          ),
        ]);

        const reports = stmtRes.data.report_list ?? [];
        const metrics: { key: string; value: number | null }[] = [];
        const latest = reports[0];
        if (latest?.item_list) {
          for (const item of latest.item_list) {
            const mapped = METRIC_NAME_MAP[item.display_name ?? ""];
            if (!mapped) continue;
            const v = Number(item.data);
            if (Number.isFinite(v)) metrics.push({ key: mapped, value: v });
          }
        }

        const snap = snapRes.data.snapshot_list?.[0];
        if (snap) {
          const pe = Number(snap.pe_ttm_ratio ?? snap.pe_ratio);
          if (Number.isFinite(pe) && pe > 0) {
            metrics.push({ key: "peTTM", value: pe });
          }
          const pb = Number(snap.pb_ratio);
          if (Number.isFinite(pb) && pb > 0) {
            metrics.push({ key: "pbAnnual", value: pb });
          }
          const h52 = Number(snap.highest52weeks_price);
          const l52 = Number(snap.lowest52weeks_price);
          if (Number.isFinite(h52) && h52 > 0) {
            metrics.push({ key: "52WeekHigh", value: h52 });
          }
          if (Number.isFinite(l52) && l52 > 0) {
            metrics.push({ key: "52WeekLow", value: l52 });
          }
          const mcap = Number(snap.total_market_val);
          if (Number.isFinite(mcap) && mcap > 0) {
            // Futu returns full market cap; Finnhub uses millions
            metrics.push({
              key: "marketCapitalization",
              value: mcap / 1_000_000,
            });
          }
        }

        const surprises: LongbridgeEarningsBundle["surprises"] = [];
        for (const r of [...reports].reverse()) {
          const epsItem = r.item_list?.find(
            (i) => i.display_name === "Basic Earnings Per Share",
          );
          const actual = Number(epsItem?.data);
          if (!Number.isFinite(actual)) continue;
          const year = Number(r.fiscal_year ?? 0);
          const quarter = parseQuarter(r.period_text ?? "", r.financial_type);
          const period =
            r.period_text ||
            (year && quarter ? `${year}-Q${quarter}` : String(year || ""));
          surprises.push({
            actual,
            estimate: null,
            period,
            quarter,
            year,
            surprise: null,
            surprisePercent: Number.isFinite(Number(epsItem?.yoy))
              ? Number(epsItem?.yoy)
              : null,
          });
        }

        const today = new Date().toISOString().slice(0, 10);
        const seen = new Set<string>();
        const recent: LongbridgeEarningsBundle["calendar"]["recent"] = [];
        const upcoming: LongbridgeEarningsBundle["calendar"]["upcoming"] = [];

        for (const row of histRes.data.records ?? []) {
          const period = row.period_text || "";
          if (!period || seen.has(period)) continue;
          seen.add(period);
          const date = (row.pub_trading_day_str || "").slice(0, 10);
          if (!date) continue;
          const year = Number(row.fiscal_year ?? 0);
          const quarter = parseQuarter(period, row.financial_type);
          const entry = {
            date,
            epsActual: null as number | null,
            epsEstimate: null as number | null,
            hour: "unknown",
            quarter,
            revenueActual: null as number | null,
            revenueEstimate: null as number | null,
            year,
          };
          if (date >= today) upcoming.push(entry);
          else recent.push(entry);
        }
        recent.sort((a, b) => b.date.localeCompare(a.date));
        upcoming.sort((a, b) => a.date.localeCompare(b.date));

        if (
          !metrics.length &&
          !surprises.length &&
          !recent.length &&
          !upcoming.length
        ) {
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
      }),
    null,
  );
}
