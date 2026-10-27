import { cachedFetch } from "@/lib/cache";
import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

/** Matches Longbridge WarrantType. */
export type WarrantKind = "call" | "put" | "bull" | "bear" | "inline";

export type WarrantStatusKind =
  | "unknown"
  | "suspend"
  | "prepareList"
  | "normal";

export type WarrantRow = {
  symbol: string;
  name: string;
  callPrice: number | null;
  toCallPrice: number | null;
  effectiveLeverage: number | null;
  leverageRatio: number | null;
  conversionRatio: number | null;
  balancePoint: number | null;
  status: WarrantStatusKind;
  type: WarrantKind;
  last: number;
  chgPct: number | null;
};

const KIND_TO_LB: Record<WarrantKind, number> = {
  call: 1,
  put: 2,
  bull: 3,
  bear: 4,
  inline: 5,
};

const ALL_KINDS: WarrantKind[] = ["call", "put", "bull", "bear", "inline"];

const MAX_ROWS = 80;

function requireHkLb(symbol: string, assetType: AssetType) {
  if (assetType !== "hk") {
    throw new MarketDataError("Warrants are HK-only", "longbridge");
  }
  if (!hasLongbridgeCreds()) {
    throw new MarketDataError(
      "Longbridge credentials not configured",
      "longbridge",
    );
  }
  const normalized = normalizeSymbol(symbol, assetType);
  return toLongbridgeSymbol(normalized, assetType);
}

function mapKind(n: unknown): WarrantKind {
  const v = Number(n);
  if (v === 1) return "call";
  if (v === 2) return "put";
  if (v === 3) return "bull";
  if (v === 4) return "bear";
  if (v === 5) return "inline";
  return "call";
}

function mapStatus(n: unknown): WarrantStatusKind {
  const v = Number(n);
  if (v === 1) return "suspend";
  if (v === 2) return "prepareList";
  if (v === 3) return "normal";
  return "unknown";
}

function nullDec(v: unknown): number | null {
  if (v == null) return null;
  const n = dec(v as { toNumber?: () => number } | number | string | null);
  return Number.isFinite(n) ? n : null;
}

function mapRow(raw: {
  symbol?: string;
  name?: string;
  warrantType?: unknown;
  lastDone?: unknown;
  changeRate?: unknown;
  callPrice?: unknown;
  toCallPrice?: unknown;
  effectiveLeverage?: unknown;
  leverageRatio?: unknown;
  conversionRatio?: unknown;
  balancePoint?: unknown;
  status?: unknown;
}): WarrantRow {
  const last = dec(raw.lastDone as never);
  const chg = dec(raw.changeRate as never);
  return {
    symbol: String(raw.symbol ?? ""),
    name: String(raw.name ?? ""),
    callPrice: nullDec(raw.callPrice),
    toCallPrice: nullDec(raw.toCallPrice),
    effectiveLeverage: nullDec(raw.effectiveLeverage),
    leverageRatio: nullDec(raw.leverageRatio),
    conversionRatio: nullDec(raw.conversionRatio),
    balancePoint: nullDec(raw.balancePoint),
    status: mapStatus(raw.status),
    type: mapKind(raw.warrantType),
    last,
    chgPct: Number.isFinite(chg) ? chg * (Math.abs(chg) <= 1 ? 100 : 1) : null,
  };
}

/**
 * HK warrant / CBBC list for an underlying via Longbridge `warrantList`.
 * Caps rows for the 1GB host; filter by WarrantType when `kinds` provided.
 */
export async function fetchLbWarrantList(
  symbol: string,
  assetType: AssetType,
  kinds?: WarrantKind[] | null,
): Promise<WarrantRow[]> {
  const lbSym = requireHkLb(symbol, assetType);
  const selected =
    kinds?.length && kinds.length < ALL_KINDS.length
      ? [...new Set(kinds)].sort()
      : null;
  const typeKey = selected?.join(",") ?? "all";
  const key = `lb:warrant:v1:${lbSym}:${typeKey}`;

  return cachedFetch(key, 120_000, async () => {
    const ctx = await getQuoteCtx();
    const typeArgs = selected?.map((k) => KIND_TO_LB[k]) ?? null;
    let list: unknown[] = [];
    try {
      // WarrantSortBy.Volume = 3, SortOrderType.Descending = 1
      list =
        (await ctx.warrantList(
          lbSym,
          3,
          1,
          typeArgs,
          null,
          null,
          null,
          null,
        )) ?? [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/connections (limitation|exhausted)/i.test(msg)) {
        throw new MarketDataError(
          "Longbridge quote connections exhausted — wait 1–5 min and retry",
          "longbridge",
        );
      }
      if (/404000|api not found|no access to the market/i.test(msg)) {
        throw new MarketDataError(
          `Longbridge OpenAPI has no warrant access for ${lbSym} (HK warrant package required in Quotes Store)`,
          "longbridge",
        );
      }
      throw err instanceof Error ? err : new Error(msg);
    }

    const rows = (list as Parameters<typeof mapRow>[0][])
      .map(mapRow)
      .filter((r) => r.symbol);
    if (!rows.length) {
      throw new MarketDataError(
        `No warrants/CBBCs for ${lbSym}`,
        "longbridge",
      );
    }
    return rows.slice(0, MAX_ROWS);
  });
}
