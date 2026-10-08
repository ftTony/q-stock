import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  // English (default) → `/`, `/login`; other locales keep `/zh-CN/...`
  localePrefix: "as-needed",
  // Do not auto-switch from Accept-Language; stay on English unless user picks a locale.
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
