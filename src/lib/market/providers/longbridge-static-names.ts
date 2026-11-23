import { getCached, setCached } from "@/lib/cache";
import {
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import { preferChineseNames } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

const NAME_TTL_MS = 24 * 60 * 60 * 1000;

/** Raw Longbridge staticInfo name fields (all locales). */
export type StaticNameBundle = {
  nameCn?: string;
  nameEn?: string;
  nameHk?: string;
};

function trimOrUndef(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

function bundleFromInfo(info: {
  nameCn?: string;
  nameEn?: string;
  nameHk?: string;
}): StaticNameBundle {
  return {
    ...(trimOrUndef(info.nameCn) ? { nameCn: trimOrUndef(info.nameCn) } : {}),
    ...(trimOrUndef(info.nameEn) ? { nameEn: trimOrUndef(info.nameEn) } : {}),
    ...(trimOrUndef(info.nameHk) ? { nameHk: trimOrUndef(info.nameHk) } : {}),
  };
}

/**
 * Pick a single display name from upstream bundle.
 * US: zh → nameCn, en → nameEn; HK/CN keep market-native preference with locale overlay.
 */
export function pickLocalizedStaticName(
  info: StaticNameBundle,
  assetType: AssetType,
  locale?: string | null,
): string | undefined {
  const cn = info.nameCn?.trim();
  const en = info.nameEn?.trim();
  const hk = info.nameHk?.trim();
  const zh = preferChineseNames(locale);

  if (assetType === "cn") {
    return zh ? cn || en || undefined : en || cn || undefined;
  }
  if (assetType === "hk") {
    if (zh) return cn || hk || en || undefined;
    return en || hk || cn || undefined;
  }
  // US / other equity
  return zh ? cn || en || hk || undefined : en || cn || hk || undefined;
}

function nameCacheKey(lbSym: string): string {
  return `lb:static-name:v2:${lbSym}`;
}

/** Resolve name bundles via Longbridge staticInfo (long-lived cache). */
export async function resolveLongbridgeNameBundles(
  items: { symbol: string; assetType: AssetType }[],
): Promise<Map<string, StaticNameBundle>> {
  const out = new Map<string, StaticNameBundle>();
  if (!items.length || !hasLongbridgeCreds()) return out;

  const byLb = new Map<string, { normalized: string; assetType: AssetType }>();
  for (const item of items) {
    if (item.assetType === "crypto") continue;
    const normalized = normalizeSymbol(item.symbol, item.assetType);
    const lbSym = toLongbridgeSymbol(normalized, item.assetType);
    byLb.set(lbSym, { normalized, assetType: item.assetType });
  }
  if (!byLb.size) return out;

  const missing: string[] = [];
  for (const [lbSym, meta] of byLb) {
    const cached = await getCached<StaticNameBundle>(nameCacheKey(lbSym));
    if (cached && (cached.nameCn || cached.nameEn || cached.nameHk)) {
      out.set(meta.normalized, cached);
    } else {
      missing.push(lbSym);
    }
  }
  if (!missing.length) return out;

  try {
    const ctx = await getQuoteCtx();
    const rows = await ctx.staticInfo(missing);
    for (const info of rows ?? []) {
      const meta = byLb.get(info.symbol);
      if (!meta) continue;
      const bundle = bundleFromInfo(info);
      if (!bundle.nameCn && !bundle.nameEn && !bundle.nameHk) continue;
      out.set(meta.normalized, bundle);
      await setCached(nameCacheKey(info.symbol), bundle, NAME_TTL_MS);
    }
  } catch {
    /* names optional — quotes still work without them */
  }

  return out;
}

/** @deprecated Prefer resolveLongbridgeNameBundles + pickLocalizedStaticName. */
export async function resolveLongbridgeNames(
  items: { symbol: string; assetType: AssetType }[],
  locale?: string | null,
): Promise<Map<string, string>> {
  const bundles = await resolveLongbridgeNameBundles(items);
  const out = new Map<string, string>();
  for (const item of items) {
    if (item.assetType === "crypto") continue;
    const normalized = normalizeSymbol(item.symbol, item.assetType);
    const bundle = bundles.get(normalized);
    if (!bundle) continue;
    const name = pickLocalizedStaticName(bundle, item.assetType, locale);
    if (name) out.set(normalized, name);
  }
  return out;
}

export async function resolveLongbridgeName(
  symbol: string,
  assetType: AssetType,
  locale?: string | null,
): Promise<string | undefined> {
  const map = await resolveLongbridgeNames([{ symbol, assetType }], locale);
  return map.get(normalizeSymbol(symbol, assetType));
}
