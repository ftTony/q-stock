import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { encryptJson } from "@/lib/crypto/secret-box";
import {
  defaultLocale,
  localizedPath,
  locales,
  type AppLocale,
} from "@/i18n/config";
import {
  buildAuthorizeUrl,
  createOAuthState,
  getTigerOAuthClientId,
  getTigerOAuthCookieMaxAge,
  getTigerOAuthCookieName,
  getTigerOAuthRedirectUri,
  isTigerOAuthConfigured,
  type TigerOAuthSession,
} from "@/lib/market/providers/tiger-oauth";

function pickLocale(raw: string | null): AppLocale {
  if (raw && (locales as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return defaultLocale;
}

function settingsUrl(origin: string, locale: AppLocale, tiger: string): URL {
  const dest = new URL(localizedPath(locale, "/settings"), origin);
  dest.searchParams.set("tiger", tiger);
  return dest;
}

/**
 * Start Tiger OAuth 2.0: set encrypted session cookie, redirect to authorize.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = pickLocale(url.searchParams.get("locale"));
  const redirectUri = getTigerOAuthRedirectUri();
  const origin = new URL(redirectUri).origin;

  const session = await auth();
  if (!session?.user?.id) {
    const login = new URL(localizedPath(locale, "/login"), origin);
    login.searchParams.set(
      "next",
      `${localizedPath(locale, "/settings")}?tiger=need_login`,
    );
    return NextResponse.redirect(login);
  }

  if (!isTigerOAuthConfigured() || !getTigerOAuthClientId()) {
    return NextResponse.redirect(
      settingsUrl(origin, locale, "oauth_unavailable"),
    );
  }

  const state = createOAuthState();
  const oauthSession: TigerOAuthSession = {
    state,
    userId: session.user.id,
    locale,
  };

  let cookieValue: string;
  try {
    cookieValue = encryptJson(oauthSession);
  } catch {
    return NextResponse.redirect(settingsUrl(origin, locale, "error"));
  }

  const res = NextResponse.redirect(
    buildAuthorizeUrl({
      clientId: getTigerOAuthClientId()!,
      redirectUri,
      state,
    }),
  );
  res.cookies.set(getTigerOAuthCookieName(), cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getTigerOAuthCookieMaxAge(),
  });
  return res;
}
