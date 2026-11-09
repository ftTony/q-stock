/**
 * Stable number/date formatting for SSR + client (avoid `undefined` locale mismatch).
 *
 * Formatters are cached per (locale, options) shape. Default locale is `en-US`
 * for hydration safety; pass an explicit `locale` when the UI locale is known.
 */

import type { AssetType } from "@/lib/types";

const DEFAULT_LOCALE = "en-US";
const formatters = new Map<string, Intl.NumberFormat>();
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

/** IANA zones used for quote / trade clocks. */
export const MARKET_TIME_ZONES: Record<AssetType, string> = {
  stock: "America/New_York",
  hk: "Asia/Hong_Kong",
  cn: "Asia/Shanghai",
  crypto: "UTC",
};

export type FormatLocaleOpts = {
  /** BCP 47 tag; defaults to en-US for SSR/client parity. */
  locale?: string;
};

function numberFormatter(
  locale: string,
  opts?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}|${opts ? JSON.stringify(opts) : ""}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, opts);
    if (formatters.size > 200) formatters.clear();
    formatters.set(key, f);
  }
  return f;
}

export function formatNumber(
  value: number,
  opts?: Intl.NumberFormatOptions & FormatLocaleOpts,
): string {
  const { locale = DEFAULT_LOCALE, ...rest } = opts ?? {};
  const hasRest = Object.keys(rest).length > 0;
  return numberFormatter(locale, hasRest ? rest : undefined).format(value);
}

export function formatPrice(
  value: number,
  maxDigits = 6,
  localeOpts?: FormatLocaleOpts,
): string {
  return formatNumber(value, {
    maximumFractionDigits: maxDigits,
    ...localeOpts,
  });
}

function timeFormatter(locale: string, timeZone?: string): Intl.DateTimeFormat {
  const key = `${locale}|time|${timeZone ?? "local-fixed"}`;
  let f = timeFormatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...(timeZone ? { timeZone } : { timeZone: "UTC" }),
    });
    if (timeFormatters.size > 100) timeFormatters.clear();
    timeFormatters.set(key, f);
  }
  return f;
}

export type FormatTimeOpts = FormatLocaleOpts & {
  /** IANA time zone. Defaults to UTC for SSR/client stability. */
  timeZone?: string;
  /** When set, picks MARKET_TIME_ZONES[assetType] unless timeZone is set. */
  assetType?: AssetType;
};

/**
 * Stable clock for SSR + client. Defaults to UTC; pass `assetType` or
 * `timeZone` for market-local times (US/HK/CN/crypto).
 */
export function formatTime(
  value: Date | number | string,
  opts?: FormatTimeOpts,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  const timeZone =
    opts?.timeZone ??
    (opts?.assetType ? MARKET_TIME_ZONES[opts.assetType] : "UTC");
  return timeFormatter(locale, timeZone).format(d);
}

/** Short label for the zone used with formatTime (for UI chips). */
export function marketTimeZoneLabel(assetType: AssetType): string {
  switch (assetType) {
    case "stock":
      return "ET";
    case "hk":
      return "HKT";
    case "cn":
      return "CST";
    case "crypto":
      return "UTC";
  }
}

export function formatUsEasternDateTime(value: Date | number | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("month")}/${part("day")} ${part("hour")}:${part("minute")}`;
}

function dateFormatter(locale: string): Intl.DateTimeFormat {
  let f = dateFormatters.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
    if (dateFormatters.size > 50) dateFormatters.clear();
    dateFormatters.set(locale, f);
  }
  return f;
}

export function formatDate(
  value: Date | number | string,
  opts?: FormatLocaleOpts,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return dateFormatter(opts?.locale ?? DEFAULT_LOCALE).format(d);
}

export function formatDateTime(
  value: Date | number | string,
  opts?: FormatTimeOpts,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  const timeZone =
    opts?.timeZone ??
    (opts?.assetType ? MARKET_TIME_ZONES[opts.assetType] : "UTC");
  return new Intl.DateTimeFormat(locale, {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(d);
}
