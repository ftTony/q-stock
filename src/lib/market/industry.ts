import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";
import { getLongbridgeIndustryHeatmap } from "@/lib/market/providers/longbridge-industry";
import { getFutuIndustryHeatmap } from "@/lib/market/providers/futu-industry";
import { getMarketCreds } from "@/lib/market/creds-context";
import { hasLongbridgeCreds } from "@/lib/market/providers/longbridge-client";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import { isProviderEnabled } from "@/lib/market/router";
import type { EquityVendorId } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

export type { IndustryHeatCell, IndustryStock } from "@/lib/market/providers/longbridge-industry";

export type IndustryHeatmapResult = {
  industries: IndustryHeatCell[];
  source: "longbridge" | "futu" | null;
};

function equityOrder(): EquityVendorId[] {
  const primary = getMarketCreds().equityVendor ?? "longbridge";
  const secondary: EquityVendorId =
    primary === "longbridge" ? "futu" : "longbridge";
  return [primary, secondary];
}

export function isIndustryHeatmapAvailable(
  assetType?: AssetType,
): boolean {
  if (assetType === "crypto") return false;
  for (const id of equityOrder()) {
    if (id === "longbridge" && isProviderEnabled("longbridge") && hasLongbridgeCreds()) {
      return true;
    }
    if (id === "futu" && isProviderEnabled("futu") && isFutuConfigured()) {
      return true;
    }
  }
  // Longbridge industry chart is public HTTP (works without BYOK for US/HK/CN)
  if (assetType === "stock" || assetType === "hk" || assetType === "cn" || assetType === undefined) {
    return isProviderEnabled("longbridge");
  }
  return false;
}

export async function getIndustryHeatmap(
  assetType: AssetType,
  limit = 40,
): Promise<IndustryHeatmapResult> {
  if (assetType !== "stock" && assetType !== "hk" && assetType !== "cn") {
    return { industries: [], source: null };
  }

  for (const id of equityOrder()) {
    if (id === "longbridge" && isProviderEnabled("longbridge")) {
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
    if (id === "futu" && isProviderEnabled("futu") && isFutuConfigured()) {
      try {
        const industries = await getFutuIndustryHeatmap(assetType, limit);
        if (industries.length > 0) {
          return { industries, source: "futu" };
        }
      } catch (err) {
        console.warn(
          "[industry] futu failed:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  // Public Longbridge chart as last resort (no BYOK required)
  if (isProviderEnabled("longbridge")) {
    try {
      const industries = await getLongbridgeIndustryHeatmap(assetType, limit);
      if (industries.length > 0) {
        return { industries, source: "longbridge" };
      }
    } catch (err) {
      console.warn(
        "[industry] longbridge public failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { industries: [], source: null };
}
