/**
 * Option-chain display prefs (visible columns + row window around spot).
 * Persisted in localStorage for the symbol workbench.
 */

export const OPTION_CHAIN_COL_KEYS = [
  "bid",
  "ask",
  "mid",
  "last",
  "chg",
  "vol",
  "oi",
  "iv",
  "delta",
  "gamma",
  "theta",
  "breakeven",
  "pop",
  "sellerReturn",
  "mark",
] as const;

export type OptionChainColKey = (typeof OPTION_CHAIN_COL_KEYS)[number];

/** Max strike rows; 0 = show all. */
export type OptionChainRowLimit = 0 | 20 | 40 | 60;

export type OptionChainPrefs = {
  cols: OptionChainColKey[];
  rowLimit: OptionChainRowLimit;
};

export const OPTION_CHAIN_ROW_LIMITS: OptionChainRowLimit[] = [0, 20, 40, 60];

/** Default: quote-first columns (matches common T-quote density). */
export const DEFAULT_OPTION_CHAIN_COLS: OptionChainColKey[] = [
  "bid",
  "ask",
  "mid",
  "last",
  "chg",
  "vol",
  "oi",
  "iv",
];

export const DEFAULT_OPTION_CHAIN_PREFS: OptionChainPrefs = {
  cols: [...DEFAULT_OPTION_CHAIN_COLS],
  rowLimit: 40,
};

const STORAGE_KEY = "q-stock.option-chain.prefs";

function isColKey(v: unknown): v is OptionChainColKey {
  return (
    typeof v === "string" &&
    (OPTION_CHAIN_COL_KEYS as readonly string[]).includes(v)
  );
}

export function loadOptionChainPrefs(): OptionChainPrefs {
  if (typeof window === "undefined") return DEFAULT_OPTION_CHAIN_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OPTION_CHAIN_PREFS;
    const parsed = JSON.parse(raw) as Partial<OptionChainPrefs>;
    const cols = Array.isArray(parsed.cols)
      ? parsed.cols.filter(isColKey)
      : [];
    const rowLimit = ([0, 20, 40, 60] as const).includes(
      parsed.rowLimit as OptionChainRowLimit,
    )
      ? (parsed.rowLimit as OptionChainRowLimit)
      : DEFAULT_OPTION_CHAIN_PREFS.rowLimit;
    return {
      cols: cols.length > 0 ? cols : [...DEFAULT_OPTION_CHAIN_COLS],
      rowLimit,
    };
  } catch {
    return DEFAULT_OPTION_CHAIN_PREFS;
  }
}

export function saveOptionChainPrefs(prefs: OptionChainPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

/** Keep SIDE_FROM_STRIKE order; drop hidden keys. */
export function orderedVisibleCols(
  cols: OptionChainColKey[],
): OptionChainColKey[] {
  const set = new Set(cols);
  return OPTION_CHAIN_COL_KEYS.filter((k) => set.has(k));
}

/**
 * Window strike rows around spot (ATM-centric). If no spot, take from the start.
 */
export function limitRowsAroundSpot<T extends { strike: number }>(
  rows: T[],
  spot: number | null,
  limit: OptionChainRowLimit,
): T[] {
  if (!limit || limit <= 0 || rows.length <= limit) return rows;
  if (spot == null || !(spot > 0)) return rows.slice(0, limit);

  let best = 0;
  for (let i = 1; i < rows.length; i++) {
    if (
      Math.abs(rows[i]!.strike - spot) < Math.abs(rows[best]!.strike - spot)
    ) {
      best = i;
    }
  }
  const half = Math.floor(limit / 2);
  let start = Math.max(0, best - half);
  let end = start + limit;
  if (end > rows.length) {
    end = rows.length;
    start = Math.max(0, end - limit);
  }
  return rows.slice(start, end);
}
