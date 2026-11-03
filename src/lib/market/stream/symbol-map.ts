import {
  CN_MARKET_INDICES,
  HK_MARKET_INDICES,
  INDEX_FUTU,
  INDEX_LONGBRIDGE,
  US_MARKET_INDICES,
} from "@/lib/market/indices";
import { toFutuSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
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

/** Futu wire: US.AAPL / HK.00700 / SH.600519 */
export function toFutuWire(assetType: AssetType, symbol: string): string {
  return toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
}

/** Reverse Futu wire code → internal symbol (best-effort). */
export function fromFutuSymbol(futuSym: string): InternalSymbol | null {
  const raw = futuSym.trim().toUpperCase();
  if (!raw) return null;

  for (const [internal, wire] of Object.entries(INDEX_FUTU)) {
    if (wire.toUpperCase() === raw) {
      if (internal.includes(".")) {
        return { assetType: "cn", symbol: normalizeSymbol(internal, "cn") };
      }
      if (["HSI", "HSTECH", "HSCEI"].includes(internal)) {
        return { assetType: "hk", symbol: internal };
      }
      if (["SSEC", "SZI", "CHINEXT"].includes(internal)) {
        return {
          assetType: "cn",
          symbol: normalizeSymbol(
            internal === "SSEC"
              ? "000001.SH"
              : internal === "SZI"
                ? "399001.SZ"
                : "399006.SZ",
            "cn",
          ),
        };
      }
      return { assetType: "stock", symbol: internal };
    }
  }

  const m = raw.match(/^(US|HK|SH|SZ|BJ)\.(.+)$/i);
  if (!m) return null;
  const market = m[1]!.toUpperCase();
  const code = m[2]!;
  if (market === "US") {
    return { assetType: "stock", symbol: normalizeSymbol(code, "stock") };
  }
  if (market === "HK") {
    const bare = code.replace(/\D/g, "");
    return {
      assetType: "hk",
      symbol: normalizeSymbol(bare.padStart(5, "0"), "hk"),
    };
  }
  return {
    assetType: "cn",
    symbol: normalizeSymbol(`${code}.${market}`, "cn"),
  };
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
