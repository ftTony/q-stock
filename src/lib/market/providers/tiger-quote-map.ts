import type {
  AssetType,
  ExtendedSessionQuote,
  OhlcvBar,
  QuoteSession,
} from "@/lib/types";
import type { QuoteWithSource } from "@/lib/market/types";
import { getUsMarketPhase } from "@/lib/market/session";
import {
  applyActiveExtendedPrice,
} from "@/lib/market/providers/longbridge-quote-map";

/** Raw brief from quote_real_time (camelCase or snake_case). */
export type TigerBriefRaw = Record<string, unknown>;

export type TigerKlineItem = {
  time?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type TigerKlineBlock = {
  symbol?: string;
  period?: string;
  items?: TigerKlineItem[];
  nextPageToken?: string;
  next_page_token?: string;
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pick(raw: TigerBriefRaw, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] != null) return raw[k];
  }
  return undefined;
}

function msToSec(ms?: number): number {
  if (!ms) return Math.floor(Date.now() / 1000);
  return ms > 1e12 ? Math.floor(ms / 1000) : Math.floor(ms);
}

/** Tiger changeRate is a fraction (0.032 → 3.2%). */
function toPercent(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  return Math.abs(rate) <= 1 ? rate * 100 : rate;
}

function hourTag(raw: TigerBriefRaw): string {
  const nested = pick(raw, "hourTrading", "hour_trading");
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    return String(o.tag ?? o.hourTradingTag ?? o.hour_trading_tag ?? "").trim();
  }
  return String(
    pick(raw, "hourTradingTag", "hour_trading_tag") ?? "",
  ).trim();
}

function hourField(raw: TigerBriefRaw, camel: string, snake: string): unknown {
  const nested = pick(raw, "hourTrading", "hour_trading");
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    if (o[camel] != null) return o[camel];
    if (o[snake] != null) return o[snake];
    // Nested may also use hour_trading_* keys.
    const prefixed = `hour_trading_${snake.replace(/^hour_trading_/, "")}`;
    if (o[prefixed] != null) return o[prefixed];
  }
  // Flat brief fields only — never read root `latestPrice` / `change` here.
  const flatCamel =
    "hourTrading" + camel[0]!.toUpperCase() + camel.slice(1);
  return pick(raw, snake, flatCamel);
}

function mapHourTrading(raw: TigerBriefRaw): ExtendedSessionQuote | undefined {
  const price = num(
    hourField(raw, "latestPrice", "hour_trading_latest_price") ??
      pick(raw, "hourTradingLatestPrice", "hour_trading_latest_price"),
  );
  if (!(price > 0)) return undefined;
  const prev = num(
    hourField(raw, "preClose", "hour_trading_pre_close") ??
      pick(raw, "hourTradingPreClose", "hour_trading_pre_close"),
  );
  const change = num(
    hourField(raw, "change", "hour_trading_change") ??
      pick(raw, "hourTradingChange", "hour_trading_change") ??
      (prev > 0 ? price - prev : 0),
  );
  const rateRaw = num(
    hourField(raw, "changeRate", "hour_trading_change_rate") ??
      pick(raw, "hourTradingChangeRate", "hour_trading_change_rate"),
  );
  const volume = num(
    hourField(raw, "volume", "hour_trading_volume") ??
      pick(raw, "hourTradingVolume", "hour_trading_volume"),
  );
  const ts = num(
    hourField(raw, "timestamp", "hour_trading_timestamp") ??
      pick(raw, "hourTradingTimestamp", "hour_trading_timestamp"),
  );
  return {
    price,
    change,
    percentChange:
      rateRaw !== 0
        ? toPercent(rateRaw)
        : prev > 0
          ? (change / prev) * 100
          : 0,
    ...(ts > 0 ? { timestamp: msToSec(ts) } : {}),
    ...(volume > 0 ? { volume } : {}),
  };
}

function sessionFromTag(tag: string): QuoteSession | undefined {
  const t = tag.toLowerCase();
  if (t.includes("pre")) return "pre";
  if (t.includes("post") || t.includes("after")) return "post";
  if (t.includes("over") || t.includes("night")) return "overnight";
  return undefined;
}

export function mapTigerBrief(
  raw: TigerBriefRaw,
  normalized: string,
  assetType: AssetType,
): QuoteWithSource | null {
  const price = num(pick(raw, "latestPrice", "latest_price"));
  if (!(price > 0)) return null;

  const prev = num(pick(raw, "preClose", "pre_close", "adjPreClose", "adj_pre_close"));
  const change = num(
    pick(raw, "change") ?? (prev > 0 ? price - prev : 0),
  );
  const rateRaw = num(pick(raw, "changeRate", "change_rate"));
  const volume = num(pick(raw, "volume"));
  const turnover = num(pick(raw, "amount"));
  const bid = num(pick(raw, "bidPrice", "bid_price"));
  const ask = num(pick(raw, "askPrice", "ask_price"));
  const bidSize = num(pick(raw, "bidSize", "bid_size"));
  const askSize = num(pick(raw, "askSize", "ask_size"));
  const latestTime = num(pick(raw, "latestTime", "latest_time"));

  const tag = hourTag(raw);
  const hour = mapHourTrading(raw);
  let preMarket: ExtendedSessionQuote | undefined;
  let postMarket: ExtendedSessionQuote | undefined;
  let overnight: ExtendedSessionQuote | undefined;
  const tagged = sessionFromTag(tag);
  if (hour) {
    if (tagged === "pre") preMarket = hour;
    else if (tagged === "overnight") overnight = hour;
    else postMarket = hour;
  }

  let activeSession: QuoteSession = "regular";
  if (assetType === "stock") {
    const phase = getUsMarketPhase();
    if (phase === "pre" && preMarket) activeSession = "pre";
    else if (phase === "post" && postMarket) activeSession = "post";
    else if (phase === "overnight" && overnight) activeSession = "overnight";
    else if (phase === "closed" && postMarket) activeSession = "post";
    else if (phase === "closed" && overnight) activeSession = "overnight";
    else if (tagged && hour) activeSession = tagged;
  }

  const base: QuoteWithSource = {
    symbol: normalized,
    assetType,
    price,
    change,
    percentChange:
      rateRaw !== 0
        ? toPercent(rateRaw)
        : prev > 0
          ? (change / prev) * 100
          : 0,
    high: num(pick(raw, "high")),
    low: num(pick(raw, "low")),
    open: num(pick(raw, "open")),
    previousClose: prev,
    timestamp: msToSec(latestTime),
    ...(volume > 0 ? { volume } : {}),
    ...(turnover > 0 ? { turnover } : {}),
    ...(bid > 0 ? { bid } : {}),
    ...(ask > 0 ? { ask } : {}),
    ...(bidSize > 0 ? { bidSize } : {}),
    ...(askSize > 0 ? { askSize } : {}),
    ...(preMarket ? { preMarket } : {}),
    ...(postMarket ? { postMarket } : {}),
    ...(overnight ? { overnight } : {}),
    activeSession,
    source: "tiger",
  };

  return applyActiveExtendedPrice(base);
}

export function mapTigerKlineItems(items: TigerKlineItem[]): OhlcvBar[] {
  const out: OhlcvBar[] = [];
  for (const k of items) {
    const time = msToSec(num(k.time));
    const close = num(k.close);
    if (!(close > 0) && !(num(k.open) > 0)) continue;
    out.push({
      time,
      open: num(k.open),
      high: num(k.high),
      low: num(k.low),
      close,
      volume: num(k.volume),
    });
  }
  return out.sort((a, b) => a.time - b.time);
}

export function tigerBriefSymbol(raw: TigerBriefRaw): string {
  return String(pick(raw, "symbol") ?? "").trim().toUpperCase();
}
