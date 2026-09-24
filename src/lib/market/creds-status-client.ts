export type MarketCredsStatus = {
  longbridge: { configured: boolean };
  futu: { configured: boolean; mode?: "bearer" | "appkey" };
};

/** True when the user has at least one broker OpenAPI key. */
export function hasAnyBrokerCreds(status: MarketCredsStatus | null | undefined): boolean {
  return Boolean(status?.longbridge.configured || status?.futu.configured);
}

export const CREDS_DISMISS_KEY = "market-creds-prompt-dismissed";

export async function fetchMarketCredsStatus(): Promise<MarketCredsStatus | null> {
  try {
    const res = await fetch("/api/user/market-credentials");
    if (!res.ok) return null;
    return (await res.json()) as MarketCredsStatus;
  } catch {
    return null;
  }
}

/** After login/register: settings if no BYOK, otherwise home. */
export async function pathAfterAuth(): Promise<"/settings?setupKeys=1" | "/"> {
  const status = await fetchMarketCredsStatus();
  if (!hasAnyBrokerCreds(status)) {
    try {
      sessionStorage.removeItem(CREDS_DISMISS_KEY);
    } catch {
      /* ignore */
    }
    return "/settings?setupKeys=1";
  }
  return "/";
}
