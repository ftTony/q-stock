"use client";

/**
 * Drop-in replacement for next-auth/react — session comes from FastAPI JWT.
 * Keeps `{ data, status }` shape so existing call sites need only import path change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetchJson, apiLogout } from "@/lib/api/client";
import { getAccessToken, getRefreshToken } from "@/lib/api/token-store";

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  locale?: string | null;
  theme?: string | null;
  changeColorScheme?: string | null;
  plan?: string | null;
};

export type Session = {
  user?: AuthUser;
  expires?: string;
} | null;

type SessionContextValue = {
  data: Session;
  status: "loading" | "authenticated" | "unauthenticated";
  update: () => Promise<Session>;
};

const SessionContext = createContext<SessionContextValue>({
  data: null,
  status: "loading",
  update: async () => null,
});

async function fetchMe(): Promise<Session> {
  if (!getAccessToken() && !getRefreshToken()) return null;
  try {
    const data = await apiFetchJson<{ user: AuthUser }>("/api/v1/auth/me");
    return { user: data.user };
  } catch {
    return null;
  }
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    "loading",
  );

  const refresh = useCallback(async () => {
    const session = await fetchMe();
    setData(session);
    setStatus(session?.user?.id ? "authenticated" : "unauthenticated");
    return session;
  }, []);

  useEffect(() => {
    void refresh();
    const onAuth = () => {
      void refresh();
    };
    window.addEventListener("qstock-auth-changed", onAuth);
    return () => window.removeEventListener("qstock-auth-changed", onAuth);
  }, [refresh]);

  const value = useMemo(
    () => ({ data, status, update: refresh }),
    [data, status, refresh],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}

/** next-auth compatible signOut */
export async function signOut(opts?: {
  redirect?: boolean;
  callbackUrl?: string;
}): Promise<void> {
  await apiLogout();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qstock-auth-changed"));
    if (opts?.redirect !== false) {
      window.location.href = opts?.callbackUrl || "/";
    } else {
      window.location.reload();
    }
  }
}

/**
 * next-auth compatible signIn — credentials should use apiLogin instead.
 * OAuth providers redirect to FastAPI start URL.
 */
export async function signIn(
  provider?: string,
  options?: { callbackUrl?: string; redirect?: boolean; email?: string; password?: string; credential?: string },
): Promise<{ error?: string; ok?: boolean } | undefined> {
  if (provider === "credentials" && options?.email && options?.password) {
    const { apiLogin } = await import("@/lib/api/client");
    try {
      await apiLogin(options.email, options.password);
      if (options.redirect !== false && typeof window !== "undefined") {
        window.location.href = options.callbackUrl || "/";
      }
      return { ok: true };
    } catch {
      return { error: "CredentialsSignin" };
    }
  }
  if (provider === "onetap" && options?.credential) {
    try {
      const { apiFetchJson } = await import("@/lib/api/client");
      const { setTokenPair } = await import("@/lib/api/token-store");
      const data = await apiFetchJson<{
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
      }>("/api/v1/auth/onetap", {
        method: "POST",
        body: JSON.stringify({ credential: options.credential }),
        skipAuth: true,
      });
      setTokenPair(data.accessToken, data.expiresIn, data.refreshToken ?? null);
      if (options.redirect !== false && typeof window !== "undefined") {
        window.location.href = options.callbackUrl || "/";
      }
      return { ok: true };
    } catch {
      return { error: "OAuthSignin" };
    }
  }
  if (provider === "google" || provider === "github") {
    const cb = encodeURIComponent(options?.callbackUrl || "/");
    if (typeof window !== "undefined") {
      window.location.href = `/api/v1/auth/oauth/${provider}/start?callbackUrl=${cb}`;
    }
    return { ok: true };
  }
  return { error: "Unsupported" };
}

export function getProviders(): Promise<Record<string, { id: string; name: string }> | null> {
  return apiFetchJson<{ providers: { id: string; name: string }[] }>(
    "/api/v1/auth/providers",
  )
    .then((d) => {
      const out: Record<string, { id: string; name: string }> = {};
      for (const p of d.providers || []) out[p.id] = p;
      return out;
    })
    .catch(() => null);
}
