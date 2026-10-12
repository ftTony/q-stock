import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  // English (default) → `/`, `/login`; other locales keep `/zh-CN/...`
  localePrefix: "as-needed",
  // First visit: negotiate from Accept-Language; remember via NEXT_LOCALE.
  localeDetection: true,
  localeCookie: true,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
