import { unstable_cache } from "next/cache";
import { getProvider } from "@/lib/market/router";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { normalizeSymbol, type AssetType } from "@/lib/types";

/**
 * 首页行情快照。
 *
 * 不用完整 `getQuotes` failover：那条链会先等 Longbridge（可达 20s），
 * 首页却只愿等几秒 → 必然空态。这里改为平台 provider 并行短超时，
 * 有价优先合并；失败软降级，不拖首屏。盯盘仍去 /markets。
 */

export type HomeSnapshotRow = {
  id: string;
  market: string;
  nameKey: string | null;
  label: string | null;
  price: number | null;
  percentChange: number | null;
};

export type HomeSnapshot = {
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

/** 单路超时：Futu 指数通常 <1s；超时直接弃掉该路，不拖整卡。 */
const TIMEOUT_MS = 5000;

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

async function safeQuotes(
  provider: MarketDataProvider | undefined,
  items: { symbol: string; assetType: AssetType }[],
): Promise<QuoteWithSource[]> {
  if (!provider?.isConfigured() || !items.length) return [];
  try {
    return (
      (await withTimeout(provider.getQuotes(items), TIMEOUT_MS)) ?? []
    ).filter((q) => Number.isFinite(q.price) && q.price > 0);
  } catch {
    return [];
  }
}

/** 按顺序合并：先到的有效价保留（调用方控制 provider 优先级）。 */
function mergeQuotes(batches: QuoteWithSource[][]): QuoteWithSource[] {
  const map = new Map<string, QuoteWithSource>();
  for (const batch of batches) {
    for (const q of batch) {
      const key = `${q.assetType}:${matchKey(q.symbol, q.assetType)}`;
      if (!map.has(key)) map.set(key, q);
    }
  }
  return [...map.values()];
}

async function fetchEquityQuotes(
  items: { symbol: string; assetType: AssetType }[],
): Promise<QuoteWithSource[]> {
  // Futu 指数通常亚秒级；凑齐就返回，避免被 Longbridge 拖满超时。
  const futu = await safeQuotes(getProvider("futu"), items);
  if (futu.length >= items.length) return futu;

  const [lb, fh] = await Promise.all([
    safeQuotes(getProvider("longbridge"), items),
    safeQuotes(getProvider("finnhub"), items),
  ]);
  return mergeQuotes([futu, lb, fh]);
}

async function fetchCryptoQuotes(
  items: { symbol: string; assetType: AssetType }[],
): Promise<QuoteWithSource[]> {
  // Finnhub 币价通常比 Binance 更稳；失败再试 Binance。
  const fh = await safeQuotes(getProvider("finnhub"), items);
  if (fh.length) return fh;
  return safeQuotes(getProvider("binance"), items);
}

async function fetchFastQuotes(): Promise<QuoteWithSource[]> {
  const equityItems = ITEMS.filter((i) => i.assetType !== "crypto").map(
    (i) => ({ symbol: i.symbol, assetType: i.assetType }),
  );
  const cryptoItems = ITEMS.filter((i) => i.assetType === "crypto").map(
    (i) => ({ symbol: i.symbol, assetType: i.assetType }),
  );

  const [equity, crypto] = await Promise.all([
    fetchEquityQuotes(equityItems),
    fetchCryptoQuotes(cryptoItems),
  ]);
  return [...equity, ...crypto];
}

async function fetchSnapshot(): Promise<HomeSnapshot> {
  const quotes = await fetchFastQuotes();
  if (!quotes.length) return { asOf: null, rows: [] };

  const byKey = new Map<string, QuoteWithSource>();
  for (const q of quotes) {
    byKey.set(q.symbol.toUpperCase(), q);
    byKey.set(matchKey(q.symbol, q.assetType), q);
  }

  const rows = ITEMS.map<HomeSnapshotRow>((item) => {
    const q =
      byKey.get(item.symbol.toUpperCase()) ??
      byKey.get(matchKey(item.symbol, item.assetType));
    const ok = q != null && Number.isFinite(q.price) && q.price > 0;
    return {
      id: item.id,
      market: item.market,
      nameKey: item.nameKey,
      label: item.label,
      price: ok ? q!.price : null,
      percentChange:
        ok && Number.isFinite(q!.percentChange) ? q!.percentChange : null,
    };
  });

  const hasAny = rows.some((r) => r.price != null);
  return hasAny
    ? { asOf: new Date().toISOString(), rows }
    : { asOf: null, rows: [] };
}

/** v3：并行快路径，避开旧版空结果缓存。 */
export const getHomeSnapshot = unstable_cache(
  fetchSnapshot,
  ["marketing-home-snapshot-v3"],
  { revalidate: 60 },
);
