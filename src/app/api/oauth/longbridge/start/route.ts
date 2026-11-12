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
  createPkcePair,
  getLongbridgeOAuthClientId,
  getLongbridgeOAuthCookieMaxAge,
  getLongbridgeOAuthCookieName,
  getLongbridgeOAuthRedirectUri,
  type LongbridgeOAuthSession,
} from "@/lib/market/providers/longbridge-oauth";

function pickLocale(raw: string | null): AppLocale {
  if (raw && (locales as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return defaultLocale;
}

function settingsUrl(origin: string, locale: AppLocale, lb: string): URL {
  const dest = new URL(localizedPath(locale, "/settings"), origin);
  dest.searchParams.set("longbridge", lb);
  return dest;
}

/**
 * Start Longbridge OAuth 2.0 + PKCE: set encrypted session cookie, redirect.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = pickLocale(url.searchParams.get("locale"));
  const redirectUri = getLongbridgeOAuthRedirectUri();
  const origin = new URL(redirectUri).origin;

  const session = await auth();
  if (!session?.user?.id) {
    const login = new URL(localizedPath(locale, "/login"), origin);
    login.searchParams.set(
      "next",
      `${localizedPath(locale, "/settings")}?longbridge=need_login`,
    );
    return NextResponse.redirect(login);
  }

  const clientId = getLongbridgeOAuthClientId();
  if (!clientId) {
    return NextResponse.redirect(
      settingsUrl(origin, locale, "oauth_unavailable"),
    );
  }

  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = createOAuthState();
  const oauthSession: LongbridgeOAuthSession = {
    state,
    codeVerifier,
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
      clientId,
      redirectUri,
      state,
      codeChallenge,
    }),
  );
  res.cookies.set(getLongbridgeOAuthCookieName(), cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getLongbridgeOAuthCookieMaxAge(),
  });
  return res;
}
