import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type { IpoItem, IpoStatus } from "@/lib/market/ipo-types";
import { normalizeSymbol } from "@/lib/market/symbols";

/**
 * Futu HK IPO — https://open.futunn.com/zh-cn/api/quote/ipo/ipo-list
 * GET /api/v1.0/quote/ipo-list/hk
 * request_type: 9=可认购 10=待上市 11=即将上市(9+10)
 * Note: API does not return historical (已上市) IPOs.
 */

const REQUEST_TYPE: Record<Exclude<IpoStatus, "listed">, number> = {
  filing: 9,
  listing: 10,
};

type FutuIpoRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  list_time?: string;
  list_timestamp?: number;
  list_price?: number;
  ipo_price_min?: number;
  ipo_price_max?: number;
  entrance_price?: number;
  apply_end_time?: string;
  apply_end_timestamp?: number;
  is_subscribe_status?: boolean;
  lucky_ratio?: string;
  apply_multiple?: string;
};

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function formatDate(raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    const ms = raw > 1e12 ? raw : raw * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = str(raw);
  if (!s || s === "--") return "";
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return s.replace(/\./g, "-").slice(0, 10);
}

function priceContent(row: FutuIpoRow, status: IpoStatus): string | undefined {
  const min = Number(row.ipo_price_min ?? 0);
  const max = Number(row.ipo_price_max ?? 0);
  const list = Number(row.list_price ?? 0);
  let price: string | undefined;
  if (list > 0) {
    price = `招股 ${list} HKD`;
  } else if (min > 0 && max > 0 && min !== max) {
    price = `招股 ${min}-${max} HKD`;
  } else if (min > 0 || max > 0) {
    price = `招股 ${min || max} HKD`;
  }

  if (status === "filing") {
    const end =
      formatDate(row.apply_end_timestamp) || formatDate(row.apply_end_time);
    if (end) return price ? `${price} · 截止 ${end}` : `截止 ${end}`;
  }
  return price;
}

function mapRow(row: FutuIpoRow, status: IpoStatus): IpoItem | null {
  const code = str(row.code);
  if (!code) return null;
  const bare = code.replace(/^HK\./i, "");
  const symbol = normalizeSymbol(bare, "hk");
  const name =
    str(row.sc_name) || str(row.name) || str(row.tc_name) || symbol;
  const date =
    formatDate(row.list_timestamp) ||
    formatDate(row.list_time) ||
    formatDate(row.apply_end_timestamp) ||
    formatDate(row.apply_end_time);

  return {
    id: `futu:${status}:${code}`,
    symbol,
    name,
    date,
    content: priceContent(row, status),
    assetType: "hk",
    linkable: status === "listed",
    status,
  };
}

/** Docs show data.list; live API returns data as a bare array. */
function rowsOf(data: unknown): FutuIpoRow[] {
  if (Array.isArray(data)) return data as FutuIpoRow[];
  if (data && typeof data === "object") {
    const d = data as { list?: FutuIpoRow[]; ipo_list?: FutuIpoRow[] };
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.ipo_list)) return d.ipo_list;
  }
  return [];
}

/**
 * Fetch HK IPO list from Futu.
 * `listed` is unsupported by this endpoint → returns [].
 */
export async function getFutuIpoList(
  status: IpoStatus,
  limit = 4,
): Promise<IpoItem[]> {
  if (!isFutuConfigured()) return [];
  if (status === "listed") return [];

  const requestType = REQUEST_TYPE[status];
  const key = `futu:ipo:hk:v1:${status}:${limit}`;

  return cachedFetch(key, 180_000, async () => {
    const { data } = await futuRequest<unknown>(
      "GET",
      "/api/v1.0/quote/ipo-list/hk",
      { query: { request_type: requestType } },
    );
    return rowsOf(data)
      .map((row) => mapRow(row, status))
      .filter((x): x is IpoItem => x != null)
      .slice(0, limit);
  });
}
