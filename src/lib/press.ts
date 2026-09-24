import { cachedFetch } from "@/lib/cache";
import {
  getPressReleases as getFinnhubPress,
  type PressReleaseItem,
} from "@/lib/finnhub/client";
import { getLongbridgeFilings } from "@/lib/market/providers/longbridge";
import { getFutuPress } from "@/lib/market/providers/futu-content";
import { isProviderEnabled } from "@/lib/market/router";
import type { AssetType } from "@/lib/types";

export type PressItem = {
  headline?: string;
  datetime?: string;
  url?: string;
  description?: string;
  source?: string;
};

function mapFinnhub(items: PressReleaseItem[]): PressItem[] {
  return items.map((p) => ({
    headline: p.headline,
    datetime: p.datetime,
    url: p.url,
    description: p.description,
    source: "finnhub",
  }));
}

/**
 * Announcements: Longbridge → Futu → Finnhub (respect MARKET_DATA_PROVIDERS).
 */
export async function getPress(
  symbol: string,
  assetType: AssetType = "stock",
  locale?: string,
): Promise<{ press: PressItem[]; source: string | null; degraded: boolean }> {
  const sym = symbol.toUpperCase();

  if (assetType === "stock" || assetType === "hk") {
    if (isProviderEnabled("longbridge")) {
      try {
        const lb = await getLongbridgeFilings(sym, assetType);
        if (lb.length > 0) {
          return { press: lb, source: "longbridge", degraded: false };
        }
      } catch (err) {
        console.warn(
          "[press] longbridge filings failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    if (isProviderEnabled("futu")) {
      try {
        const futu = await getFutuPress(sym, assetType, locale);
        if (futu.length > 0) {
          return { press: futu, source: "futu", degraded: false };
        }
      } catch (err) {
        console.warn(
          "[press] futu failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  if (assetType === "stock" && isProviderEnabled("finnhub")) {
    try {
      const fh = await cachedFetch(`press:fh:${sym}`, 600_000, () =>
        getFinnhubPress(sym),
      );
      const mapped = mapFinnhub(fh);
      return {
        press: mapped,
        source: mapped.length ? "finnhub" : null,
        degraded: mapped.length === 0,
      };
    } catch (err) {
      console.warn(
        "[press] finnhub failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { press: [], source: null, degraded: true };
}
