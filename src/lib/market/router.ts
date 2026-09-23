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

const CRYPTO_ORDER: MarketProviderId[] = ["binance", "finnhub", "longbridge"];

export function getProviderPriority(): MarketProviderId[] {
  const raw = process.env.MARKET_DATA_PROVIDERS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is MarketProviderId => s in REGISTRY);
  }
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
  const preferred = assetType === "crypto" && !raw ? CRYPTO_ORDER : getProviderPriority();

  const configured = preferred
    .map((id) => REGISTRY[id])
    .filter((p) => p.isConfigured());

  const pool =
    configured.length > 0
      ? configured
      : DEFAULT_ORDER.map((id) => REGISTRY[id]).filter((p) =>
          p.isConfigured(),
        );

  // For crypto, always ensure Binance is tried if not already in the list
  if (assetType === "crypto" && !pool.some((p) => p.id === "binance")) {
    pool.push(binanceProvider);
  }

  return pool.filter((p) => p.supports?.(assetType) !== false);
}

export async function withProviderFailover<T>(
  assetType: AssetType,
  fn: (provider: MarketDataProvider) => Promise<T>,
  label: string,
): Promise<T> {
  const providers = listProvidersFor(assetType);
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
