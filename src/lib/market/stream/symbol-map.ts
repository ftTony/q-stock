import {
  CN_MARKET_INDICES,
  HK_MARKET_INDICES,
  INDEX_LONGBRIDGE,
  US_MARKET_INDICES,
} from "@/lib/market/indices";
import { toLongbridgeSymbol } from "@/lib/market/symbols";
import { normalizeSymbol, type AssetType } from "@/lib/types";

export type InternalSymbol = {
  assetType: AssetType;
  symbol: string;
};

/** Reverse Longbridge wire code → internal symbol (best-effort). */
export function fromLongbridgeSymbol(lbSym: string): InternalSymbol | null {
  const raw = lbSym.trim();
  if (!raw) return null;

  for (const [internal, wire] of Object.entries(INDEX_LONGBRIDGE)) {
    if (wire.toUpperCase() === raw.toUpperCase()) {
      if (internal.includes(".")) {
        return { assetType: "cn", symbol: normalizeSymbol(internal, "cn") };
      }
      if (["HSI", "HSTECH", "HSCEI"].includes(internal)) {
        return { assetType: "hk", symbol: internal };
      }
      return { assetType: "stock", symbol: internal };
    }
  }

  const us = raw.match(/^(.+)\.US$/i);
  if (us) {
    const code = us[1]!.replace(/^\./, "");
    return { assetType: "stock", symbol: normalizeSymbol(code, "stock") };
  }

  const hk = raw.match(/^(.+)\.HK$/i);
  if (hk) {
    const bare = hk[1]!.replace(/\D/g, "");
    return {
      assetType: "hk",
      symbol: normalizeSymbol(bare.padStart(5, "0"), "hk"),
    };
  }

  if (/\.(SH|SZ|BJ)$/i.test(raw)) {
    return { assetType: "cn", symbol: normalizeSymbol(raw, "cn") };
  }

  return null;
}

export function toLbWire(assetType: AssetType, symbol: string): string {
  return toLongbridgeSymbol(normalizeSymbol(symbol, assetType), assetType);
}

export function allIndexInternals(): InternalSymbol[] {
  return [...US_MARKET_INDICES, ...HK_MARKET_INDICES, ...CN_MARKET_INDICES].map(
    (d) => ({ assetType: d.assetType, symbol: d.symbol }),
  );
}

export function indexDefsForAssetType(assetType: Exclude<AssetType, "crypto">) {
  if (assetType === "hk") return HK_MARKET_INDICES;
  if (assetType === "cn") return CN_MARKET_INDICES;
  return US_MARKET_INDICES;
}
