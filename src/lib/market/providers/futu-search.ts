import { futuRequest } from "@/lib/market/providers/futu-http";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { AssetType, SearchResult } from "@/lib/types";

/** OpenD / HTTP may return enum int or name string. */
function isNoiseSecType(sec: number | string | undefined): boolean {
  if (sec == null || sec === "") return false;
  if (typeof sec === "number") {
    // Qot_Common.SecurityType: Warrant=4, Plate=6, Option=7, PlateSet=8, Future=9
    return sec === 4 || sec === 6 || sec === 7 || sec === 8 || sec === 9;
  }
  const s = String(sec).toUpperCase();
  if (/STOCK|ETF|EQTY|IDX|INDEX|TRUST|BOND/.test(s)) return false;
  return /PLATE|WARRANT|DRVT|FUTURE|OPTION/.test(s);
}

function marketsFor(assetType: AssetType): Set<string> {
  if (assetType === "hk") return new Set(["HK"]);
  if (assetType === "cn") return new Set(["SH", "SZ", "BJ"]);
  return new Set(["US"]);
}

function assetTypeFromMarket(
  market: string,
  fallback: AssetType,
): AssetType {
  if (market === "HK") return "hk";
  if (market === "SH" || market === "SZ" || market === "BJ") return "cn";
  if (market === "US") return "stock";
  return fallback;
}

/**
 * Futu keyword search: GET /api/v1.0/quote/search-quote
 * Longbridge OpenAPI has no equivalent keyword search.
 */
export async function futuSearchSymbols(
  q: string,
  assetType: AssetType,
): Promise<SearchResult[]> {
  if (assetType === "crypto") return [];
  const query = q.trim();
  if (!query) return [];

  try {
    const { data } = await futuRequest<{
      items?: Array<{
        market?: string;
        code?: string;
        name?: string;
        sc_name?: string;
        tc_name?: string;
        sec_type?: number | string;
      }>;
    }>("GET", "/api/v1.0/quote/search-quote", {
      query: { keyword: query, page_size: 20 },
    });

    const markets = marketsFor(assetType);
    const out: SearchResult[] = [];
    for (const row of data.items ?? []) {
      const market = String(row.market ?? "").toUpperCase();
      const code = String(row.code ?? "").trim();
      if (!code || (market && !markets.has(market))) continue;
      if (isNoiseSecType(row.sec_type)) continue;

      const bare = code
        .replace(/^(US|HK|SH|SZ|BJ)\./i, "")
        .replace(/\.(US|HK|SH|SZ|BJ)$/i, "");
      const type = assetTypeFromMarket(market, assetType);

      let sym: string;
      try {
        sym = normalizeSymbol(
          type === "cn" && market ? `${bare}.${market}` : bare,
          type,
        );
      } catch {
        continue;
      }

      const description = (
        row.sc_name ||
        row.name ||
        row.tc_name ||
        sym
      ).trim();

      out.push({
        symbol: sym,
        displaySymbol: code,
        description,
        assetType: type,
        type: String(row.sec_type ?? "Common Stock"),
      });
      if (out.length >= 12) break;
    }
    // API succeeded — even empty (wrong market / no hits). Don't echo ticker.
    return out;
  } catch (err) {
    console.warn(
      "[futu] search-quote failed:",
      err instanceof Error ? err.message : err,
    );
  }

  // Transport / auth failure: last resort exact-ticker echo (marked synthetic).
  const type: AssetType =
    assetType === "hk" ? "hk" : assetType === "cn" ? "cn" : "stock";
  const bare = query
    .toUpperCase()
    .replace(/^(US|HK|SH|SZ|BJ)\./, "")
    .replace(/\.(US|HK|SH|SZ|BJ)$/, "");
  try {
    const sym = normalizeSymbol(bare, type);
    const code = toFutuSymbol(sym, type);
    return [
      {
        symbol: sym,
        displaySymbol: code,
        description: `${sym} (Futu)`,
        assetType: type,
        type: "Common Stock",
      },
    ];
  } catch {
    return [];
  }
}
