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
  bid_price?: number;
  ask_price?: number;
  bid_vol?: number;
  ask_vol?: number;
  bid_ask_ratio?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
};

function assertOptionMarket(assetType: AssetType) {
  if (assetType !== "stock" && assetType !== "hk") {
    throw new MarketDataError("Futu options are US/HK only", "futu");
  }
  if (!isFutuConfigured()) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }
}

function sortByStrike<T extends { strike: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.strike - b.strike);
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
  _spot: number,
): Promise<OptionChainBundle> {
  assertOptionMarket(assetType);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryYmd.trim())) {
    throw new MarketDataError("Invalid option expiry", "futu");
  }
  const code = toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
  const key = `futu:opt-chain:v2:${code}:${expiryYmd}`;

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
      const side: Raw["side"] =
        String(c.option_type ?? "").toUpperCase() === "PUT" ? "put" : "call";
      const row: Raw = { symbol: String(c.code), strike, side };
      if (side === "call") callsRaw.push(row);
      else putsRaw.push(row);
    }

    // Full chain — UI scroll owns density; do not near-spot truncate.
    const callsPick = sortByStrike(callsRaw);
    const putsPick = sortByStrike(putsRaw);
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
            bid: Number(s.bid_price ?? 0) > 0 ? Number(s.bid_price) : null,
            ask: Number(s.ask_price ?? 0) > 0 ? Number(s.ask_price) : null,
            bidVol: Number(s.bid_vol ?? 0) > 0 ? Number(s.bid_vol) : null,
            askVol: Number(s.ask_vol ?? 0) > 0 ? Number(s.ask_vol) : null,
            bidAskRatio:
              s.bid_ask_ratio != null && Number(s.bid_ask_ratio) !== 0
                ? Number(s.bid_ask_ratio)
                : null,
            open: Number(s.open_price ?? 0) > 0 ? Number(s.open_price) : null,
            high: Number(s.high_price ?? 0) > 0 ? Number(s.high_price) : null,
            low: Number(s.low_price ?? 0) > 0 ? Number(s.low_price) : null,
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

export type OptionExpiryStat = {
  iv: number | null;
  expectedMove: number | null;
  callVolume: number | null;
  putVolume: number | null;
};

/** Futu desk header: underlying IV/HV + per-expiry IV / EM / volumes. */
export type OptionChainStats = {
  underlyingIv: number | null;
  underlyingHv: number | null;
  byExpiry: Record<string, OptionExpiryStat>;
};

type StatisticItem = {
  strike_date?: string;
  iv?: number;
  expected_move?: number;
  call_volume?: string | number;
  put_volume?: string | number;
};

function numOrNull(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Desk IV / EM / volumes — same payload as Futu option-chain header
 * (`underlying_iv` ≈ 64.85%, expiry `iv` ≈ 88.78%, `expected_move` ≈ 4.768).
 */
export async function fetchFutuOptionChainStatistic(
  symbol: string,
  assetType: AssetType,
): Promise<OptionChainStats> {
  assertOptionMarket(assetType);
  const code = toFutuSymbol(normalizeSymbol(symbol, assetType), assetType);
  const key = `futu:opt-stats:v1:${code}`;

  return cachedFetch(key, 60_000, async () => {
    const { data } = await futuRequest<{
      underlying_iv?: number;
      underlying_hv?: number;
      items?: StatisticItem[];
    }>("GET", `/api/v1.0/quote/${encodeURIComponent(code)}/option-chain-statistic`);

    const byExpiry: Record<string, OptionExpiryStat> = {};
    for (const item of data.items ?? []) {
      const ymd = String(item.strike_date ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) continue;
      // Prefer the row that carries volume when Futu duplicates a strike_date.
      const prev = byExpiry[ymd];
      const callVolume = numOrNull(item.call_volume);
      const putVolume = numOrNull(item.put_volume);
      const next: OptionExpiryStat = {
        iv: numOrNull(item.iv),
        expectedMove: numOrNull(item.expected_move),
        callVolume,
        putVolume,
      };
      if (
        !prev ||
        ((callVolume ?? 0) + (putVolume ?? 0) >
          (prev.callVolume ?? 0) + (prev.putVolume ?? 0))
      ) {
        byExpiry[ymd] = next;
      }
    }

    return {
      underlyingIv: numOrNull(data.underlying_iv),
      underlyingHv: numOrNull(data.underlying_hv),
      byExpiry,
    };
  });
}
