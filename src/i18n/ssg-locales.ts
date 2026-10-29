import { locales, type AppLocale } from "@/i18n/config";

/**
 * Locales pre-rendered at `next build`.
 *
 * Default: all UI locales (correct but multiplies SSG pages ≈ 10×).
 * Production Docker / CI can set `SSG_LOCALES=en,zh-CN,zh-TW` to cut
 * static page count; other locales still work via `dynamicParams` (on-demand).
 */
export function ssgLocales(): AppLocale[] {
  const raw = process.env.SSG_LOCALES?.trim();
  if (!raw) return [...locales];
  const wanted = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const picked = locales.filter((l) => wanted.includes(l));
  return picked.length > 0 ? [...picked] : [...locales];
}
