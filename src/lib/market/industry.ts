import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";
import { getLongbridgeIndustryHeatmap } from "@/lib/market/providers/longbridge-industry";
import { getFutuIndustryHeatmap } from "@/lib/market/providers/futu-industry";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import { hasLongbridgeCreds } from "@/lib/market/providers/longbridge-client";
import {
  isProviderEnabled,
  listEquityAttempts,
  runWithEquityAttempt,
} from "@/lib/market/router";
import type { AssetType } from "@/lib/types";

export type { IndustryHeatCell, IndustryStock } from "@/lib/market/providers/longbridge-industry";

export type IndustryHeatmapResult = {
  industries: IndustryHeatCell[];
  source: "longbridge" | "futu" | null;
};

export function isIndustryHeatmapAvailable(
  assetType?: AssetType,
): boolean {
  if (assetType === "crypto") return false;
  if (hasLongbridgeCreds() && isProviderEnabled("longbridge")) return true;
  if (isFutuConfigured() && isProviderEnabled("futu")) return true;
  // Longbridge industry chart is public HTTP (works without BYOK for US/HK/CN)
  if (
    assetType === "stock" ||
    assetType === "hk" ||
    assetType === "cn" ||
    assetType === undefined
  ) {
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

  for (const attempt of listEquityAttempts()) {
    if (attempt.id === "finnhub") continue;
    try {
      if (attempt.id === "longbridge" && isProviderEnabled("longbridge")) {
        const industries = await runWithEquityAttempt(attempt, () =>
          getLongbridgeIndustryHeatmap(assetType, limit),
        );
        if (industries.length > 0) {
          return { industries, source: "longbridge" };
        }
      }
      if (
        attempt.id === "futu" &&
        isProviderEnabled("futu") &&
        isFutuConfigured()
      ) {
        const industries = await runWithEquityAttempt(attempt, () =>
          getFutuIndustryHeatmap(assetType, limit),
        );
        if (industries.length > 0) {
          return { industries, source: "futu" };
        }
      }
    } catch (err) {
      console.warn(
        `[industry] ${attempt.id}:${attempt.source} failed:`,
        err instanceof Error ? err.message : err,
      );
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
