import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type {
  WarrantKind,
  WarrantRow,
  WarrantStatusKind,
} from "@/lib/market/providers/longbridge-warrants";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

type FutuWarrant = {
  code?: string;
  name?: string;
  sc_name?: string;
  tc_name?: string;
  type?: string;
  status?: string;
  cur_price?: number;
  change_rate?: number;
  recovery_price?: number;
  price_recovery_ratio?: number;
  effective_leverage?: number;
  leverage?: number;
  conversion_ratio?: number;
  break_even_point?: number;
};

const KIND_TO_FT: Record<WarrantKind, number> = {
  call: 1,
  put: 2,
  bull: 3,
  bear: 4,
  inline: 5,
};

const ALL_KINDS: WarrantKind[] = ["call", "put", "bull", "bear", "inline"];
const MAX_ROWS = 80;

function mapKind(raw: string | undefined): WarrantKind {
  const s = String(raw ?? "").toUpperCase();
  if (s === "PUT") return "put";
  if (s === "BULL") return "bull";
  if (s === "BEAR") return "bear";
  if (s === "INLINE") return "inline";
  return "call";
}

function mapStatus(raw: string | undefined): WarrantStatusKind {
  const s = String(raw ?? "").toUpperCase();
  if (s === "STOP_TRADE") return "suspend";
  if (s === "PENDING_LISTING") return "prepareList";
  if (s === "NORMAL") return "normal";
  return "unknown";
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapRow(w: FutuWarrant): WarrantRow | null {
  const symbol = String(w.code ?? "").trim();
  if (!symbol) return null;
  const name = String(w.sc_name || w.name || w.tc_name || "").trim();
  const last = Number(w.cur_price ?? 0);
  const chg = Number(w.change_rate);
  return {
    symbol,
    name,
    callPrice: numOrNull(w.recovery_price),
    toCallPrice: numOrNull(w.price_recovery_ratio),
    effectiveLeverage: numOrNull(w.effective_leverage),
    leverageRatio: numOrNull(w.leverage),
    conversionRatio: numOrNull(w.conversion_ratio),
    balancePoint: numOrNull(w.break_even_point),
    status: mapStatus(w.status),
    type: mapKind(w.type),
    last,
    chgPct: Number.isFinite(chg) ? chg : null,
  };
}

/**
 * HK warrant / CBBC list via Futu `warrant-screen`.
 * Prefer `stock_owner`; optionally filter WARRANT_TYPE (field_id=6).
 */
export async function fetchFutuWarrantList(
  symbol: string,
  assetType: AssetType,
  kinds?: WarrantKind[] | null,
): Promise<WarrantRow[]> {
  if (assetType !== "hk") {
    throw new MarketDataError("Futu warrants are HK-only", "futu");
  }
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }

  const owner = toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
  const selected =
    kinds?.length && kinds.length < ALL_KINDS.length
      ? [...new Set(kinds)].sort()
      : null;
  const typeKey = selected?.join(",") ?? "all";
  const key = `futu:warrant:v1:${owner}:${typeKey}`;

  return cachedFetch(key, 120_000, async () => {
    const body: Record<string, unknown> = {
      market_type: 1,
      stock_owner: owner,
      limit: MAX_ROWS,
      sorts: [{ sort_field_id: 10, sort_flag: true }], // volume desc
    };
    // Multiple type choices = OR within one WARRANT_TYPE group.
    if (selected?.length) {
      body.screen_groups = [
        {
          field_id: 6,
          choices: selected.map((k) => ({
            content_type: 1,
            value: KIND_TO_FT[k],
          })),
        },
      ];
    }

    const { data } = await futuRequest<{ warrants?: FutuWarrant[] }>(
      "POST",
      "/api/v1.0/quote/warrant-screen",
      { body },
    );

    const rows = (data.warrants ?? [])
      .map(mapRow)
      .filter((r): r is WarrantRow => Boolean(r));
    if (!rows.length) {
      throw new MarketDataError(`No Futu warrants for ${owner}`, "futu");
    }
    return rows.slice(0, MAX_ROWS);
  });
}
