import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptJson, encryptJson } from "@/lib/crypto/secret-box";
import { defaultLocale, localizedPath } from "@/i18n/config";
import { invalidateUserMarketCredsCache } from "@/lib/market/creds-context";
import type { LongbridgeBearerCreds } from "@/lib/market/creds-types";
import {
  exchangeAuthorizationCode,
  expiresAtFromExpiresIn,
  getLongbridgeOAuthClientId,
  getLongbridgeOAuthCookieName,
  getLongbridgeOAuthRedirectUri,
  type LongbridgeOAuthSession,
} from "@/lib/market/providers/longbridge-oauth";

function settingsRedirect(
  origin: string,
  locale: string,
  longbridge: string,
): NextResponse {
  const dest = new URL(
    localizedPath(locale || defaultLocale, "/settings"),
    origin,
  );
  dest.searchParams.set("longbridge", longbridge);
  const res = NextResponse.redirect(dest);
  res.cookies.set(getLongbridgeOAuthCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

/**
 * Longbridge OAuth callback: validate state, exchange code, persist bearer.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectUri = getLongbridgeOAuthRedirectUri();
  const origin = new URL(redirectUri).origin;
  const code = url.searchParams.get("code")?.trim() || "";
  const state = url.searchParams.get("state")?.trim() || "";
  const oauthError = url.searchParams.get("error")?.trim();

  const jar = await cookies();
  const cookieRaw = jar.get(getLongbridgeOAuthCookieName())?.value;

  let oauthSession: LongbridgeOAuthSession | null = null;
  if (cookieRaw) {
    try {
      oauthSession = decryptJson<LongbridgeOAuthSession>(cookieRaw);
    } catch {
      oauthSession = null;
    }
  }

  const locale = oauthSession?.locale || defaultLocale;

  if (oauthError) {
    return settingsRedirect(origin, locale, "denied");
  }

  if (!code || !state || !oauthSession) {
    return settingsRedirect(origin, locale, "error");
  }

  if (state !== oauthSession.state) {
    return settingsRedirect(origin, locale, "error");
  }

  const session = await auth();
  if (!session?.user?.id || session.user.id !== oauthSession.userId) {
    return settingsRedirect(origin, locale, "need_login");
  }

  const clientId = getLongbridgeOAuthClientId();
  if (!clientId) {
    return settingsRedirect(origin, locale, "oauth_unavailable");
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      codeVerifier: oauthSession.codeVerifier,
      clientId,
      redirectUri,
    });

    const payload: LongbridgeBearerCreds = {
      mode: "bearer",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expiresAtFromExpiresIn(tokens.expiresIn),
    };

    const userId = oauthSession.userId;
    const encrypted = encryptJson(payload);
    await prisma.$transaction([
      prisma.userMarketCredential.upsert({
        where: { userId_provider: { userId, provider: "longbridge" } },
        create: { userId, provider: "longbridge", payload: encrypted },
        update: { payload: encrypted },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { equityVendor: "longbridge" },
      }),
    ]);
    invalidateUserMarketCredsCache(userId);

    return settingsRedirect(origin, locale, "connected");
  } catch (err) {
    console.warn(
      "[longbridge-oauth] callback failed:",
      err instanceof Error ? err.message : err,
    );
    return settingsRedirect(origin, locale, "error");
  }
}
