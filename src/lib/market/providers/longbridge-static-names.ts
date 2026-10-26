import { getCached, setCached } from "@/lib/cache";
import {
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

const NAME_TTL_MS = 24 * 60 * 60 * 1000;

function pickName(
  info: { nameCn?: string; nameEn?: string; nameHk?: string },
  assetType: AssetType,
): string | undefined {
  const cn = info.nameCn?.trim();
  const en = info.nameEn?.trim();
  const hk = info.nameHk?.trim();
  if (assetType === "cn") return cn || en || undefined;
  if (assetType === "hk") return hk || cn || en || undefined;
  return en || cn || hk || undefined;
}

function nameCacheKey(lbSym: string): string {
  return `lb:static-name:v1:${lbSym}`;
}

/** Resolve display names via Longbridge staticInfo (long-lived cache). */
export async function resolveLongbridgeNames(
  items: { symbol: string; assetType: AssetType }[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
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
    const cached = await getCached<string>(nameCacheKey(lbSym));
    if (cached) out.set(meta.normalized, cached);
    else missing.push(lbSym);
  }
  if (!missing.length) return out;

  try {
    const ctx = await getQuoteCtx();
    const rows = await ctx.staticInfo(missing);
    for (const info of rows ?? []) {
      const meta = byLb.get(info.symbol);
      if (!meta) continue;
      const name = pickName(info, meta.assetType);
      if (!name) continue;
      out.set(meta.normalized, name);
      await setCached(nameCacheKey(info.symbol), name, NAME_TTL_MS);
    }
  } catch {
    /* names optional — quotes still work without them */
  }

  return out;
}

export async function resolveLongbridgeName(
  symbol: string,
  assetType: AssetType,
): Promise<string | undefined> {
  const map = await resolveLongbridgeNames([{ symbol, assetType }]);
  return map.get(normalizeSymbol(symbol, assetType));
}
