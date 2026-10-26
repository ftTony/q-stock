import type { PrismaClient } from "@prisma/client";
import {
  defaultLocale,
  localizedPath,
  type AppLocale,
} from "@/i18n/config";
import { seoPublicOrigin } from "@/lib/seo/site-url";
import { listLearnSlugs } from "@/lib/learn/articles";
import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { sitemapLocales } from "@/lib/seo/sitemap-locales";
import {
  resolveSymbolsForMarket,
  seedSymbolsForMarket,
  type SitemapMarket,
} from "@/lib/seo/sitemap-symbols";

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  /** hreflang → absolute URL (includes x-default). */
  languages?: Record<string, string>;
};

export type SitemapSegmentId = "static" | SitemapMarket;

export { sitemapLocales } from "@/lib/seo/sitemap-locales";

export const SITEMAP_SEGMENTS: SitemapSegmentId[] = [
  "static",
  "stock",
  "hk",
  "cn",
  "crypto",
];

/** Public indexable paths only (no auth / account surfaces). */
const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/markets", changeFrequency: "daily", priority: 0.95 },
  { path: "/analysis", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/learn", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.55 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.65 },
  { path: "/advanced-quotes", changeFrequency: "monthly", priority: 0.6 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

const MARKET_PRIORITY: Record<SitemapMarket, number> = {
  stock: 0.8,
  hk: 0.75,
  cn: 0.75,
  crypto: 0.7,
};

function absUrl(origin: string, locale: AppLocale, path: string): string {
  const locPath = localizedPath(locale, path);
  return locPath === "/" ? `${origin}/` : `${origin}${locPath}`;
}

/** Map of sitemap locales (+ x-default) for a logical path. */
export function languageMapForPath(
  origin: string,
  path: string,
): Record<string, string> {
  const langs = sitemapLocales();
  const languages: Record<string, string> = {};
  for (const locale of langs) {
    languages[locale] = absUrl(origin, locale, path);
  }
  // Prefer zh-CN as x-default on CN-facing sitemaps when present.
  const xDefault: AppLocale = langs.includes("zh-CN") ? "zh-CN" : defaultLocale;
  languages["x-default"] = absUrl(origin, xDefault, path);
  return languages;
}

function pushUnique(
  entries: SitemapEntry[],
  seen: Set<string>,
  entry: SitemapEntry,
) {
  if (seen.has(entry.url)) return;
  seen.add(entry.url);
  entries.push(entry);
}

export function buildStaticSitemapEntries(now = new Date()): SitemapEntry[] {
  const origin = seoPublicOrigin();
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();
  for (const p of STATIC_PATHS) {
    const languages = languageMapForPath(origin, p.path);
    for (const locale of sitemapLocales()) {
      pushUnique(entries, seen, {
        url: languages[locale]!,
        lastModified: now,
        changeFrequency: p.changeFrequency,
        priority: p.priority,
        languages,
      });
    }
  }
  for (const slug of listLearnSlugs()) {
    const path = `/learn/${slug}`;
    const languages = languageMapForPath(origin, path);
    for (const locale of sitemapLocales()) {
      pushUnique(entries, seen, {
        url: languages[locale]!,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.55,
        languages,
      });
    }
  }
  for (const tool of TOOL_CATALOG) {
    const languages = languageMapForPath(origin, tool.href);
    for (const locale of sitemapLocales()) {
      pushUnique(entries, seen, {
        url: languages[locale]!,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.55,
        languages,
      });
    }
  }
  return entries;
}

export function buildMarketSitemapEntries(
  market: SitemapMarket,
  symbols: string[],
  now = new Date(),
): SitemapEntry[] {
  const origin = seoPublicOrigin();
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();
  const priority = MARKET_PRIORITY[market];
  for (const symbol of symbols) {
    // Defense in depth — resolveSymbolsForMarket already filters.
    if (!symbol || /[^\x20-\x7E]/.test(symbol)) continue;
    const path = `/symbol/${market}/${symbol}`;
    const languages = languageMapForPath(origin, path);
    for (const locale of sitemapLocales()) {
      pushUnique(entries, seen, {
        url: languages[locale]!,
        lastModified: now,
        changeFrequency: "daily",
        priority,
        languages,
      });
    }
  }
  return entries;
}

export async function buildSegmentEntries(
  id: SitemapSegmentId,
  opts?: { prisma?: PrismaClient; now?: Date },
): Promise<SitemapEntry[]> {
  const now = opts?.now ?? new Date();
  if (id === "static") return buildStaticSitemapEntries(now);
  const symbols = opts?.prisma
    ? await resolveSymbolsForMarket(id, opts.prisma)
    : seedSymbolsForMarket(id);
  return buildMarketSitemapEntries(id, symbols, now);
}

/** Everything in one list (tests / legacy). */
export async function buildSitemapEntries(opts?: {
  prisma?: PrismaClient;
  now?: Date;
}): Promise<SitemapEntry[]> {
  const parts = await Promise.all(
    SITEMAP_SEGMENTS.map((id) => buildSegmentEntries(id, opts)),
  );
  return parts.flat();
}

/** Chunk ids for Next `/sitemap/{id}.xml` and the root sitemap index. */
export async function listSitemapChunkIds(opts?: {
  prisma?: PrismaClient;
}): Promise<string[]> {
  const max = sitemapMaxUrlsPerFile();
  const out: string[] = [];
  for (const segment of SITEMAP_SEGMENTS) {
    const entries = await buildSegmentEntries(segment, opts);
    const chunks = chunkSitemapEntries(entries, max);
    if (chunks.length <= 1) {
      out.push(segment);
      continue;
    }
    for (let i = 1; i <= chunks.length; i++) {
      out.push(`${segment}-${i}`);
    }
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sitemapEntriesToXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const lastmod = e.lastModified.toISOString().slice(0, 10);
      const links = e.languages
        ? Object.entries(e.languages)
            .map(
              ([lang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
            )
            .join("\n")
        : "";
      return `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>${links ? `\n${links}` : ""}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

/** Sitemap index pointing at per-market (and static) child sitemaps. */
export function buildSitemapIndexXml(
  childPaths: string[],
  now = new Date(),
): string {
  const origin = seoPublicOrigin();
  const lastmod = now.toISOString().slice(0, 10);
  const body = childPaths
    .map((p) => {
      const loc = p.startsWith("http")
        ? p
        : `${origin}${p.startsWith("/") ? p : `/${p}`}`;
      return `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function segmentFileName(id: SitemapSegmentId): string {
  return `sitemap-${id}.xml`;
}

/** Max `<url>` entries per physical sitemap file (default 500 ≈ under 10k lines with hreflang). */
export function sitemapMaxUrlsPerFile(): number {
  const n = Number(process.env.SITEMAP_MAX_URLS_PER_FILE || 500);
  if (!Number.isFinite(n)) return 500;
  return Math.min(5000, Math.max(100, Math.floor(n)));
}

export function chunkSitemapEntries<T>(
  entries: T[],
  maxPerFile = sitemapMaxUrlsPerFile(),
): T[][] {
  if (!entries.length) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < entries.length; i += maxPerFile) {
    chunks.push(entries.slice(i, i + maxPerFile));
  }
  return chunks;
}

/**
 * File name for a segment chunk.
 * Single chunk → `sitemap-stock.xml`; multi → `sitemap-stock-1.xml`, …
 */
export function segmentChunkFileName(
  id: SitemapSegmentId,
  chunkIndex: number,
  chunkCount: number,
): string {
  if (chunkCount <= 1) return segmentFileName(id);
  return `sitemap-${id}-${chunkIndex + 1}.xml`;
}

export type ParsedSitemapId = {
  segment: SitemapSegmentId;
  /** 0-based chunk; null = whole segment (legacy / single file). */
  chunkIndex: number | null;
};

/** Parse Next `/sitemap/{id}` or file stem: `stock`, `stock-2`, `static`. */
export function parseSitemapId(raw: string): ParsedSitemapId {
  const value = raw.trim();
  if (SITEMAP_SEGMENTS.includes(value as SitemapSegmentId)) {
    return { segment: value as SitemapSegmentId, chunkIndex: null };
  }
  const m = value.match(
    /^(static|stock|hk|cn|crypto)-(\d+)$/,
  ) as RegExpMatchArray | null;
  if (m) {
    const segment = m[1] as SitemapSegmentId;
    const n = Number(m[2]);
    if (Number.isFinite(n) && n >= 1) {
      return { segment, chunkIndex: n - 1 };
    }
  }
  return { segment: "static", chunkIndex: null };
}
