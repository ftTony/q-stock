"use client";

import { useCallback, useLayoutEffect, useMemo } from "react";
import {
  DEFAULT_SYMBOL_LAYOUT,
  type LayoutMode,
  type LayoutModuleKey,
  type SymbolLayoutPrefs,
  useSymbolWorkbenchStore,
} from "@/stores/symbol-workbench-store";

export {
  DEFAULT_SYMBOL_LAYOUT,
  SYMBOL_LAYOUT_KEY,
} from "@/stores/symbol-workbench-store";
export type {
  LayoutMode,
  LayoutModuleKey,
  SymbolLayoutModules,
  SymbolLayoutPrefs,
} from "@/stores/symbol-workbench-store";

/** Desktop workbench layout: side vs stack + module visibility. */
export function useSymbolLayoutPrefs() {
  const layoutMode = useSymbolWorkbenchStore((state) => state.layoutMode);
  const modules = useSymbolWorkbenchStore((state) => state.modules);
  const ready = useSymbolWorkbenchStore((state) => state.layoutReady);
  const hydrateLayout = useSymbolWorkbenchStore(
    (state) => state.hydrateLayout,
  );
  const setLayoutMode = useSymbolWorkbenchStore(
    (state) => state.setLayoutMode,
  );
  const setLayoutModule = useSymbolWorkbenchStore(
    (state) => state.setLayoutModule,
  );
  const resetLayout = useSymbolWorkbenchStore((state) => state.resetLayout);

  useLayoutEffect(() => {
    if (!ready) hydrateLayout();
  }, [ready, hydrateLayout]);

  const prefs = useMemo<SymbolLayoutPrefs>(
    () => ({ layoutMode, modules }),
    [layoutMode, modules],
  );
  const setModule = useCallback(
    (key: LayoutModuleKey, value: boolean) => setLayoutModule(key, value),
    [setLayoutModule],
  );

  return {
    prefs: ready ? prefs : DEFAULT_SYMBOL_LAYOUT,
    ready,
    setLayoutMode,
    setModule,
    resetLayout,
  };
}
