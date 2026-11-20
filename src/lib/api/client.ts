import {
  clearAccessToken,
  getAccessToken,
  getRefreshToken,
  setRefreshToken,
  setTokenPair,
} from "@/lib/api/token-store";

const V1_FULL_PREFIXES = [
  "/api/quotes",
  "/api/candles",
  "/api/search",
  "/api/watchlist",
  "/api/trading",
  "/api/health",
  "/api/user",
  "/api/alerts",
  "/api/market",
  "/api/ranks",
  "/api/industry-ranks",
  "/api/indices",
  "/api/ipo",
  "/api/earnings",
  "/api/company",
  "/api/news",
  "/api/press",
  "/api/sentiment",
  "/api/comments",
  "/api/research-cards",
  "/api/review",
] as const;

/** Billing paths still on Next (Stripe checkout/portal/webhook/events). */
function isNextOnlyBillingPath(pathOnly: string): boolean {
  return (
    pathOnly.startsWith("/api/billing/checkout") ||
    pathOnly.startsWith("/api/billing/portal") ||
    pathOnly.startsWith("/api/billing/webhook") ||
    pathOnly.startsWith("/api/billing/events")
  );
}

/** Strategy routes still served by Next (lab / share / AI review). */
function isNextOnlyStrategyPath(pathOnly: string): boolean {
  return (
    pathOnly.startsWith("/api/strategies/basket") ||
    pathOnly.startsWith("/api/strategies/compare") ||
    pathOnly.startsWith("/api/strategies/lab-reports") ||
    pathOnly.startsWith("/api/strategies/share") ||
    /\/api\/strategies\/[^/]+\/param-grid$/.test(pathOnly) ||
    /\/api\/strategies\/replays\/[^/]+\//.test(pathOnly)
  );
}

function isMigratedStrategyPath(pathOnly: string): boolean {
  if (isNextOnlyStrategyPath(pathOnly)) return false;
  if (pathOnly === "/api/strategies" || pathOnly.startsWith("/api/strategies?")) {
    return true;
  }
  if (pathOnly === "/api/strategies/replays" || pathOnly.startsWith("/api/strategies/replays?")) {
    return true;
  }
  return /^\/api\/strategies\/[^/]+(\/replay)?$/.test(pathOnly);
}

/** Map legacy Next BFF paths to FastAPI `/api/v1/*`. */
export function toV1Path(url: string): string {
  if (url.startsWith("/api/v1/")) return url;
  const pathOnly = url.split("?")[0] ?? url;
  if (
    pathOnly === "/api/billing/entitlements" ||
    pathOnly.startsWith("/api/billing/entitlements?") ||
    pathOnly === "/api/billing/redeem" ||
    pathOnly.startsWith("/api/billing/redeem?")
  ) {
    return url.replace(/^\/api/, "/api/v1");
  }
  if (isNextOnlyBillingPath(pathOnly)) {
    return url;
  }
  for (const prefix of V1_FULL_PREFIXES) {
    if (pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)) {
      return url.replace(/^\/api/, "/api/v1");
    }
  }
  if (isMigratedStrategyPath(pathOnly)) {
    return url.replace(/^\/api/, "/api/v1");
  }
  if (
    pathOnly === "/api/auth/register" ||
    pathOnly === "/api/auth/login" ||
    pathOnly === "/api/auth/refresh" ||
    pathOnly === "/api/auth/logout" ||
    pathOnly === "/api/auth/me" ||
    pathOnly === "/api/auth/forgot-password" ||
    pathOnly === "/api/auth/reset-password" ||
    pathOnly === "/api/auth/providers" ||
    pathOnly === "/api/auth/onetap" ||
    pathOnly.startsWith("/api/auth/oauth/")
  ) {
    return url.replace(/^\/api\/auth/, "/api/v1/auth");
  }
  return url;
}

function isV1(url: string): boolean {
  return url.startsWith("/api/v1/");
}

type ErrorBody = {
  error?: string | { code?: string; message?: string; details?: unknown };
  code?: string;
};

function errorMessage(data: ErrorBody, status: number): string {
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object" && typeof data.error.message === "string") {
    return data.error.message;
  }
  return `Request failed (${status})`;
}

function errorCode(data: ErrorBody): string | undefined {
  if (typeof data.code === "string") return data.code;
  if (data.error && typeof data.error === "object" && typeof data.error.code === "string") {
    return data.error.code;
  }
  return undefined;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const headers = new Headers();
      const storedRefresh = getRefreshToken();
      if (storedRefresh) {
        headers.set("Authorization", `Bearer ${storedRefresh}`);
      }
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        clearAccessToken();
        return false;
      }
      const data = (await res.json()) as {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
      };
      if (!data.accessToken) {
        clearAccessToken();
        return false;
      }
      setTokenPair(data.accessToken, data.expiresIn ?? 1800, data.refreshToken ?? null);
      return true;
    } catch {
      clearAccessToken();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export type ApiFetchInit = RequestInit & { skipAuth?: boolean };

/** JSON fetch for FastAPI (+ legacy Next). Attaches Bearer and refreshes once on 401. */
export async function apiFetchJson<T>(url: string, init?: ApiFetchInit): Promise<T> {
  const path = toV1Path(url);
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const isApi = path.startsWith("/api/");
  const isAuthBootstrap =
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh") ||
    path.includes("/auth/onetap") ||
    path.includes("/auth/forgot") ||
    path.includes("/auth/reset") ||
    path.includes("/auth/providers") ||
    path.includes("/auth/oauth/");
  if (!init?.skipAuth && isApi && !isAuthBootstrap) {
    let token = getAccessToken();
    // Soft restore after reload before first 401 storm.
    if (!token && getRefreshToken()) {
      const ok = await tryRefresh();
      if (ok) token = getAccessToken();
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const doFetch = () =>
    fetch(path, {
      ...init,
      headers,
      credentials: init?.credentials ?? "include",
    });

  let res = await doFetch();
  if (
    res.status === 401 &&
    isApi &&
    !isAuthBootstrap &&
    !init?.skipAuth
  ) {
    const ok = await tryRefresh();
    if (ok) {
      const token = getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      res = await doFetch();
    }
  }

  const data = (await res.json().catch(() => ({}))) as T & ErrorBody & {
    details?: unknown;
  };
  if (!res.ok) {
    const err = new Error(errorMessage(data, res.status)) as Error & {
      code?: string;
      status?: number;
      details?: unknown;
    };
    const code = errorCode(data);
    if (code) err.code = code;
    err.status = res.status;
    const details =
      data.details ??
      (data.error && typeof data.error === "object"
        ? (data.error as { details?: unknown }).details
        : undefined);
    if (details !== undefined) err.details = details;
    throw err;
  }
  return data;
}

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: { id: string; email: string; name?: string | null };
};

export async function apiLogin(email: string, password: string): Promise<AuthTokenResponse> {
  const { encryptPasswordForApi } = await import("@/lib/auth/encrypt-password");
  const passwordCipher = await encryptPasswordForApi(password);
  const data = await apiFetchJson<AuthTokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, passwordCipher }),
    skipAuth: true,
  });
  setTokenPair(data.accessToken, data.expiresIn, data.refreshToken ?? null);
  return data;
}

export async function apiRegister(body: {
  email: string;
  password: string;
  name?: string;
  locale?: string;
  inviteCode?: string;
}): Promise<AuthTokenResponse> {
  const { encryptPasswordForApi } = await import("@/lib/auth/encrypt-password");
  const { password, ...rest } = body;
  const passwordCipher = await encryptPasswordForApi(password);
  const data = await apiFetchJson<AuthTokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...rest, passwordCipher }),
    skipAuth: true,
  });
  setTokenPair(data.accessToken, data.expiresIn, data.refreshToken ?? null);
  return data;
}

export async function apiLogout(): Promise<void> {
  try {
    const headers = new Headers();
    const rt = getRefreshToken();
    if (rt) headers.set("Authorization", `Bearer ${rt}`);
    await apiFetchJson("/api/v1/auth/logout", { method: "POST", headers });
  } catch {
    /* ignore */
  } finally {
    clearAccessToken();
    setRefreshToken(null);
  }
}
