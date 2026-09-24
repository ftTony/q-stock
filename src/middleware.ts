import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(zh-CN|zh-TW|en|ja|fr|ms|th|ko|de|es)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
