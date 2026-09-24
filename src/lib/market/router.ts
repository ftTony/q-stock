import { binanceProvider } from "@/lib/market/providers/binance";
import { finnhubProvider } from "@/lib/market/providers/finnhub";
import { futuProvider } from "@/lib/market/providers/futu";
import { longbridgeProvider } from "@/lib/market/providers/longbridge";
import type {
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
};

/** Equity preference. Crypto prefers Binance public klines (no key). */
const DEFAULT_ORDER: MarketProviderId[] = [
  "longbridge",
  "futu",
  "finnhub",
  "binance",
];

/** Content / IPO: Longbridge → Futu → Finnhub (no binance). */
export const CONTENT_PROVIDER_ORDER = [
  "longbridge",
  "futu",
  "finnhub",
] as const satisfies readonly MarketProviderId[];

export type ContentProviderId = (typeof CONTENT_PROVIDER_ORDER)[number];

const CRYPTO_ORDER: MarketProviderId[] = ["binance", "finnhub", "longbridge"];

function envProviderList(): MarketProviderId[] | null {
  const raw = process.env.MARKET_DATA_PROVIDERS?.trim();
  if (!raw) return null;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is MarketProviderId => s in REGISTRY);
}

/**
 * Whether a provider is allowed by MARKET_DATA_PROVIDERS.
 * If the env is unset, all providers are allowed (gated only by credentials).
 * Omitting `longbridge` from the CSV disables Longbridge → Futu is used next.
 */
export function isProviderEnabled(id: MarketProviderId): boolean {
  const list = envProviderList();
  if (!list) return true;
  return list.includes(id);
}

/** Enabled + configured content providers in Longbridge → Futu → Finnhub order. */
export function listContentProviders(): ContentProviderId[] {
  return CONTENT_PROVIDER_ORDER.filter(
    (id) => isProviderEnabled(id) && REGISTRY[id].isConfigured(),
  );
}

export function getProviderPriority(): MarketProviderId[] {
  const fromEnv = envProviderList();
  if (fromEnv) return fromEnv;
  return DEFAULT_ORDER.filter((id) => REGISTRY[id].isConfigured());
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

export function listProvidersFor(
  assetType: AssetType,
): MarketDataProvider[] {
  const raw = process.env.MARKET_DATA_PROVIDERS?.trim();
  const preferred =
    assetType === "crypto" && !raw ? CRYPTO_ORDER : getProviderPriority();

  const configured = preferred
    .map((id) => REGISTRY[id])
    .filter((p) => p.isConfigured());

  const pool =
    configured.length > 0
      ? configured
      : DEFAULT_ORDER.map((id) => REGISTRY[id]).filter((p) =>
          p.isConfigured(),
        );

  if (assetType === "crypto" && !pool.some((p) => p.id === "binance")) {
    pool.push(binanceProvider);
  }

  return pool.filter((p) => p.supports?.(assetType) !== false);
}

/**
 * Candles: prefer Longbridge / Futu before Finnhub.
 * Crypto still prefers Binance.
 */
export function listProvidersForCandles(
  assetType: AssetType,
): MarketDataProvider[] {
  if (assetType === "crypto") {
    return listProvidersFor(assetType);
  }
  const base = listProvidersFor(assetType);
  const prefer: MarketProviderId[] = ["longbridge", "futu", "finnhub"];
  const ranked = [...base].sort((a, b) => {
    const ia = prefer.indexOf(a.id);
    const ib = prefer.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return ranked;
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
      "No market data providers configured. Set LONGBRIDGE_*, FUTU_*, FINNHUB_API_KEY, or use Binance for crypto.",
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
