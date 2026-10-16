import { cachedFetch } from "@/lib/cache";
import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
  loadLb,
} from "@/lib/market/providers/longbridge-client";
import { normalizeSymbol, toLongbridgeSymbol } from "@/lib/market/symbols";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

export type CapitalBucket = { large: number; medium: number; small: number };

export type CapitalSnapshot = {
  timestamp: number;
  inflow: CapitalBucket;
  outflow: CapitalBucket;
};

export type ShortRow = {
  timestamp: string;
  rate: number | null;
  close: number | null;
  totalAmount: number | null;
  amount: number | null;
  balance: number | null;
};

export type OptionExpiry = string; // YYYY-MM-DD

export type OptionRow = {
  symbol: string;
  strike: number;
  last: number;
  prevClose: number;
  chgPct: number | null;
  iv: number | null;
  oi: number;
  volume: number;
};

export type OptionChainBundle = {
  expiry: string;
  calls: OptionRow[];
  puts: OptionRow[];
};

function assertEquity(assetType: AssetType) {
  if (assetType === "crypto") {
    throw new MarketDataError("Longbridge research is equity-only", "longbridge");
  }
}

function requireLb(symbol: string, assetType: AssetType) {
  assertEquity(assetType);
  if (!hasLongbridgeCreds()) {
    throw new MarketDataError(
      "Longbridge credentials not configured",
      "longbridge",
    );
  }
  const normalized = normalizeSymbol(symbol, assetType);
  return toLongbridgeSymbol(normalized, assetType);
}

function mapOptionApiError(err: unknown, lbSym: string): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (/connections limitation/i.test(msg)) {
    throw new MarketDataError(
      "Longbridge quote connections exhausted — wait 1–5 min and retry",
      "longbridge",
    );
  }
  // 404000 / no USOption package — expiry list may still return dates.
  if (/404000|api not found|no access to the market/i.test(msg)) {
    throw new MarketDataError(
      `Longbridge OpenAPI has no option-chain access for ${lbSym} (USOption / HK options package required in Quotes Store)`,
      "longbridge",
    );
  }
  throw err instanceof Error ? err : new Error(msg);
}

/** Soft check: package keys that usually unlock option chain OpenAPI. */
async function hasOptionQuotePackage(assetType: AssetType): Promise<boolean | null> {
  try {
    const ctx = await getQuoteCtx();
    const pkgs = await ctx.quotePackageDetails();
    const keys = (pkgs ?? []).map((p) => String(p.key ?? "").toUpperCase());
    if (!keys.length) return null;
    // Only treat explicit option/warrant packages as access (not HK_L2 equity).
    if (assetType === "hk") {
      return keys.some(
        (k) => k.includes("OPTION") || k.includes("WARRANT"),
      );
    }
    return keys.some(
      (k) =>
        k.includes("USOPTION") ||
        k.includes("US_OPTION") ||
        (k.includes("OPTION") && k.includes("US")),
    );
  } catch {
    return null;
  }
}

function bucket(d: {
  large: { toNumber(): number };
  medium: { toNumber(): number };
  small: { toNumber(): number };
}): CapitalBucket {
  return {
    large: dec(d.large),
    medium: dec(d.medium),
    small: dec(d.small),
  };
}

export async function fetchLbCapital(
  symbol: string,
  assetType: AssetType,
): Promise<CapitalSnapshot> {
  const lbSym = requireLb(symbol, assetType);
  return cachedFetch(`lb:capital:${lbSym}`, 300_000, async () => {
    const ctx = await getQuoteCtx();
    try {
      const row = await ctx.capitalDistribution(lbSym);
      const inflow = bucket(row.capitalIn);
      const outflow = bucket(row.capitalOut);
      const sum =
        inflow.large +
        inflow.medium +
        inflow.small +
        outflow.large +
        outflow.medium +
        outflow.small;
      if (sum > 0) {
        return {
          timestamp: Math.floor(
            (row.timestamp?.getTime?.() ?? Date.now()) / 1000,
          ),
          inflow,
          outflow,
        };
      }
    } catch (err) {
      console.warn(
        "[longbridge] capitalDistribution failed:",
        err instanceof Error ? err.message : err,
      );
    }

    // Fallback: aggregate capitalFlow series into a single "medium" net bucket
    const lines = await ctx.capitalFlow(lbSym);
    let inSum = 0;
    let outSum = 0;
    let lastTs = Date.now();
    for (const line of lines ?? []) {
      const v = dec(line.inflow);
      if (v > 0) inSum += v;
      else if (v < 0) outSum += -v;
      if (line.timestamp?.getTime) lastTs = line.timestamp.getTime();
    }
    if (!(inSum > 0 || outSum > 0)) {
      throw new MarketDataError(`No capital data for ${lbSym}`, "longbridge");
    }
    return {
      timestamp: Math.floor(lastTs / 1000),
      inflow: { large: 0, medium: inSum, small: 0 },
      outflow: { large: 0, medium: outSum, small: 0 },
    };
  });
}

export async function fetchLbShort(
  symbol: string,
  assetType: AssetType,
  count = 30,
): Promise<ShortRow[]> {
  const lbSym = requireLb(symbol, assetType);
  const n = Math.min(60, Math.max(1, count));
  return cachedFetch(`lb:short:${lbSym}:${n}`, 600_000, async () => {
    const ctx = await getQuoteCtx();
    const resp = await ctx.shortTrades(lbSym, n);
    const rows = resp?.data ?? [];
    const out: ShortRow[] = [];
    for (const r of rows) {
      const rate = Number(r.rate);
      const close = Number(r.close);
      const totalAmount = Number(r.totalAmount);
      const amount = Number(r.amount);
      const balance = Number(r.balance);
      out.push({
        timestamp: String(r.timestamp ?? ""),
        rate: Number.isFinite(rate) ? rate : null,
        close: Number.isFinite(close) ? close : null,
        totalAmount: Number.isFinite(totalAmount) ? totalAmount : null,
        amount: Number.isFinite(amount) ? amount : null,
        balance: Number.isFinite(balance) ? balance : null,
      });
    }
    if (!out.length) {
      throw new MarketDataError(`No short data for ${lbSym}`, "longbridge");
    }
    return out;
  });
}

function formatNaiveDate(d: {
  year: number;
  month: number;
  day: number;
}): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

/** US equity option expiries are Eastern calendar dates. */
function usEasternYmd(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

export async function fetchLbOptionExpiries(
  symbol: string,
  assetType: AssetType,
): Promise<OptionExpiry[]> {
  const lbSym = requireLb(symbol, assetType);
  return cachedFetch(`lb:opt-exp:v3:${lbSym}`, 600_000, async () => {
    const pkgOk = await hasOptionQuotePackage(assetType);
    if (pkgOk === false) {
      throw new MarketDataError(
        `Longbridge OpenAPI has no option-chain access for ${lbSym} (USOption / HK options package required in Quotes Store)`,
        "longbridge",
      );
    }
    const ctx = await getQuoteCtx();
    let dates;
    try {
      dates = await ctx.optionChainExpiryDateList(lbSym);
    } catch (err) {
      mapOptionApiError(err, lbSym);
    }
    const todayYmd = usEasternYmd();
    const out: string[] = [];
    for (const d of dates ?? []) {
      const ymd = formatNaiveDate(d);
      if (ymd >= todayYmd) out.push(ymd);
    }
    // If all expired (clock skew), keep raw list
    const list = out.length ? out : (dates ?? []).map(formatNaiveDate);
    if (!list.length) {
      throw new MarketDataError(`No option expiries for ${lbSym}`, "longbridge");
    }
    return list.slice(0, 24);
  });
}

function ymdParts(ymd: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
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

/** Longbridge OptionDirection: Unknown=0 Put=1 Call=2 (const enum — use literals). */
function isCallDirection(direction: unknown, optSym: string): boolean {
  const n = Number(direction);
  if (n === 2) return true;
  if (n === 1) return false;
  const s = String(direction ?? "").toLowerCase();
  if (s === "call" || s.includes("call")) return true;
  if (s === "put" || s.includes("put")) return false;
  // OCC: AAPL250117C00190000.US
  if (/\dC\d/.test(optSym)) return true;
  if (/\dP\d/.test(optSym)) return false;
  return false;
}

type ChainRow = { symbol: string; strike: number; side: "call" | "put" };

function parseChainContracts(contracts: unknown[]): ChainRow[] {
  const out: ChainRow[] = [];
  for (const raw of contracts ?? []) {
    const c = raw as {
      symbol?: string;
      strikePrice?: { toNumber(): number } | number | string;
      direction?: unknown;
      toJSON?: () => Record<string, unknown>;
    };
    const j =
      typeof c.toJSON === "function"
        ? (c.toJSON() as Record<string, unknown>)
        : null;

    // New SDK: one contract per side
    const sym = String(c.symbol ?? j?.symbol ?? "").trim();
    const strikeRaw = c.strikePrice ?? j?.strike_price ?? j?.strikePrice;
    const strike =
      strikeRaw != null && typeof strikeRaw === "object" && "toNumber" in strikeRaw
        ? dec(strikeRaw as { toNumber(): number })
        : Number(strikeRaw);

    if (sym && strike > 0) {
      const dir = c.direction ?? j?.direction;
      out.push({
        symbol: sym,
        strike,
        side: isCallDirection(dir, sym) ? "call" : "put",
      });
      continue;
    }

    // Legacy strike row: call_symbol + put_symbol on same strike
    const price = Number(j?.price ?? j?.strike_price ?? 0);
    const callSym = String(j?.call_symbol ?? j?.callSymbol ?? "").trim();
    const putSym = String(j?.put_symbol ?? j?.putSymbol ?? "").trim();
    if (price > 0 && (callSym || putSym)) {
      if (callSym) out.push({ symbol: callSym, strike: price, side: "call" });
      if (putSym) out.push({ symbol: putSym, strike: price, side: "put" });
    }
  }
  return out;
}

export async function fetchLbOptionChain(
  symbol: string,
  assetType: AssetType,
  expiryYmd: string,
  spot: number,
): Promise<OptionChainBundle> {
  const lbSym = requireLb(symbol, assetType);
  const parts = ymdParts(expiryYmd);
  if (!parts) {
    throw new MarketDataError("Invalid option expiry", "longbridge");
  }
  const key = `lb:opt-chain:v3:${lbSym}:${expiryYmd}:${Math.round(spot * 100)}`;

  return cachedFetch(key, 120_000, async () => {
    const lb = await loadLb();
    const ctx = await getQuoteCtx();
    const naive = new lb.NaiveDate(parts.y, parts.m, parts.d);

    const pkgOk = await hasOptionQuotePackage(assetType);
    if (pkgOk === false) {
      throw new MarketDataError(
        `Longbridge OpenAPI has no option-chain access for ${lbSym} (USOption / HK options package required in Quotes Store)`,
        "longbridge",
      );
    }

    let contracts: unknown[] = [];
    try {
      // Prefer full chain; standardOnly can return empty on some packages.
      contracts = (await ctx.optionChainInfoByDate(lbSym, naive, false)) ?? [];
      if (!contracts.length) {
        contracts = (await ctx.optionChainInfoByDate(lbSym, naive, true)) ?? [];
      }
      if (!contracts.length) {
        contracts = (await ctx.optionChainInfoByDate(lbSym, naive)) ?? [];
      }
    } catch (err) {
      mapOptionApiError(err, lbSym);
    }

    const parsed = parseChainContracts(contracts);
    const callsRaw = parsed.filter((r) => r.side === "call");
    const putsRaw = parsed.filter((r) => r.side === "put");

    if (!callsRaw.length && !putsRaw.length) {
      throw new MarketDataError(
        `No option contracts for ${lbSym} @ ${expiryYmd}`,
        "longbridge",
      );
    }

    const callsPick = pickNearSpot(callsRaw, spot, 12);
    const putsPick = pickNearSpot(putsRaw, spot, 12);
    const symbols = [...callsPick, ...putsPick].map((c) => c.symbol);
    const quoteMap = new Map<string, OptionRow>();

    try {
      for (let i = 0; i < symbols.length; i += 20) {
        const chunk = symbols.slice(i, i + 20);
        const quotes = await ctx.optionQuote(chunk);
        for (const q of quotes ?? []) {
          const last = dec(q.lastDone);
          const prev = dec(q.prevClose);
          const iv = dec(q.impliedVolatility);
          quoteMap.set(q.symbol, {
            symbol: q.symbol,
            strike: dec(q.strikePrice) || 0,
            last,
            prevClose: prev,
            chgPct: prev > 0 ? ((last - prev) / prev) * 100 : null,
            iv: iv > 0 ? iv : null,
            oi: Number(q.openInterest ?? 0),
            volume: Number(q.volume ?? 0),
          });
        }
      }
    } catch (err) {
      console.warn(
        "[longbridge] optionQuote failed, returning strikes only:",
        err instanceof Error ? err.message : err,
      );
    }

    const toRows = (list: ChainRow[]) =>
      list.map((c) => {
        const q = quoteMap.get(c.symbol);
        return (
          q ?? {
            symbol: c.symbol,
            strike: c.strike,
            last: 0,
            prevClose: 0,
            chgPct: null,
            iv: null,
            oi: 0,
            volume: 0,
          }
        );
      });

    return {
      expiry: expiryYmd,
      calls: toRows(callsPick),
      puts: toRows(putsPick),
    };
  });
}
