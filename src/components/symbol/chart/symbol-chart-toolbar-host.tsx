"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HostApi = {
  host: HTMLElement | null;
  setHostNode: (node: HTMLElement | null) => void;
};

const ChartToolbarHostContext = createContext<HostApi | null>(null);

/** Stack layout: QuoteBar provides a host; chart portals its toolbar into it. */
export function SymbolChartToolbarHostProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const setHostNode = useCallback((node: HTMLElement | null) => {
    setHost(node);
  }, []);
  const value = useMemo(() => ({ host, setHostNode }), [host, setHostNode]);
  return (
    <ChartToolbarHostContext.Provider value={value}>
      {children}
    </ChartToolbarHostContext.Provider>
  );
}

export function useChartToolbarHost(): HostApi | null {
  return useContext(ChartToolbarHostContext);
}

/** Mount point inside QuoteBar for the portaled chart toolbar. */
export function SymbolChartToolbarHostSlot({
  className,
}: {
  className?: string;
}) {
  const api = useChartToolbarHost();
  if (!api) return null;
  return (
    <div
      ref={api.setHostNode}
      className={
        className ??
        "flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    />
  );
}
