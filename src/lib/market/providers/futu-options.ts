import { cachedFetch } from "@/lib/cache";
import {
  futuRequest,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type {
  OptionChainBundle,
  OptionRow,
} from "@/lib/market/providers/longbridge-research";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

type ExpirationItem = {
  strike_time?: string;
  option_expiry_date_distance?: number;
};

type ChainContract = {
  code?: string;
  option_type?: string;
  strike_time?: string;
  strike_price?: number;
};

type OptionSnap = {
  code?: string;
  last_price?: number;
  prev_close_price?: number;
  volume?: number;
  option_implied_volatility?: number;
  option_open_interest?: number;
  option_strike_price?: number;
};

const NEAR_SPOT = 18;

function assertOptionMarket(assetType: AssetType) {
  if (assetType !== "stock" && assetType !== "hk") {
    throw new MarketDataError("Futu options are US/HK only", "futu");
  }
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }
}

function pickNearSpot<T extends { strike: number }>(
  rows: T[],
  spot: number,
  take: number,
): T[] {
  if (!rows.length) return [];
  if (!(spot > 0)) return rows.slice(0, take);
  const sorted = [...rows].sort(
    (a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot),
  );
  return sorted.slice(0, take).sort((a, b) => a.strike - b.strike);
}

export async function fetchFutuOptionExpiries(
  symbol: string,
  assetType: AssetType,
): Promise<string[]> {
  assertOptionMarket(assetType);
  const code = toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
  const key = `futu:opt-exp:v1:${code}`;

  return cachedFetch(key, 300_000, async () => {
    const { data } = await futuRequest<{
      expiration_list?: ExpirationItem[];
    }>("GET", `/api/v1.0/quote/${encodeURIComponent(code)}/option-expiration`);

    const list = (data.expiration_list ?? [])
      .map((e) => String(e.strike_time ?? "").trim())
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    if (!list.length) {
      throw new MarketDataError(`No Futu option expiries for ${code}`, "futu");
    }
    return list.slice(0, 24);
  });
}

export async function fetchFutuOptionChain(
  symbol: string,
  assetType: AssetType,
  expiryYmd: string,
  spot: number,
): Promise<OptionChainBundle> {
  assertOptionMarket(assetType);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryYmd.trim())) {
    throw new MarketDataError("Invalid option expiry", "futu");
  }
  const code = toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
  const key = `futu:opt-chain:v1:${code}:${expiryYmd}:${Math.round(spot * 100)}`;

  return cachedFetch(key, 120_000, async () => {
    const { data } = await futuRequest<{ option_chain?: ChainContract[] }>(
      "GET",
      `/api/v1.0/quote/${encodeURIComponent(code)}/option-chain`,
      { query: { start: expiryYmd, end: expiryYmd } },
    );

    const contracts = (data.option_chain ?? []).filter(
      (c) => c.code && Number(c.strike_price) > 0,
    );
    if (!contracts.length) {
      throw new MarketDataError(
        `No Futu option contracts for ${code} @ ${expiryYmd}`,
        "futu",
      );
    }

    type Raw = { symbol: string; strike: number; side: "call" | "put" };
    const callsRaw: Raw[] = [];
    const putsRaw: Raw[] = [];
    for (const c of contracts) {
      const strike = Number(c.strike_price);
      const side =
        String(c.option_type ?? "").toUpperCase() === "PUT" ? "put" : "call";
      const row = { symbol: String(c.code), strike, side };
      if (side === "call") callsRaw.push(row);
      else putsRaw.push(row);
    }

    const callsPick = pickNearSpot(callsRaw, spot, NEAR_SPOT);
    const putsPick = pickNearSpot(putsRaw, spot, NEAR_SPOT);
    const codes = [...callsPick, ...putsPick].map((r) => r.symbol);
    const quoteMap = new Map<string, OptionRow>();

    try {
      for (let i = 0; i < codes.length; i += 80) {
        const chunk = codes.slice(i, i + 80);
        const { data: snapData } = await futuRequest<{
          snapshot_list?: OptionSnap[];
        }>("POST", "/api/v1.0/quote/snapshot", {
          body: { code_list: chunk },
        });
        for (const s of snapData.snapshot_list ?? []) {
          if (!s.code) continue;
          const last = Number(s.last_price ?? 0);
          const prev = Number(s.prev_close_price ?? 0);
          const iv = Number(s.option_implied_volatility ?? 0);
          quoteMap.set(s.code, {
            symbol: s.code,
            strike: Number(s.option_strike_price ?? 0) || 0,
            last,
            prevClose: prev,
            chgPct: prev > 0 ? ((last - prev) / prev) * 100 : null,
            iv: iv > 0 ? iv : null,
            oi: Number(s.option_open_interest ?? 0),
            volume: Number(s.volume ?? 0),
          });
        }
      }
    } catch (err) {
      console.warn(
        "[futu] option snapshot failed, returning strikes only:",
        err instanceof Error ? err.message : err,
      );
    }

    const toRows = (list: Raw[]): OptionRow[] =>
      list.map((c) => {
        const q = quoteMap.get(c.symbol);
        if (q) {
          return { ...q, strike: q.strike > 0 ? q.strike : c.strike };
        }
        return {
          symbol: c.symbol,
          strike: c.strike,
          last: 0,
          prevClose: 0,
          chgPct: null,
          iv: null,
          oi: 0,
          volume: 0,
        };
      });

    return {
      expiry: expiryYmd,
      calls: toRows(callsPick),
      puts: toRows(putsPick),
    };
  });
}
