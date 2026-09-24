import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";
import { getLongbridgeIndustryHeatmap } from "@/lib/market/providers/longbridge-industry";
import { getFutuIndustryHeatmap } from "@/lib/market/providers/futu-industry";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import { isProviderEnabled } from "@/lib/market/router";
import type { AssetType } from "@/lib/types";

export type { IndustryHeatCell, IndustryStock } from "@/lib/market/providers/longbridge-industry";

export type IndustryHeatmapResult = {
  industries: IndustryHeatCell[];
  source: "longbridge" | "futu" | null;
};

/**
 * Industry heatmap: Longbridge → Futu (when enabled via MARKET_DATA_PROVIDERS).
 * Longbridge chart needs no API key; Futu needs AppKey auth.
 */
export function isIndustryHeatmapAvailable(): boolean {
  if (isProviderEnabled("longbridge")) return true;
  if (isProviderEnabled("futu") && isFutuConfigured()) return true;
  return false;
}

export async function getIndustryHeatmap(
  assetType: AssetType,
  limit = 40,
): Promise<IndustryHeatmapResult> {
  if (assetType !== "stock" && assetType !== "hk") {
    return { industries: [], source: null };
  }

  if (isProviderEnabled("longbridge")) {
    try {
      const industries = await getLongbridgeIndustryHeatmap(assetType, limit);
      if (industries.length > 0) {
        return { industries, source: "longbridge" };
      }
    } catch (err) {
      console.warn(
        "[industry] longbridge failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (isProviderEnabled("futu") && isFutuConfigured()) {
    try {
      const industries = await getFutuIndustryHeatmap(assetType, limit);
      return { industries, source: "futu" };
    } catch (err) {
      console.warn(
        "[industry] futu failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { industries: [], source: null };
}
