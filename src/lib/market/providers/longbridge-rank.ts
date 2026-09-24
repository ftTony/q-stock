import { cachedFetch } from "@/lib/cache";
import { getMarketCreds } from "@/lib/market/creds-context";
import { fingerprintLongbridge } from "@/lib/market/creds-types";
import { hasLongbridgeCreds, loadLb } from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType, Quote } from "@/lib/types";

export type RankBoard = "hot" | "gainers" | "losers";

type LbModule = typeof import("longbridge");

const marketCtxCache = new Map<
  string,
  InstanceType<LbModule["MarketContext"]>
>();

async function getMarketCtx(): Promise<InstanceType<LbModule["MarketContext"]>> {
  const creds = getMarketCreds().longbridge;
  if (!creds) throw new Error("Longbridge credentials not configured");
  const key = fingerprintLongbridge(creds);
  const hit = marketCtxCache.get(key);
  if (hit) return hit;
  const lb = await loadLb();
  const config = lb.Config.fromApikey(
    creds.appKey,
    creds.appSecret,
    creds.accessToken,
  );
  const ctx = lb.MarketContext.new(config);
  marketCtxCache.set(key, ctx);
  if (marketCtxCache.size > 32) {
    const first = marketCtxCache.keys().next().value;
    if (first !== undefined) marketCtxCache.delete(first);
  }
  return ctx;
}

function marketCode(assetType: AssetType): "US" | "HK" | null {
  if (assetType === "stock") return "US";
  if (assetType === "hk") return "HK";
  return null;
}

/**
 * @see https://open.longbridge.com/zh-CN/docs/market/rank-categories
 * @see https://open.longbridge.com/zh-CN/docs/market/rank-list
 *
 * Account packages expose heat boards (`hot_all-*`). Official
 * `change_top` / `change_bottom` map to `ib_change_*` and return 400 —
 * gainers/losers are derived by sorting the heat list by `chg`.
 */
const HOT_KEYS: Record<"US" | "HK", string> = {
  US: "hot_all-us",
  HK: "hot_all-hk",
};

function asPlain(row: unknown): Record<string, unknown> {
  if (row && typeof row === "object") {
    const anyRow = row as { toJSON?: () => unknown };
    if (typeof anyRow.toJSON === "function") {
      try {
        const j = anyRow.toJSON();
        if (j && typeof j === "object") return j as Record<string, unknown>;
      } catch {
        /* fall through */
      }
    }
    return row as Record<string, unknown>;
  }
  return {};
}

function field(
  o: Record<string, unknown>,
  ...keys: string[]
): string | number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (v == null || v === "") continue;
    if (typeof v === "string" || typeof v === "number") return v;
    if (typeof v === "object" && v && "toNumber" in v) {
      try {
        return (v as { toNumber: () => number }).toNumber();
      } catch {
        /* ignore */
      }
    }
    return String(v);
  }
  return undefined;
}

function num(v: string | number | null | undefined): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** API `chg` is a ratio (0.0252 = 2.52%). */
function toPercent(chgRatio: number): number {
  if (Math.abs(chgRatio) <= 1.5) return chgRatio * 100;
  return chgRatio;
}

export type RankQuote = Quote & { name?: string; source?: string };

function mapRankItem(row: unknown, assetType: AssetType): RankQuote | null {
  const o = asPlain(row);
  const rawCode = String(field(o, "code", "symbol") || "").replace(
    /\.(US|HK)$/i,
    "",
  );
  if (!rawCode) return null;
  const symbol = normalizeSymbol(rawCode, assetType);
  const price = num(field(o, "lastDone", "last_done"));
  if (!(price > 0)) return null;
  const change = num(field(o, "change"));
  const percentChange = toPercent(num(field(o, "chg")));
  const previousClose =
    change !== 0 || percentChange !== 0 ? price - change : price;
  const ampRatio = num(field(o, "amplitude"));
  const span = price * (ampRatio > 0 && ampRatio < 2 ? ampRatio / 2 : 0.01);
  const high = Math.max(price, previousClose) + span;
  const low = Math.max(0.0001, Math.min(price, previousClose) - span);
  const name = field(o, "name");

  return {
    symbol,
    assetType,
    price,
    change,
    percentChange,
    high,
    low,
    open: previousClose > 0 ? previousClose : price,
    previousClose: previousClose > 0 ? previousClose : price,
    timestamp: Math.floor(Date.now() / 1000),
    name: name != null ? String(name) : undefined,
    source: "longbridge",
  };
}

/** Shared heat list (cached) — one Longbridge call per market. */
async function getHeatQuotes(
  assetType: AssetType,
  market: "US" | "HK",
): Promise<RankQuote[]> {
  const cacheKey = `lb:rank:heat:v1:${assetType}`;
  return cachedFetch(cacheKey, 60_000, async () => {
    const ctx = await getMarketCtx();
    const key = HOT_KEYS[market];
    const resp = await ctx.rankList(key, false);
    const rows = (resp.lists ?? []) as unknown[];
    const out: RankQuote[] = [];
    for (const row of rows) {
      const q = mapRankItem(row, assetType);
      if (q) out.push(q);
    }
    if (!out.length) {
      throw new Error(`Longbridge hot rank empty (${key})`);
    }
    return out;
  });
}

function sliceBoard(heat: RankQuote[], board: RankBoard, limit: number): RankQuote[] {
  if (board === "hot") return heat.slice(0, limit);
  const sorted = [...heat].sort((a, b) =>
    board === "gainers"
      ? b.percentChange - a.percentChange
      : a.percentChange - b.percentChange,
  );
  return sorted.slice(0, limit);
}

/**
 * US/HK leaderboards via Longbridge MarketContext.rankList.
 * Hot = 热度排行; gainers/losers = same universe sorted by chg.
 */
export async function getLongbridgeRankList(
  assetType: AssetType,
  board: RankBoard,
  limit = 30,
): Promise<RankQuote[]> {
  if (!hasLongbridgeCreds()) {
    throw new Error("Longbridge not configured");
  }
  const market = marketCode(assetType);
  if (!market) {
    throw new Error("Rank lists are US/HK only");
  }
  const heat = await getHeatQuotes(assetType, market);
  return sliceBoard(heat, board, limit);
}

/** One Longbridge call → all three boards (avoids rate-limit stampede). */
export async function getLongbridgeRankBoards(
  assetType: AssetType,
  limit = 30,
): Promise<Record<RankBoard, RankQuote[]>> {
  if (!hasLongbridgeCreds()) {
    throw new Error("Longbridge not configured");
  }
  const market = marketCode(assetType);
  if (!market) {
    throw new Error("Rank lists are US/HK only");
  }
  const heat = await getHeatQuotes(assetType, market);
  return {
    hot: sliceBoard(heat, "hot", limit),
    gainers: sliceBoard(heat, "gainers", limit),
    losers: sliceBoard(heat, "losers", limit),
  };
}

export function isLongbridgeRankConfigured(): boolean {
  return hasLongbridgeCreds();
}
