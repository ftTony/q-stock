/** Multi-period financial statement slice for earnings UI (newest-first). */

export type StatementPeriod = {
  label: string;
  year: number;
  quarter: number;
};

export type StatementUnit = "currency" | "eps" | "percent";

export type StatementRow = {
  key: string;
  /** Broker display name when not covered by i18n keys. */
  label?: string;
  unit: StatementUnit;
  /** Absolute values aligned to `periods` (newest first). */
  values: (number | null)[];
  /** YoY % aligned to `periods`; null when prior-year peer missing. */
  yoy: (number | null)[];
};

export type EarningsStatement = {
  periods: StatementPeriod[];
  rows: StatementRow[];
};
