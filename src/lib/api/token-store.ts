/** Access + refresh tokens. Access in memory; both mirrored to sessionStorage for reload. */

const ACCESS_KEY = "qstock_access";
const ACCESS_EXP_KEY = "qstock_access_exp";
const REFRESH_KEY = "qstock_refresh";

let accessToken: string | null = null;
let expiresAt = 0;
let refreshToken: string | null = null;
let hydrated = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function hydrateFromSession() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    accessToken = sessionStorage.getItem(ACCESS_KEY);
    const exp = Number(sessionStorage.getItem(ACCESS_EXP_KEY) || 0);
    expiresAt = Number.isFinite(exp) ? exp : 0;
    refreshToken = sessionStorage.getItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  hydrateFromSession();
  if (!accessToken) return null;
  if (expiresAt && Date.now() >= expiresAt - 5_000) return null;
  return accessToken;
}

export function getRefreshToken(): string | null {
  hydrateFromSession();
  return refreshToken;
}

export function setAccessToken(token: string | null, expiresInSec?: number) {
  accessToken = token;
  expiresAt = token && expiresInSec ? Date.now() + expiresInSec * 1000 : 0;
  if (!canUseStorage()) return;
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_KEY, token);
      sessionStorage.setItem(ACCESS_EXP_KEY, String(expiresAt));
    } else {
      sessionStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(ACCESS_EXP_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (!canUseStorage()) return;
  try {
    if (token) sessionStorage.setItem(REFRESH_KEY, token);
    else sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export function setTokenPair(
  access: string,
  expiresInSec: number,
  refresh?: string | null,
) {
  setAccessToken(access, expiresInSec);
  if (refresh !== undefined) setRefreshToken(refresh);
}

export function clearAccessToken() {
  accessToken = null;
  expiresAt = 0;
  refreshToken = null;
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(ACCESS_EXP_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}
