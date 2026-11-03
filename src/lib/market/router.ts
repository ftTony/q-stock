import { binanceProvider } from "@/lib/market/providers/binance";
import { finnhubProvider } from "@/lib/market/providers/finnhub";
import { futuProvider } from "@/lib/market/providers/futu";
import { fuyaoProvider } from "@/lib/market/providers/fuyao";
import { longbridgeProvider } from "@/lib/market/providers/longbridge";
import { okxProvider } from "@/lib/market/providers/okx";
import {
  getMarketCreds,
  runWithMarketCreds,
} from "@/lib/market/creds-context";
import type { BrokerCredsSource } from "@/lib/market/creds-types";
import {
  envFutuCreds,
  envLongbridgeCreds,
} from "@/lib/market/resolve-market-creds";
import type {
  CryptoVendorId,
  EquityVendorId,
  MarketDataProvider,
  MarketProviderId,
} from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType } from "@/lib/types";

const REGISTRY: Record<MarketProviderId, MarketDataProvider> = {
  longbridge: longbridgeProvider,
  futu: futuProvider,
  finnhub: finnhubProvider,
  binance: binanceProvider,
  okx: okxProvider,
  fuyao: fuyaoProvider,
};

const DEFAULT_ORDER: MarketProviderId[] = [
  "longbridge",
  "futu",
  "finnhub",
  "binance",
  "okx",
];

/** Content / IPO: broker order then Finnhub. */
export const CONTENT_PROVIDER_ORDER = [
  "longbridge",
  "futu",
  "finnhub",
] as const satisfies readonly MarketProviderId[];

export type ContentProviderId = (typeof CONTENT_PROVIDER_ORDER)[number];

export type EquityAttempt = {
  id: "longbridge" | "futu" | "finnhub";
  /** Finnhub is always platform; brokers pin user vs env. */
  source: BrokerCredsSource;
};

function envProviderList(): MarketProviderId[] | null {
  const raw = process.env.MARKET_DATA_PROVIDERS?.trim();
  if (!raw) return null;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is MarketProviderId => s in REGISTRY);
}

export function isProviderEnabled(id: MarketProviderId): boolean {
  // Fuyao temporarily shielded from the live provider chain.
  if (id === "fuyao") return false;
  const list = envProviderList();
  if (!list) return true;
  return list.includes(id);
}

function preferredEquityVendor(): EquityVendorId {
  return getMarketCreds().equityVendor ?? "longbridge";
}

function preferredCryptoVendor(): CryptoVendorId {
  return getMarketCreds().cryptoVendor ?? "binance";
}

function isEquityAsset(assetType: AssetType): boolean {
  return assetType === "stock" || assetType === "hk" || assetType === "cn";
}

/**
 * Equity failover hops (user asked product rule):
 * - No user keys: platform LB → platform Futu → Finnhub
 * - User Futu only: user Futu → platform LB → platform Futu → Finnhub
 * - User LB only: user LB → platform LB → platform Futu → Finnhub
 * - Both: preferred vendor's user key, then the other user key, then platform chain
 */
export function listEquityAttempts(): EquityAttempt[] {
  const store = getMarketCreds();
  const hasUserLb = Boolean(store.longbridge);
  const hasUserFutu = Boolean(store.futu);
  const preferred = preferredEquityVendor();

  const raw: EquityAttempt[] = [];

  if (hasUserLb && hasUserFutu) {
    if (preferred === "futu") {
      raw.push({ id: "futu", source: "user" });
      raw.push({ id: "longbridge", source: "user" });
    } else {
      raw.push({ id: "longbridge", source: "user" });
      raw.push({ id: "futu", source: "user" });
    }
  } else if (hasUserFutu) {
    raw.push({ id: "futu", source: "user" });
  } else if (hasUserLb) {
    raw.push({ id: "longbridge", source: "user" });
  }

  raw.push({ id: "longbridge", source: "platform" });
  raw.push({ id: "futu", source: "platform" });
  raw.push({ id: "finnhub", source: "platform" });

  return raw.filter((a) => {
    if (!isProviderEnabled(a.id)) return false;
    if (a.id === "finnhub") {
      return finnhubProvider.isConfigured();
    }
    if (a.id === "longbridge") {
      return a.source === "user"
        ? hasUserLb
        : Boolean(envLongbridgeCreds());
    }
    return a.source === "user" ? hasUserFutu : Boolean(envFutuCreds());
  });
}

export async function runWithEquityAttempt<T>(
  attempt: EquityAttempt,
  fn: () => T | Promise<T>,
): Promise<T> {
  const base = getMarketCreds();
  return runWithMarketCreds(
    { ...base, brokerCredsSource: attempt.source },
    () => fn(),
  );
}

/** Content providers: same equity attempt order, unique ids. */
export function listContentProviders(): ContentProviderId[] {
  const seen = new Set<ContentProviderId>();
  const out: ContentProviderId[] = [];
  for (const a of listEquityAttempts()) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a.id);
  }
  return out;
}

/** Effective priority for health / debug (unique provider ids). */
export function getProviderPriority(): MarketProviderId[] {
  const fromEquity = listEquityAttempts().map((a) => a.id as MarketProviderId);
  const crypto = preferredCryptoVendor();
  const cryptoAlt: CryptoVendorId = crypto === "binance" ? "okx" : "binance";
  const preferred: MarketProviderId[] = [
    ...fromEquity,
    crypto,
    cryptoAlt,
  ];
  const fromEnv = envProviderList();
  const allowed = fromEnv
    ? preferred.filter((id) => fromEnv.includes(id))
    : preferred;
  const configured = allowed.filter((id) => REGISTRY[id].isConfigured());
  return configured.length
    ? [...new Set(configured)]
    : DEFAULT_ORDER.filter((id) => REGISTRY[id].isConfigured());
}

export function getActiveProviders(): {
  id: MarketProviderId;
  configured: boolean;
}[] {
  return (Object.keys(REGISTRY) as MarketProviderId[]).map((id) => ({
    id,
    configured: REGISTRY[id].isConfigured(),
  }));
}

export function getProvider(
  id: MarketProviderId,
): MarketDataProvider | undefined {
  return REGISTRY[id];
}

function uniqueProviders(ids: MarketProviderId[]): MarketDataProvider[] {
  const seen = new Set<MarketProviderId>();
  const out: MarketDataProvider[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = REGISTRY[id];
    if (p?.isConfigured()) out.push(p);
  }
  return out;
}

export function listProvidersFor(
  assetType: AssetType,
): MarketDataProvider[] {
  if (assetType === "crypto") {
    const primary = preferredCryptoVendor();
    const secondary: CryptoVendorId =
      primary === "binance" ? "okx" : "binance";
    const ordered: MarketProviderId[] = [
      primary,
      secondary,
      "finnhub",
    ];
    return uniqueProviders(ordered).filter(
      (p) => p.supports?.(assetType) !== false,
    );
  }

  if (isEquityAsset(assetType)) {
    const ordered = listEquityAttempts().map((a) => a.id as MarketProviderId);
    return uniqueProviders(ordered).filter(
      (p) => p.supports?.(assetType) !== false,
    );
  }

  return uniqueProviders(DEFAULT_ORDER).filter(
    (p) => p.supports?.(assetType) !== false,
  );
}

export function listProvidersForCandles(
  assetType: AssetType,
): MarketDataProvider[] {
  return listProvidersFor(assetType);
}

export async function withProviderFailover<T>(
  assetType: AssetType,
  fn: (provider: MarketDataProvider) => Promise<T>,
  label: string,
  providersOverride?: MarketDataProvider[],
): Promise<T> {
  if (isEquityAsset(assetType)) {
    const allow = providersOverride
      ? new Set(providersOverride.map((p) => p.id))
      : null;
    const attempts = listEquityAttempts().filter((a) =>
      allow ? allow.has(a.id) : true,
    );
    if (!attempts.length) {
      throw new MarketDataError(
        "No market data providers configured. Set broker/crypto keys in Settings, or FINNHUB_API_KEY.",
      );
    }
    const errors: string[] = [];
    for (const attempt of attempts) {
      const p = REGISTRY[attempt.id];
      if (!p || p.supports?.(assetType) === false) continue;
      try {
        return await runWithEquityAttempt(attempt, () => fn(p));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${attempt.id}:${attempt.source}: ${msg}`);
        console.warn(
          `[market] ${label} via ${attempt.id} (${attempt.source}) failed:`,
          msg,
        );
      }
    }
    throw new MarketDataError(
      `All providers failed for ${label}: ${errors.join(" | ")}`,
    );
  }

  const providers = providersOverride ?? listProvidersFor(assetType);
  if (!providers.length) {
    throw new MarketDataError(
      "No market data providers configured. Set broker/crypto keys in Settings, or FINNHUB_API_KEY.",
    );
  }

  const errors: string[] = [];
  for (const p of providers) {
    try {
      return await fn(p);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${p.id}: ${msg}`);
      console.warn(`[market] ${label} via ${p.id} failed:`, msg);
    }
  }
  throw new MarketDataError(
    `All providers failed for ${label}: ${errors.join(" | ")}`,
  );
}
