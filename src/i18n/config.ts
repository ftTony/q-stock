export const locales = [
  "zh-CN",
  "zh-TW",
  "en",
  "ja",
  "fr",
  "ms",
  "th",
  "ko",
  "de",
  "es",
] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export function toDbLocale(locale: string): "zh_CN" | "zh_TW" | "en" {
  if (locale === "zh-CN") return "zh_CN";
  if (locale === "zh-TW") return "zh_TW";
  // DB LocaleCode only stores zh-CN / zh-TW / en; other locales fall back to en.
  return "en";
}

export function fromDbLocale(locale: string): AppLocale {
  if (locale === "zh_TW") return "zh-TW";
  if (locale === "zh_CN") return "zh-CN";
  return "en";
}

export const languageLabels: Record<AppLocale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  fr: "Français",
  ms: "Bahasa Melayu",
  th: "ไทย",
  ko: "한국어",
  de: "Deutsch",
  es: "Español",
};

export function localeCode(locale: string): string {
  const base = locale.includes("-") ? locale.split("-")[1] : locale;
  return base.toUpperCase();
}
