import { unstable_cache } from "next/cache";
import { getQuotes } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { normalizeSymbol, type AssetType } from "@/lib/types";

/**
 * 首页行情快照。
 *
 * 刻意不走 WebSocket、也不走客户端定时轮询：服务器把四条指数/币价拉一次，
 * 缓存 60s，页面跟着 `revalidate = 60` 走。首页只做「有真东西」的证明，
 * 真正盯盘请在 /markets —— 那里才有推送。
 */

export type HomeSnapshotRow = {
  /** 稳定 id，用于 React key 与降级判断。 */
  id: string;
  /** 市场代码：CN / HK / US / CRYPTO（语言中立）。 */
  market: string;
  /** i18n key（market.*）或固定文本；为空时用 label。 */
  nameKey: string | null;
  label: string | null;
  price: number | null;
  percentChange: number | null;
};

export type HomeSnapshot = {
  /** 数据抓取时间（ISO）；失败为 null。 */
  asOf: string | null;
  rows: HomeSnapshotRow[];
};

const ITEMS: {
  id: string;
  symbol: string;
  assetType: AssetType;
  market: string;
  nameKey: string | null;
  label: string | null;
}[] = [
  {
    id: "IXIC",
    symbol: "IXIC",
    assetType: "stock",
    market: "US",
    nameKey: "indexIxic",
    label: null,
  },
  {
    id: "HSI",
    symbol: "HSI",
    assetType: "hk",
    market: "HK",
    nameKey: "indexHsi",
    label: null,
  },
  {
    id: "SSEC",
    symbol: "000001.SH",
    assetType: "cn",
    market: "CN",
    nameKey: "indexSsec",
    label: null,
  },
  {
    id: "BTC",
    symbol: "BTC",
    assetType: "crypto",
    market: "CRYPTO",
    nameKey: null,
    label: "BTC / USDT",
  },
];

/** 单条行情最多等 2.5s，拿不到就整卡降级，不拖首屏。 */
const TIMEOUT_MS = 2500;

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

function matchKey(symbol: string, assetType: AssetType): string {
  try {
    return normalizeSymbol(symbol, assetType).toUpperCase();
  } catch {
    return symbol.toUpperCase();
  }
}

async function fetchSnapshot(): Promise<HomeSnapshot> {
  const quotes = await withTimeout(
    withUserMarket(null, () =>
      getQuotes(ITEMS.map((i) => ({ symbol: i.symbol, assetType: i.assetType }))),
    ),
    TIMEOUT_MS,
  );

  if (!quotes?.length) return { asOf: null, rows: [] };

  const byKey = new Map<string, (typeof quotes)[number]>();
  for (const q of quotes) {
    byKey.set(q.symbol.toUpperCase(), q);
    byKey.set(matchKey(q.symbol, q.assetType), q);
  }

  const rows = ITEMS.map<HomeSnapshotRow>((item) => {
    const q = byKey.get(item.symbol.toUpperCase()) ?? byKey.get(matchKey(item.symbol, item.assetType));
    const ok = q != null && Number.isFinite(q.price) && q.price > 0;
    return {
      id: item.id,
      market: item.market,
      nameKey: item.nameKey,
      label: item.label,
      price: ok ? q!.price : null,
      percentChange: ok && Number.isFinite(q!.percentChange) ? q!.percentChange : null,
    };
  });

  const hasAny = rows.some((r) => r.price != null);
  return hasAny ? { asOf: new Date().toISOString(), rows } : { asOf: null, rows: [] };
}

/** 60s 缓存，与页面 revalidate 对齐；失败结果不缓存以外的副作用。 */
export const getHomeSnapshot = unstable_cache(fetchSnapshot, ["marketing-home-snapshot-v2"], {
  revalidate: 60,
});
