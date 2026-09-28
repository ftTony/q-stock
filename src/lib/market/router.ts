import { binanceProvider } from "@/lib/market/providers/binance";
import { finnhubProvider } from "@/lib/market/providers/finnhub";
import { futuProvider } from "@/lib/market/providers/futu";
import { longbridgeProvider } from "@/lib/market/providers/longbridge";
import { okxProvider } from "@/lib/market/providers/okx";
import { getMarketCreds } from "@/lib/market/creds-context";
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

function envProviderList(): MarketProviderId[] | null {
  const raw = process.env.MARKET_DATA_PROVIDERS?.trim();
  if (!raw) return null;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is MarketProviderId => s in REGISTRY);
}

export function isProviderEnabled(id: MarketProviderId): boolean {
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

/** Content providers: user equity vendor first, then the other, then Finnhub. */
export function listContentProviders(): ContentProviderId[] {
  const primary = preferredEquityVendor();
  const secondary: EquityVendorId =
    primary === "longbridge" ? "futu" : "longbridge";
  const order = [primary, secondary, "finnhub"] as const;
  return order.filter(
    (id) => isProviderEnabled(id) && REGISTRY[id].isConfigured(),
  );
}

/** Effective priority for the current request (user vendor prefs + env allowlist). */
export function getProviderPriority(): MarketProviderId[] {
  const equity = preferredEquityVendor();
  const equityAlt: EquityVendorId =
    equity === "longbridge" ? "futu" : "longbridge";
  const crypto = preferredCryptoVendor();
  const cryptoAlt: CryptoVendorId = crypto === "binance" ? "okx" : "binance";
  const preferred: MarketProviderId[] = [
    equity,
    equityAlt,
    crypto,
    cryptoAlt,
    "finnhub",
  ];
  const fromEnv = envProviderList();
  const allowed = fromEnv
    ? preferred.filter((id) => fromEnv.includes(id))
    : preferred;
  const configured = allowed.filter((id) => REGISTRY[id].isConfigured());
  return configured.length
    ? configured
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

  // US / HK equity: user-selected broker first, then the other, then Finnhub
  const primary = preferredEquityVendor();
  const secondary: EquityVendorId =
    primary === "longbridge" ? "futu" : "longbridge";
  const ordered: MarketProviderId[] = [primary, secondary, "finnhub"];
  // Also allow env-ordered extras if enabled
  const fromEnv = envProviderList();
  if (fromEnv) {
    for (const id of fromEnv) {
      if (!ordered.includes(id)) ordered.push(id);
    }
  }
  return uniqueProviders(ordered).filter(
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
