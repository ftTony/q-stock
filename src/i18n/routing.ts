import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  // English (default) → `/`, `/login`; other locales keep `/zh-CN/...`
  localePrefix: "as-needed",
  // URL-only locale; ignore Accept-Language and stale NEXT_LOCALE cookies.
  localeDetection: false,
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
