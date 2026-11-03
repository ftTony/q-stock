"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";
import type { AssetType } from "@/lib/types";

export type SymbolNavTarget = {
  symbol: string;
  assetType: AssetType;
};

type Ctx = {
  pending: SymbolNavTarget | null;
  setPending: (next: SymbolNavTarget | null) => void;
  /** True when navigating away from the currently loaded symbol. */
  isSwitching: boolean;
};

const SymbolNavPendingContext = createContext<Ctx | null>(null);

function sameTarget(
  a: SymbolNavTarget | null | undefined,
  symbol: string,
  assetType: AssetType,
): boolean {
  if (!a) return false;
  return (
    a.assetType === assetType &&
    a.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

export function SymbolNavPendingProvider({
  loadedSymbol,
  loadedAssetType,
  children,
}: {
  loadedSymbol: string;
  loadedAssetType: AssetType;
  children: ReactNode;
}) {
  const [pending, setPendingState] = useState<SymbolNavTarget | null>(null);

  const setPending = useCallback((next: SymbolNavTarget | null) => {
    setPendingState(next);
  }, []);

  // Soft-nav finished: RSC committed new props.
  useEffect(() => {
    setPendingState((prev) =>
      sameTarget(prev, loadedSymbol, loadedAssetType) ? null : prev,
    );
  }, [loadedSymbol, loadedAssetType]);

  const isSwitching = Boolean(
    pending && !sameTarget(pending, loadedSymbol, loadedAssetType),
  );

  const value = useMemo(
    () => ({ pending, setPending, isSwitching }),
    [pending, setPending, isSwitching],
  );

  return (
    <SymbolNavPendingContext.Provider value={value}>
      {children}
    </SymbolNavPendingContext.Provider>
  );
}

/** Cover only the workbench (quote + chart + rail), not the watchlist. */
export function SymbolNavPendingOverlay({ label }: { label?: string }) {
  const { isSwitching } = useSymbolNavPending();
  if (!isSwitching) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[40] bg-[color-mix(in_srgb,var(--aw-canvas,var(--panel))_72%,transparent)] backdrop-blur-[1px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <ChartLoadingOverlay label={label} placement="center" />
    </div>
  );
}

export function useSymbolNavPending(): Ctx {
  const ctx = useContext(SymbolNavPendingContext);
  if (!ctx) {
    return {
      pending: null,
      setPending: () => {},
      isSwitching: false,
    };
  }
  return ctx;
}

/** Highlight row for loaded symbol or optimistic pending target. */
export function isSymbolNavActive(
  rowSymbol: string,
  rowAssetType: AssetType,
  currentSymbol: string,
  currentAssetType: AssetType,
  pending: SymbolNavTarget | null,
): boolean {
  if (sameTarget(pending, rowSymbol, rowAssetType)) return true;
  if (pending) return false;
  return (
    rowAssetType === currentAssetType &&
    rowSymbol.toUpperCase() === currentSymbol.toUpperCase()
  );
}
