import type { AnalysisTableRow } from "@/components/analysis/types";

export type AnalysisColId =
  | "price"
  | "change"
  | "percentChange"
  | "marketCap"
  | "volume"
  | "turnover"
  | "open"
  | "previousClose"
  | "high"
  | "low"
  | "turnoverRate"
  | "changeSpeed"
  | "amplitude"
  | "volumeRatio"
  | "orderRatio"
  | "change5d"
  | "change10d"
  | "change20d"
  | "change60d"
  | "change120d"
  | "change250d"
  | "changeYtd";

export type AnalysisSortDir = "asc" | "desc";

export const ANALYSIS_COL_DEFAULT_ORDER: AnalysisColId[] = [
  "price",
  "change",
  "percentChange",
  "marketCap",
  "volume",
  "turnover",
  "open",
  "previousClose",
  "high",
  "low",
  "turnoverRate",
  "changeSpeed",
  "amplitude",
  "volumeRatio",
  "orderRatio",
  "change5d",
  "change10d",
  "change20d",
  "change60d",
  "change120d",
  "change250d",
  "changeYtd",
];

export const ANALYSIS_COL_DEFAULT_WIDTHS: Record<AnalysisColId, number> = {
  price: 88,
  change: 80,
  percentChange: 88,
  marketCap: 96,
  volume: 88,
  turnover: 92,
  open: 80,
  previousClose: 80,
  high: 80,
  low: 80,
  turnoverRate: 84,
  changeSpeed: 88,
  amplitude: 80,
  volumeRatio: 72,
  orderRatio: 72,
  change5d: 96,
  change10d: 100,
  change20d: 100,
  change60d: 100,
  change120d: 108,
  change250d: 108,
  changeYtd: 88,
};

/** Pinned identity / ops columns (not in mid scroll order). */
export type AnalysisPinId = "symbol" | "name" | "actions";

export const ANALYSIS_PIN_DEFAULT_WIDTHS: Record<AnalysisPinId, number> = {
  symbol: 80,
  name: 120,
  actions: 120,
};

export const ANALYSIS_PIN_CHECK_W = 36;

export type AnalysisColLayout = {
  order: AnalysisColId[];
  widths: Record<AnalysisColId, number>;
  /** Optional pin widths (code / name / actions). */
  pins?: Partial<Record<AnalysisPinId, number>>;
};

/** v4: resizable pin columns (code / name / actions). */
export const ANALYSIS_COL_LAYOUT_KEY = "q-stock:analysis-rank-cols:v4";

/** i18n keys under `analysis.*` for data columns. */
export const ANALYSIS_COL_LABEL_KEY: Record<AnalysisColId, string> = {
  price: "colPrice",
  change: "colChangeAbs",
  percentChange: "colChangePct",
  marketCap: "colMarketCap",
  volume: "colVolume",
  turnover: "colTurnover",
  open: "colOpen",
  previousClose: "prevClose",
  high: "high",
  low: "low",
  turnoverRate: "colTurnoverRate",
  changeSpeed: "colChangeSpeed",
  amplitude: "colAmplitude",
  volumeRatio: "colVolumeRatio",
  orderRatio: "colOrderRatio",
  change5d: "colChange5d",
  change10d: "colChange10d",
  change20d: "colChange20d",
  change60d: "colChange60d",
  change120d: "colChange120d",
  change250d: "colChange250d",
  changeYtd: "colChangeYtd",
};

function clampWidth(n: number) {
  return Math.max(56, Math.min(280, Math.round(n)));
}

function clampPinWidth(id: AnalysisPinId, n: number) {
  if (id === "symbol") return Math.max(56, Math.min(160, Math.round(n)));
  if (id === "name") return Math.max(72, Math.min(240, Math.round(n)));
  return Math.max(88, Math.min(200, Math.round(n)));
}

export function loadAnalysisColLayout(): AnalysisColLayout {
  const fallback: AnalysisColLayout = {
    order: ANALYSIS_COL_DEFAULT_ORDER,
    widths: { ...ANALYSIS_COL_DEFAULT_WIDTHS },
    pins: { ...ANALYSIS_PIN_DEFAULT_WIDTHS },
  };
  if (typeof window === "undefined") return fallback;
  try {
    // Prefer v4; fall back to v3 so mid widths migrate.
    const raw =
      window.localStorage.getItem(ANALYSIS_COL_LAYOUT_KEY) ??
      window.localStorage.getItem("q-stock:analysis-rank-cols:v3");
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AnalysisColLayout>;
    const savedOrder = Array.isArray(parsed.order) ? parsed.order : [];
    const order = [
      ...savedOrder.filter(
        (id): id is AnalysisColId =>
          typeof id === "string" &&
          ANALYSIS_COL_DEFAULT_ORDER.includes(id as AnalysisColId),
      ),
      ...ANALYSIS_COL_DEFAULT_ORDER.filter(
        (id) => !savedOrder.includes(id as AnalysisColId),
      ),
    ];
    const widths: Record<AnalysisColId, number> = {
      ...ANALYSIS_COL_DEFAULT_WIDTHS,
    };
    if (parsed.widths && typeof parsed.widths === "object") {
      for (const [id, value] of Object.entries(parsed.widths)) {
        if (
          ANALYSIS_COL_DEFAULT_ORDER.includes(id as AnalysisColId) &&
          typeof value === "number" &&
          Number.isFinite(value)
        ) {
          widths[id as AnalysisColId] = clampWidth(value);
        }
      }
    }
    const pins: Record<AnalysisPinId, number> = {
      ...ANALYSIS_PIN_DEFAULT_WIDTHS,
    };
    if (parsed.pins && typeof parsed.pins === "object") {
      for (const id of ["symbol", "name", "actions"] as const) {
        const value = parsed.pins[id];
        if (typeof value === "number" && Number.isFinite(value)) {
          pins[id] = clampPinWidth(id, value);
        }
      }
    }
    return { order, widths, pins };
  } catch {
    return fallback;
  }
}

export { clampPinWidth };

export function saveAnalysisColLayout(layout: AnalysisColLayout) {
  try {
    window.localStorage.setItem(ANALYSIS_COL_LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
}

export function colSortValue(
  row: AnalysisTableRow,
  id: AnalysisColId,
): number | null {
  switch (id) {
    case "price":
      return row.price;
    case "change":
      return row.change;
    case "percentChange":
      return row.percentChange;
    case "marketCap":
      return row.marketCap ?? null;
    case "volume":
      return row.volume ?? null;
    case "turnover":
      return row.turnover ?? null;
    case "open":
      return row.open;
    case "previousClose":
      return row.previousClose;
    case "high":
      return row.high;
    case "low":
      return row.low;
    case "turnoverRate":
      return row.turnoverRate ?? null;
    case "changeSpeed":
      return row.changeSpeed ?? null;
    case "amplitude":
      return row.amplitude ?? null;
    case "volumeRatio":
      return row.volumeRatio ?? null;
    case "orderRatio":
      return row.orderRatio ?? null;
    case "change5d":
      return row.change5d ?? null;
    case "change10d":
      return row.change10d ?? null;
    case "change20d":
      return row.change20d ?? null;
    case "change60d":
      return row.change60d ?? null;
    case "change120d":
      return row.change120d ?? null;
    case "change250d":
      return row.change250d ?? null;
    case "changeYtd":
      return row.changeYtd ?? null;
    default:
      return null;
  }
}

export function sortAnalysisRows(
  rows: AnalysisTableRow[],
  key: AnalysisColId,
  dir: AnalysisSortDir,
): AnalysisTableRow[] {
  const sign = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = colSortValue(a, key);
    const bv = colSortValue(b, key);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return sign * (av - bv);
  });
}
