import { cachedFetch } from "@/lib/cache";
import {
  hasLongbridgeHttpCreds,
  longbridgeHttpGet,
} from "@/lib/market/providers/longbridge-http";
import { normalizeSymbol } from "@/lib/market/symbols";
import type { AssetType } from "@/lib/types";

/** 上市中 / 已上市 / 提交中 */
export type IpoStatus = "listing" | "listed" | "filing";

export type IpoItem = {
  id: string;
  symbol: string;
  name: string;
  date: string;
  content?: string;
  assetType: AssetType;
  /** Only listed IPOs can open the symbol page */
  linkable: boolean;
  status: IpoStatus;
};

type RawRow = Record<string, unknown>;

type ListResponse = {
  code?: number;
  message?: string;
  data?: {
    list?: RawRow[];
    ipos?: RawRow[];
  };
};

const ENDPOINTS: Record<IpoStatus, string> = {
  filing: "/v1/ipo/subscriptions",
  listing: "/v1/ipo/wait-listing",
  listed: "/v1/ipo/listed",
};

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function formatDate(raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (typeof raw === "number" && Number.isFinite(raw)) {
    // unix seconds
    const ms = raw > 1e12 ? raw : raw * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = str(raw);
  // "20260922"
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  // "2026.09.25" / "2026-09-25"
  return s.replace(/\./g, "-").slice(0, 10);
}

function priceLabel(row: RawRow): string | undefined {
  const price = str(row.issue_price);
  if (!price || price === "0" || price === "0.000") return undefined;
  const cur = str(row.issue_currency || row.currency) || "HKD";
  return `发行价 ${price} ${cur}`;
}

function mapRow(row: RawRow, status: IpoStatus): IpoItem | null {
  const name = str(row.name);
  const code = str(row.code);
  const rawSym = str(row.symbol) || code;
  if (!name && !rawSym) return null;

  const assetType: AssetType = "hk";
  const bare = rawSym.replace(/\.HK$/i, "").replace(/\.US$/i, "") || code;
  const symbol = normalizeSymbol(bare, assetType);

  const date =
    formatDate(row.ipo_date) ||
    formatDate(row.sub_end_date) ||
    formatDate(row.sub_deadline) ||
    formatDate(row.result_date);

  let content = priceLabel(row);
  if (status === "filing") {
    const end = formatDate(row.sub_end_date);
    if (end) content = content ? `${content} · 截止 ${end}` : `截止 ${end}`;
  }
  if (status === "listed") {
    const chg = Number(row.ipo_change);
    if (Number.isFinite(chg) && chg !== 0) {
      const sign = chg > 0 ? "+" : "";
      content = content
        ? `${content} · 上市 ${sign}${chg.toFixed(2)}%`
        : `上市 ${sign}${chg.toFixed(2)}%`;
    }
  }

  return {
    id: `${status}:${str(row.counter_id) || symbol}`,
    symbol,
    name: name || symbol,
    date,
    content,
    assetType,
    linkable: status === "listed",
    status,
  };
}

function rowsOf(body: ListResponse): RawRow[] {
  const d = body.data;
  if (!d) return [];
  if (Array.isArray(d.list)) return d.list;
  if (Array.isArray(d.ipos)) return d.ipos;
  return [];
}

/**
 * HK IPO lists by stage:
 * - listing  上市中  → /v1/ipo/wait-listing
 * - listed   已上市  → /v1/ipo/listed
 * - filing   提交中  → /v1/ipo/subscriptions
 */
export async function getIpoList(
  status: IpoStatus,
  limit = 4,
): Promise<IpoItem[]> {
  if (!hasLongbridgeHttpCreds()) return [];

  const key = `lb:ipo:stage:v1:${status}:${limit}`;
  return cachedFetch(key, 180_000, async () => {
    const path = ENDPOINTS[status];
    const params =
      status === "listed" ? { page: 1, limit } : ({} as Record<string, number>);
    const body = await longbridgeHttpGet<ListResponse>(path, params);
    if (body.code != null && body.code !== 0) {
      throw new Error(body.message || `ipo ${status} code ${body.code}`);
    }
    return rowsOf(body)
      .map((row) => mapRow(row, status))
      .filter((x): x is IpoItem => x != null)
      .slice(0, limit);
  });
}

export function parseIpoStatus(raw: string | null | undefined): IpoStatus {
  if (raw === "listed" || raw === "filing" || raw === "listing") return raw;
  return "listing";
}
