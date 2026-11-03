/**
 * Stable number formatting for SSR + client (avoid `undefined` locale mismatch).
 *
 * `toLocaleString` builds a fresh Intl.NumberFormat on every call, and the
 * quote tables call this thousands of times per render — cache one formatter
 * per options shape (there are only a handful of distinct shapes in practice).
 */
const baseFormatter = new Intl.NumberFormat("en-US");
const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(opts?: Intl.NumberFormatOptions): Intl.NumberFormat {
  if (!opts) return baseFormatter;
  const key = JSON.stringify(opts);
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", opts);
    if (formatters.size > 200) formatters.clear();
    formatters.set(key, f);
  }
  return f;
}

export function formatNumber(
  value: number,
  opts?: Intl.NumberFormatOptions,
): string {
  return formatterFor(opts).format(value);
}

export function formatPrice(value: number, maxDigits = 6): string {
  return formatNumber(value, { maximumFractionDigits: maxDigits });
}

/** Stable time for SSR + client (avoid browser locale / timezone hydration mismatch). */
export function formatTime(value: Date | number | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour12: false });
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

export function formatDate(value: Date | number | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US");
}

export function formatDateTime(value: Date | number | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { hour12: false });
}
