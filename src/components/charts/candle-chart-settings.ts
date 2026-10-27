/** Persisted chart UI prefs (client-only). */

const STORAGE_KEY = "qstock.chartSettings.v1";

export type ChartCandleType = "candle" | "area";

export type ChartUiSettings = {
  /** Show paper buy/sell markers on the candle pane. */
  showTradeMarkers: boolean;
  /**
   * Explicit chart style. When omitted, resolve by resolution
   * (intraday timeline → area, else candle).
   */
  chartType?: ChartCandleType;
};

const DEFAULTS: ChartUiSettings = {
  showTradeMarkers: true,
};

export function isChartCandleType(v: unknown): v is ChartCandleType {
  return v === "candle" || v === "area";
}

/** Effective type for KLine styles. */
export function resolveCandleType(
  settings: Pick<ChartUiSettings, "chartType">,
  resolution: string,
): ChartCandleType {
  if (isChartCandleType(settings.chartType)) return settings.chartType;
  return resolution === "T" ? "area" : "candle";
}

export function readChartUiSettings(): ChartUiSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ChartUiSettings>;
    return {
      showTradeMarkers:
        typeof parsed.showTradeMarkers === "boolean"
          ? parsed.showTradeMarkers
          : DEFAULTS.showTradeMarkers,
      chartType: isChartCandleType(parsed.chartType)
        ? parsed.chartType
        : undefined,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeChartUiSettings(next: ChartUiSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
