/** Persisted chart UI prefs (client-only). */

const STORAGE_KEY = "qstock.chartSettings.v1";

export type ChartUiSettings = {
  /** Show paper buy/sell markers on the candle pane. */
  showTradeMarkers: boolean;
};

const DEFAULTS: ChartUiSettings = {
  showTradeMarkers: true,
};

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
