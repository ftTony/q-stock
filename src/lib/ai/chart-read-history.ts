import type { AssetType } from "@/lib/types";

export type StoredChartRead = {
  structure: string;
  keyLevels: number[];
  whatWouldChangeMind: string;
  notes: string[];
  features?: { barCount?: number; structure?: string };
  disclaimer?: string;
  cached?: boolean;
  degraded?: boolean;
};

const PREFIX = "qstock:ai-chart:v1:";

function storageKey(assetType: AssetType, symbol: string, locale: string) {
  return `${PREFIX}${assetType}:${symbol.toUpperCase()}:${locale}`;
}

export function loadChartReadHistory(
  assetType: AssetType,
  symbol: string,
  locale: string,
): StoredChartRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(assetType, symbol, locale));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: StoredChartRead };
    const data = parsed.data;
    if (!data || typeof data.structure !== "string") return null;
    return {
      structure: data.structure,
      keyLevels: Array.isArray(data.keyLevels)
        ? data.keyLevels.filter((n) => typeof n === "number")
        : [],
      whatWouldChangeMind:
        typeof data.whatWouldChangeMind === "string"
          ? data.whatWouldChangeMind
          : "",
      notes: Array.isArray(data.notes)
        ? data.notes.filter((n) => typeof n === "string")
        : [],
      features: data.features,
      disclaimer: data.disclaimer,
      cached: data.cached,
      degraded: data.degraded,
    };
  } catch {
    return null;
  }
}

export function saveChartReadHistory(
  assetType: AssetType,
  symbol: string,
  locale: string,
  data: StoredChartRead,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storageKey(assetType, symbol, locale),
      JSON.stringify({ updatedAt: Date.now(), data }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearChartReadHistory(
  assetType: AssetType,
  symbol: string,
  locale: string,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(assetType, symbol, locale));
  } catch {
    /* ignore */
  }
}
