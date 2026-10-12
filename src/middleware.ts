import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(zh-CN|zh-TW|en|ja|fr|ms|th|ko|de|es)/:path*",
    /**
     * Locale-less paths (localePrefix: as-needed).
     * Skip API / Next internals / real static assets only — do NOT skip
     * tickers with dots (A-share `600519.SH`, `BRK.B`, `00700.HK`).
     */
    "/((?!api|_next|_vercel|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt|xml|json|js|css|map|woff2?|ttf|eot|webmanifest)$).*)",
  ],
};
