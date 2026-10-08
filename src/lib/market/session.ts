/** Equity regular-session helpers (no holiday calendar — weekends + clock only). */

export type EquitySession = {
  usOpen: boolean;
  hkOpen: boolean;
  cnOpen: boolean;
  /** At least one equity market in regular session. */
  anyOpen: boolean;
};

function zonedClock(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;
  return {
    weekday: get("weekday"),
    minutes: hour * 60 + Number(get("minute")),
  };
}

function isWeekday(weekday: string) {
  return weekday !== "Sat" && weekday !== "Sun";
}

/** US regular: Mon–Fri 09:30–16:00 America/New_York */
export function isUsRegularSessionOpen(now = new Date()): boolean {
  const { weekday, minutes } = zonedClock(now, "America/New_York");
  if (!isWeekday(weekday)) return false;
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

/** Calendar trade date `YYYY-MM-DD` in America/New_York. */
export function usTradeDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Post-close window for daily digests: weekday after US regular close.
 * Default 16:00–17:00 ET (inclusive start, exclusive end).
 */
export function isUsMarketCloseWindow(
  now = new Date(),
  opts?: { startMinutes?: number; endMinutes?: number },
): boolean {
  const start = opts?.startMinutes ?? 16 * 60;
  const end = opts?.endMinutes ?? 17 * 60;
  const { weekday, minutes } = zonedClock(now, "America/New_York");
  if (!isWeekday(weekday)) return false;
  return minutes >= start && minutes < end;
}

/** HK continuous: Mon–Fri 09:30–12:00 & 13:00–16:00 Asia/Hong_Kong */
export function isHkRegularSessionOpen(now = new Date()): boolean {
  const { weekday, minutes } = zonedClock(now, "Asia/Hong_Kong");
  if (!isWeekday(weekday)) return false;
  const morning = minutes >= 9 * 60 + 30 && minutes < 12 * 60;
  const afternoon = minutes >= 13 * 60 && minutes < 16 * 60;
  return morning || afternoon;
}

/** A-share: Mon–Fri 09:30–11:30 & 13:00–15:00 Asia/Shanghai */
export function isCnRegularSessionOpen(now = new Date()): boolean {
  const { weekday, minutes } = zonedClock(now, "Asia/Shanghai");
  if (!isWeekday(weekday)) return false;
  const morning = minutes >= 9 * 60 + 30 && minutes < 11 * 60 + 30;
  const afternoon = minutes >= 13 * 60 && minutes < 15 * 60;
  return morning || afternoon;
}

export function getEquitySession(now = new Date()): EquitySession {
  const usOpen = isUsRegularSessionOpen(now);
  const hkOpen = isHkRegularSessionOpen(now);
  const cnOpen = isCnRegularSessionOpen(now);
  return { usOpen, hkOpen, cnOpen, anyOpen: usOpen || hkOpen || cnOpen };
}
