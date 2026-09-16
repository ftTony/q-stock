export const locales = ["zh-CN", "zh-TW", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "zh-CN";

export function toDbLocale(locale: string): "zh_CN" | "zh_TW" | "en" {
  if (locale === "zh-TW") return "zh_TW";
  if (locale === "en") return "en";
  return "zh_CN";
}

export function fromDbLocale(locale: string): AppLocale {
  if (locale === "zh_TW") return "zh-TW";
  if (locale === "en") return "en";
  return "zh-CN";
}
