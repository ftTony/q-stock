"use client";

import { useCallback, useLayoutEffect, useState } from "react";

export type LayoutMode = "side" | "stack";

export type SymbolLayoutModules = {
  watchlist: boolean;
  rail: boolean;
  chart: boolean;
  newsDock: boolean;
};

export type SymbolLayoutPrefs = {
  layoutMode: LayoutMode;
  modules: SymbolLayoutModules;
};

export const SYMBOL_LAYOUT_KEY = "qstock.symbolLayout.v2";

export const DEFAULT_SYMBOL_LAYOUT: SymbolLayoutPrefs = {
  layoutMode: "side",
  modules: {
    watchlist: false,
    rail: true,
    chart: true,
    newsDock: true,
  },
};

export type LayoutModuleKey = keyof SymbolLayoutModules;

function isLayoutMode(v: unknown): v is LayoutMode {
  return v === "side" || v === "stack";
}

function readLegacyOpen(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw !== "0";
  } catch {
    return fallback;
  }
}

function readPrefs(): SymbolLayoutPrefs {
  if (typeof window === "undefined") return DEFAULT_SYMBOL_LAYOUT;
  try {
    const raw = localStorage.getItem(SYMBOL_LAYOUT_KEY);
    // First visit: seed visibility from existing open keys.
    if (!raw) {
      return {
        ...DEFAULT_SYMBOL_LAYOUT,
        modules: {
          ...DEFAULT_SYMBOL_LAYOUT.modules,
          watchlist: readLegacyOpen(
            "qstock.symbolWatchlistOpen.v1",
            DEFAULT_SYMBOL_LAYOUT.modules.watchlist,
          ),
          rail: readLegacyOpen(
            "qstock.symbolRailOpen.v1",
            DEFAULT_SYMBOL_LAYOUT.modules.rail,
          ),
        },
      };
    }
    const parsed = JSON.parse(raw) as Partial<SymbolLayoutPrefs>;
    const modules: Partial<SymbolLayoutModules> = parsed.modules ?? {};
    return {
      layoutMode: isLayoutMode(parsed.layoutMode)
        ? parsed.layoutMode
        : DEFAULT_SYMBOL_LAYOUT.layoutMode,
      modules: {
        watchlist:
          typeof modules.watchlist === "boolean"
            ? modules.watchlist
            : DEFAULT_SYMBOL_LAYOUT.modules.watchlist,
        rail:
          typeof modules.rail === "boolean"
            ? modules.rail
            : DEFAULT_SYMBOL_LAYOUT.modules.rail,
        chart:
          typeof modules.chart === "boolean"
            ? modules.chart
            : DEFAULT_SYMBOL_LAYOUT.modules.chart,
        newsDock:
          typeof modules.newsDock === "boolean"
            ? modules.newsDock
            : DEFAULT_SYMBOL_LAYOUT.modules.newsDock,
      },
    };
  } catch {
    return DEFAULT_SYMBOL_LAYOUT;
  }
}

function writePrefs(next: SymbolLayoutPrefs) {
  try {
    localStorage.setItem(SYMBOL_LAYOUT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Desktop workbench layout: side vs stack + module visibility. */
export function useSymbolLayoutPrefs() {
  const [prefs, setPrefs] = useState<SymbolLayoutPrefs>(DEFAULT_SYMBOL_LAYOUT);
  const [ready, setReady] = useState(false);

  // Before paint so watchlist/rail modules match storage on first visible frame.
  useLayoutEffect(() => {
    setPrefs(readPrefs());
    setReady(true);
  }, []);

  const commit = useCallback(
    (
      updater:
        | SymbolLayoutPrefs
        | ((prev: SymbolLayoutPrefs) => SymbolLayoutPrefs),
    ) => {
      setPrefs((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        writePrefs(next);
        return next;
      });
    },
    [],
  );

  const setLayoutMode = useCallback(
    (layoutMode: LayoutMode) => {
      commit((prev) => ({ ...prev, layoutMode }));
    },
    [commit],
  );

  const setModule = useCallback(
    (key: LayoutModuleKey, value: boolean) => {
      commit((prev) => ({
        ...prev,
        modules: { ...prev.modules, [key]: value },
      }));
    },
    [commit],
  );

  const resetLayout = useCallback(() => {
    commit(DEFAULT_SYMBOL_LAYOUT);
  }, [commit]);

  return {
    prefs,
    ready,
    setLayoutMode,
    setModule,
    resetLayout,
  };
}
