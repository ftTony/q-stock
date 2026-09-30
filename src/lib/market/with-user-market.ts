import {
  resolveFutuCreds,
  resolveLongbridgeCreds,
} from "@/lib/market/resolve-market-creds";
import type { MarketCredsStore } from "@/lib/market/creds-types";
import {
  loadUserMarketCreds,
  runWithMarketCreds,
} from "@/lib/market/creds-context";

/**
 * Load the user's BYOK credentials (if any) into AsyncLocalStorage for the
 * duration of `fn`. Guests / null userId → empty store (platform providers only).
 */
export async function withUserMarket<T>(
  userId: string | null | undefined,
  fn: () => T | Promise<T>,
): Promise<T> {
  let store: MarketCredsStore = {};
  if (userId) {
    store = await loadUserMarketCreds(userId);
  }
  return runWithMarketCreds(store, () => fn());
}

/** Effective Longbridge / Futu configured flags (env or BYOK). */
export function brokerConfiguredFromStore(): {
  longbridge: boolean;
  futu: boolean;
} {
  return {
    longbridge: Boolean(resolveLongbridgeCreds()),
    futu: Boolean(resolveFutuCreds()),
  };
}
