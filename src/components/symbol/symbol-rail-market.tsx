"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SymbolRailDepth } from "@/components/symbol/symbol-rail-depth";
import type { AssetType } from "@/lib/types";

const SymbolFundsPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-funds-panel").then((m) => ({
      default: m.SymbolFundsPanel,
    })),
  { ssr: false },
);

const SymbolShortPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-short-panel").then((m) => ({
      default: m.SymbolShortPanel,
    })),
  { ssr: false },
);

const SymbolChipsPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-chips-panel").then((m) => ({
      default: m.SymbolChipsPanel,
    })),
  { ssr: false },
);

type Props = {
  symbol: string;
  assetType: AssetType;
};

/** Mount below-fold Market panels after idle / first paint to avoid candle fan-out. */
function useDeferredMount(delayMs = 400) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const run = () => setReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: delayMs + 1600 });
    } else {
      timeoutId = setTimeout(run, delayMs);
    }
    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [delayMs]);
  return ready;
}

function LazySection({
  children,
  rootMargin = "120px",
}: {
  children: ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className="border-t border-[var(--aw-hairline)] px-3 py-3">
      {visible ? children : <div className="h-16" aria-hidden />}
    </div>
  );
}

export function SymbolRailMarket({ symbol, assetType }: Props) {
  const showFunds =
    assetType === "stock" || assetType === "hk" || assetType === "cn";
  const showShort = assetType === "stock" || assetType === "hk";
  const showChips =
    assetType === "stock" || assetType === "hk" || assetType === "cn";
  const deferred = useDeferredMount(500);

  return (
    <div className="bg-[var(--aw-canvas)]">
      <SymbolRailDepth mode="split" symbol={symbol} assetType={assetType} />
      {deferred && showFunds ? (
        <LazySection>
          <SymbolFundsPanel symbol={symbol} assetType={assetType} />
        </LazySection>
      ) : null}
      {deferred && showShort ? (
        <LazySection>
          <SymbolShortPanel symbol={symbol} assetType={assetType} />
        </LazySection>
      ) : null}
      {deferred && showChips ? (
        <LazySection rootMargin="200px">
          <SymbolChipsPanel symbol={symbol} assetType={assetType} />
        </LazySection>
      ) : null}
    </div>
  );
}
