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
  getFutuOAuthClientId,
  getFutuOAuthCookieMaxAge,
  getFutuOAuthCookieName,
  getFutuOAuthRedirectUri,
  type FutuOAuthSession,
} from "@/lib/market/providers/futu-oauth";

function pickLocale(raw: string | null): AppLocale {
  if (raw && (locales as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return defaultLocale;
}

function settingsUrl(origin: string, locale: AppLocale, futu: string): URL {
  const dest = new URL(localizedPath(locale, "/settings"), origin);
  dest.searchParams.set("futu", futu);
  return dest;
}

/**
 * Start Futu OAuth 2.1 + PKCE: set encrypted session cookie, redirect to authorize.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = pickLocale(url.searchParams.get("locale"));

  const session = await auth();
  if (!session?.user?.id) {
    const login = new URL(localizedPath(locale, "/login"), url.origin);
    login.searchParams.set(
      "next",
      `${localizedPath(locale, "/settings")}?futu=need_login`,
    );
    return NextResponse.redirect(login);
  }

  const clientId = getFutuOAuthClientId();
  if (!clientId) {
    return NextResponse.redirect(
      settingsUrl(url.origin, locale, "oauth_unavailable"),
    );
  }

  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = createOAuthState();
  const redirectUri = getFutuOAuthRedirectUri();

  const oauthSession: FutuOAuthSession = {
    state,
    codeVerifier,
    userId: session.user.id,
    locale,
  };

  let cookieValue: string;
  try {
    cookieValue = encryptJson(oauthSession);
  } catch {
    return NextResponse.redirect(settingsUrl(url.origin, locale, "error"));
  }

  const res = NextResponse.redirect(
    buildAuthorizeUrl({
      clientId,
      redirectUri,
      state,
      codeChallenge,
    }),
  );
  res.cookies.set(getFutuOAuthCookieName(), cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getFutuOAuthCookieMaxAge(),
  });
  return res;
}
