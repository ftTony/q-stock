export type MarketCredsStatus = {
  longbridge: { configured: boolean };
  futu: { configured: boolean; mode?: "bearer" | "appkey" };
  binance?: { configured: boolean };
  okx?: { configured: boolean };
  fuyao?: { configured: boolean };
  equityVendor?: "longbridge" | "futu";
  cryptoVendor?: "binance" | "okx";
};

/** True when the user has at least one broker OpenAPI key. */
export function hasAnyBrokerCreds(status: MarketCredsStatus | null | undefined): boolean {
  return Boolean(status?.longbridge.configured || status?.futu.configured);
}

export const CREDS_DISMISS_KEY = "market-creds-prompt-dismissed";

/** Fired when equity/crypto vendor preference is saved in Settings. */
export const MARKET_VENDORS_CHANGED = "qstock:market-vendors-changed";

export function notifyMarketVendorsChanged(status: MarketCredsStatus): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MARKET_VENDORS_CHANGED, { detail: status }),
  );
}

export async function fetchMarketCredsStatus(): Promise<MarketCredsStatus | null> {
  try {
    const res = await fetch("/api/user/market-credentials");
    if (!res.ok) return null;
    return (await res.json()) as MarketCredsStatus;
  } catch {
    return null;
  }
}

/** After login/register: settings if no BYOK, otherwise markets dashboard. */
export async function pathAfterAuth(): Promise<
  "/settings?setupKeys=1" | "/markets"
> {
  const status = await fetchMarketCredsStatus();
  if (!hasAnyBrokerCreds(status)) {
    try {
      sessionStorage.removeItem(CREDS_DISMISS_KEY);
    } catch {
      /* ignore */
    }
    return "/settings?setupKeys=1";
  }
  return "/markets";
}
