import {
  getMarketCreds,
  loadUserMarketCreds,
  runWithMarketCreds,
} from "@/lib/market/creds-context";
import type { MarketCredsStore } from "@/lib/market/creds-types";

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

/** Effective Longbridge / Futu configured flags for the current ALS store. */
export function brokerConfiguredFromStore(): {
  longbridge: boolean;
  futu: boolean;
} {
  const c = getMarketCreds();
  return {
    longbridge: Boolean(c.longbridge),
    futu: Boolean(c.futu),
  };
}
