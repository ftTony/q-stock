/** Stable number formatting for SSR + client (avoid `undefined` locale mismatch). */
export function formatNumber(
  value: number,
  opts?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString("en-US", opts);
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
