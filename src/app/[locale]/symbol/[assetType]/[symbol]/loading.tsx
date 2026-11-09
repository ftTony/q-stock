import { SymbolRouteFallback } from "@/components/symbol/page/symbol-route-fallback";

/** Soft-nav instant UI while page.tsx awaits quote / candles. */
export default function SymbolLoading() {
  return <SymbolRouteFallback />;
}
