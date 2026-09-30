/**
 * Tonghuashun Fuyao (扶摇) A-share REST client.
 * Docs: https://fuyao.aicubes.cn/docs/api-reference/overview/
 */
import { getMarketCreds } from "@/lib/market/creds-context";

const BASE = (
  process.env.FUYAO_API_BASE?.trim() || "https://fuyao.aicubes.cn"
).replace(/\/+$/, "");

export type FuyaoEnvelope<T> = {
  code: number;
  message?: string;
  request_id?: string;
  data: T | null;
};

export type FuyaoSnapshotItem = {
  thscode: string;
  ticker?: string;
  last_price?: number;
  price_change?: number;
  price_change_ratio_pct?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  prev_price?: number;
  volume?: number;
  turnover?: number;
};

export type FuyaoBarItem = {
  date_ms?: number;
  timestamp?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price?: number;
  volume?: number;
  turnover?: number;
};

export type FuyaoTickerHit = {
  thscode?: string;
  ticker?: string;
  name?: string;
  asset_type?: string;
  exchange?: string;
};

/** User BYOK or platform env. Prefer env when set. */
export function resolveFuyaoApiKey(): string | undefined {
  const fromEnv = process.env.FUYAO_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return getMarketCreds().fuyao?.apiKey?.trim() || undefined;
}

export function hasFuyaoCreds(): boolean {
  return Boolean(resolveFuyaoApiKey());
}

function apiKey(): string {
  const key = resolveFuyaoApiKey();
  if (!key) throw new Error("Fuyao API key is not set");
  return key;
}

async function fuyaoGet<T>(
  path: string,
  query: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === "") continue;
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-api-key": apiKey(), Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (res.status === 429) {
    throw new Error("Fuyao rate limited (HTTP 429)");
  }
  const body = (await res.json()) as FuyaoEnvelope<T>;
  if (body.code === 4001) {
    throw new Error("Fuyao rate limited (code=4001)");
  }
  if (body.code === 2001) {
    throw new Error("Fuyao auth failed (invalid X-api-key)");
  }
  if (body.code === 2003) {
    throw new Error("Fuyao permission denied for this capability");
  }
  if (body.code !== 0) {
    throw new Error(
      `Fuyao error code=${body.code}: ${body.message || "unknown"}`,
    );
  }
  if (body.data == null) {
    throw new Error("Fuyao returned empty data");
  }
  return body.data;
}

export async function fuyaoSnapshot(
  thscodes: string[],
): Promise<FuyaoSnapshotItem[]> {
  if (!thscodes.length) return [];
  const data = await fuyaoGet<{ item?: FuyaoSnapshotItem[] }>(
    "/api/a-share/prices/snapshot",
    { thscodes: thscodes.join(",") },
  );
  return data.item ?? [];
}

/** Daily bars; from/to are unix seconds. */
export async function fuyaoHistoricalDaily(
  thscode: string,
  fromSec: number,
  toSec: number,
): Promise<FuyaoBarItem[]> {
  const start = Math.max(0, fromSec) * 1000;
  const end = Math.max(start, toSec * 1000);
  const data = await fuyaoGet<{ item?: FuyaoBarItem[] }>(
    "/api/a-share/prices/historical",
    {
      thscode,
      interval: "1d",
      start,
      end,
      adjust: "forward",
    },
  );
  return data.item ?? [];
}

export async function fuyaoSearchTickers(
  q: string,
  limit = 20,
): Promise<FuyaoTickerHit[]> {
  const data = await fuyaoGet<{ item?: FuyaoTickerHit[] }>(
    "/api/meta/tickers/search",
    { q, asset_type: "a-share", limit },
  );
  return data.item ?? [];
}

/** Benchmark / THS board index snapshots (上证、深成、创业板、同花顺板块). */
export async function fuyaoIndexSnapshot(
  thscodes: string[],
): Promise<FuyaoSnapshotItem[]> {
  if (!thscodes.length) return [];
  const data = await fuyaoGet<{ item?: FuyaoSnapshotItem[] }>(
    "/api/a-share-index/prices/snapshot",
    { thscodes: thscodes.join(",") },
  );
  return data.item ?? [];
}

export type FuyaoThsIndexRow = {
  thscode?: string;
  name?: string;
};

/** THS index catalog: industry / concept / region / specialty. */
export async function fuyaoThsIndexList(
  tag: "industry" | "cn_concept" | "region" | "tszs" = "industry",
): Promise<FuyaoThsIndexRow[]> {
  const data = await fuyaoGet<{ item?: FuyaoThsIndexRow[] }>(
    "/api/a-share-index/catalog/ths-index-list",
    { tag },
  );
  return data.item ?? [];
}
