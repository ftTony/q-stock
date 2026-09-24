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
 *
 * Official list excludes historical IPOs. 「已上市」uses the Recent IPOs plate
 * (HK.LIST1290 次新股) via plate-stock + basicinfo + snapshot.
 */

const REQUEST_TYPE: Record<Exclude<IpoStatus, "listed">, number> = {
  filing: 9,
  listing: 10,
};

/** Futu concept plate: Recent IPOs / 次新股 */
const LISTED_PLATE: Record<"hk", string> = {
  hk: "HK.LIST1290",
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
  apply_end_time?: string;
  apply_end_timestamp?: number;
};

type StockRow = {
  code?: string;
  stock_name?: string;
  sc_name?: string;
  tc_name?: string;
  stock_type?: string;
};

type BasicRow = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  listing_date?: number;
  state?: string;
  stock_type?: string;
};

type SnapRow = {
  code?: string;
  last_price?: number;
  prev_close_price?: number;
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

function rowsOf(data: unknown): FutuIpoRow[] {
  if (Array.isArray(data)) return data as FutuIpoRow[];
  if (data && typeof data === "object") {
    const d = data as { list?: FutuIpoRow[]; ipo_list?: FutuIpoRow[] };
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.ipo_list)) return d.ipo_list;
  }
  return [];
}

async function getFutuListedFromPlate(limit: number): Promise<IpoItem[]> {
  const plate = LISTED_PLATE.hk;
  const fetchLimit = Math.min(50, Math.max(limit * 4, 16));

  const { data: stockData } = await futuRequest<{ stock_list?: StockRow[] }>(
    "GET",
    "/api/v1.0/quote/plate-stock",
    { query: { plate_code: plate, limit: fetchLimit } },
  );

  const candidates = (stockData.stock_list ?? []).filter((s) => {
    if (!s.code) return false;
    const t = (s.stock_type || "STOCK").toUpperCase();
    // Prefer equities; skip warrants etc.
    return t === "STOCK" || t === "EQTY" || t === "";
  });
  if (!candidates.length) return [];

  const codes = candidates.map((s) => s.code!);
  const [basicRes, snapRes] = await Promise.all([
    futuRequest<{ basic_list?: BasicRow[] }>(
      "POST",
      "/api/v1.0/quote/stock-basicinfo",
      { body: { code_list: codes } },
    ),
    futuRequest<{ snapshot_list?: SnapRow[] }>(
      "POST",
      "/api/v1.0/quote/snapshot",
      { body: { code_list: codes } },
    ),
  ]);

  const basicByCode = new Map(
    (basicRes.data.basic_list ?? [])
      .filter((b) => b.code)
      .map((b) => [b.code!, b]),
  );
  const snapByCode = new Map(
    (snapRes.data.snapshot_list ?? [])
      .filter((s) => s.code)
      .map((s) => [s.code!, s]),
  );

  const ranked = candidates
    .map((s) => {
      const code = s.code!;
      const basic = basicByCode.get(code);
      const snap = snapByCode.get(code);
      const listingMs = Number(basic?.listing_date ?? 0);
      const state = (basic?.state || "NORMAL").toUpperCase();
      if (state === "DELISTED") return null;
      const bare = code.replace(/^HK\./i, "");
      const symbol = normalizeSymbol(bare, "hk");
      const name =
        str(basic?.sc_name) ||
        str(s.sc_name) ||
        str(basic?.name) ||
        str(s.stock_name) ||
        symbol;
      const last = Number(snap?.last_price ?? 0);
      const prev = Number(snap?.prev_close_price ?? 0);
      let content: string | undefined;
      if (prev > 0 && Number.isFinite(last)) {
        const chg = ((last - prev) / prev) * 100;
        const sign = chg > 0 ? "+" : "";
        content = `上市 ${sign}${chg.toFixed(2)}%`;
      }
      return {
        listingMs: listingMs > 0 ? listingMs : 0,
        item: {
          id: `futu:listed:${code}`,
          symbol,
          name,
          date: formatDate(listingMs),
          content,
          assetType: "hk" as const,
          linkable: true,
          status: "listed" as const,
        } satisfies IpoItem,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => b.listingMs - a.listingMs)
    .slice(0, limit)
    .map((x) => x.item);

  return ranked;
}

/**
 * Fetch HK IPO list from Futu.
 * filing/listing → ipo-list/hk; listed → 次新股 plate.
 */
export async function getFutuIpoList(
  status: IpoStatus,
  limit = 4,
): Promise<IpoItem[]> {
  if (!isFutuConfigured()) return [];

  const key = `futu:ipo:hk:v2:${status}:${limit}`;

  return cachedFetch(key, 180_000, async () => {
    if (status === "listed") {
      return getFutuListedFromPlate(limit);
    }

    const requestType = REQUEST_TYPE[status];
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
