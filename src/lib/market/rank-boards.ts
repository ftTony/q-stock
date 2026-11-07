import { getQuotes } from "@/lib/market";
import { enrichUsExtendedBoards } from "@/lib/market/enrich-us-extended-boards";
import {
  getLongbridgeRankBoards,
  isLongbridgeRankConfigured,
} from "@/lib/market/providers/longbridge-rank";
import { getFutuRankBoards } from "@/lib/market/providers/futu-rank";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";
import {
  POPULAR_CN,
  POPULAR_CRYPTO,
  POPULAR_HK,
  POPULAR_STOCKS,
  type Quote,
} from "@/lib/types";

export type RankBoards = {
  hot: Quote[];
  gainers: Quote[];
  losers: Quote[];
};

export type RankBoardsResult = {
  boards: RankBoards;
  source: "longbridge" | "futu" | "popular" | "popular-fallback";
  degraded?: boolean;
};

/** Broker rank APIs can hang; fail fast so popular quotes can serve. */
const RANK_PROVIDER_TIMEOUT_MS = 4_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function sortBoards(quotes: Quote[], limit: number): RankBoards {
  const hot = quotes.slice(0, limit);
  const gainers = [...quotes]
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, limit);
  const losers = [...quotes]
    .sort((a, b) => a.percentChange - b.percentChange)
    .slice(0, limit);
  return { hot, gainers, losers };
}

function emptyBoards(): RankBoards {
  return { hot: [], gainers: [], losers: [] };
}

/**
 * 榜单三级取数：Longbridge → Futu → 热门标的兜底。
 *
 * 从 `/api/ranks` 抽出，供接口与服务端首屏（`/markets` 的 SSR 预取）共用，
 * 避免两处逻辑漂移。调用方需自行包 `withUserMarket()` 以带上用户凭证。
 */
export async function resolveRankBoards(
  assetType: "stock" | "hk" | "cn" | "crypto",
  limit = 15,
): Promise<RankBoardsResult> {
  if (assetType === "crypto") {
    const quotes = await getQuotes(
      POPULAR_CRYPTO.map((s) => ({
        symbol: s,
        assetType: "crypto" as const,
      })),
    );
    return {
      boards: { hot: quotes, gainers: [], losers: [] },
      source: "popular",
    };
  }

  if (isLongbridgeRankConfigured()) {
    try {
      let boards = await withTimeout(
        getLongbridgeRankBoards(assetType, limit),
        RANK_PROVIDER_TIMEOUT_MS,
        "longbridge ranks",
      );
      if (assetType === "stock") {
        boards = await enrichUsExtendedBoards(boards);
      }
      return { boards, source: "longbridge" };
    } catch (err) {
      console.warn(
        "[ranks] longbridge failed, fallback:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (assetType !== "cn" && isFutuConfigured()) {
    try {
      const boards = await withTimeout(
        getFutuRankBoards(assetType, limit),
        RANK_PROVIDER_TIMEOUT_MS,
        "futu ranks",
      );
      return { boards, source: "futu" };
    } catch (err) {
      console.warn(
        "[ranks] futu failed, fallback popular:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  const list =
    assetType === "hk"
      ? POPULAR_HK.map((s) => ({ symbol: s, assetType: "hk" as const }))
      : assetType === "cn"
        ? POPULAR_CN.map((s) => ({ symbol: s, assetType: "cn" as const }))
        : POPULAR_STOCKS.map((s) => ({
            symbol: s,
            assetType: "stock" as const,
          }));
  let quotes = await getQuotes(list);
  if (assetType === "stock") {
    const enriched = await enrichUsExtendedBoards({
      hot: quotes,
      gainers: quotes,
      losers: quotes,
    });
    quotes = enriched.hot;
  }
  return { boards: sortBoards(quotes, limit), source: "popular-fallback", degraded: true };
}

export { emptyBoards };
