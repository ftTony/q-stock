"use client";

import { Suspense } from "react";
import MarketsDashboard from "@/components/market/markets-dashboard";

export default function MarketsPage() {
  return (
    <Suspense
      fallback={
        <div className="qt-panel p-8 text-sm text-[var(--muted)]">Loading…</div>
      }
    >
      <MarketsDashboard />
    </Suspense>
  );
}
