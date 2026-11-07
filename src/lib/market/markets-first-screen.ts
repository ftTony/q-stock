import { unstable_cache } from "next/cache";
import {
  emptyBoards,
  resolveRankBoards,
  type RankBoards,
} from "@/lib/market/rank-boards";
import { withUserMarket } from "@/lib/market/with-user-market";
import type { AssetType } from "@/lib/types";

/**
 * `/markets` 首屏榜单的服务端快照。
 *
 * 行情面板是纯客户端组件，全部数据靠 React Query 拉接口，SSR HTML 里只剩骨架
 * （「行情榜单 加载中…」、平均涨跌幅 +0.00%），首屏要等 JS + 一次往返才见数字。
 * 这里在服务端先取一份榜单，作为 `useMarketBoards` 的 initialData 注水：
 *
 * - 首屏 HTML 直接带真实报价（用户和爬虫都能看到内容）
 * - 客户端仍然是原来的 React Query，30s staleTime 后自行刷新，行为不变
 * - 只打一次服务端请求 + 60s 缓存，不新增 WS、不新增轮询
 *
 * 取数失败/超时一律返回空榜单，让客户端照常自己拉，不拖慢首屏。
 */

export type MarketsFirstScreen = {
  boards: RankBoards;
  /** 快照时间（ISO）；降级时为 null。 */
  asOf: string | null;
};

/** 榜单首屏的条数，与 useMarketBoards 的 limit=7 对齐。 */
const BOARD_LIMIT = 7;

/** 整体最多等 5s；provider 内部另有 4s 超时，这里再兜一层。 */
const TIMEOUT_MS = 5_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const id = setTimeout(() => resolve(null), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      () => {
        clearTimeout(id);
        resolve(null);
      },
    );
  });
}

async function fetchFirstScreen(assetType: AssetType): Promise<MarketsFirstScreen> {
  const result = await withTimeout(
    withUserMarket(null, () => resolveRankBoards(assetType, BOARD_LIMIT)),
    TIMEOUT_MS,
  );

  if (!result) return { boards: emptyBoards(), asOf: null };

  const { boards } = result;
  const hasAny =
    boards.hot.length > 0 ||
    boards.gainers.length > 0 ||
    boards.losers.length > 0;

  return hasAny
    ? { boards, asOf: new Date().toISOString() }
    : { boards: emptyBoards(), asOf: null };
}

/** 60s 缓存，与 `/markets` 的 revalidate 对齐。 */
export const getMarketsFirstScreen = unstable_cache(
  fetchFirstScreen,
  ["markets-first-screen-v1"],
  { revalidate: 60 },
);
