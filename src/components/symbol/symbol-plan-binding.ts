import type { AssetType } from "@/lib/types";

const STORAGE_KEY = "qstock.symbolPlan.v1";

type BindingMap = Record<string, string>;

function key(assetType: AssetType, symbol: string): string {
  return `${assetType}:${symbol.toUpperCase()}`;
}

function readMap(): BindingMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as BindingMap;
  } catch {
    return {};
  }
}

function writeMap(map: BindingMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function getBoundStrategyId(
  assetType: AssetType,
  symbol: string,
): string | null {
  const id = readMap()[key(assetType, symbol)];
  return id && typeof id === "string" ? id : null;
}

export function setBoundStrategyId(
  assetType: AssetType,
  symbol: string,
  strategyId: string | null,
) {
  const map = readMap();
  const k = key(assetType, symbol);
  if (!strategyId) delete map[k];
  else map[k] = strategyId;
  writeMap(map);
}
