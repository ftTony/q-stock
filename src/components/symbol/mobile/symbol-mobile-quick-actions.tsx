"use client";

import { useTranslations } from "next-intl";
import type { RailTab } from "@/components/symbol/rail/symbol-order-rail";

/** Under-chart primary segments. `more` reveals 新闻/基本面/衍生品. */
export type MobileSegment = RailTab | "more";

type Props = {
  segment: MobileSegment;
  showMarket: boolean;
  onSelectSegment: (segment: MobileSegment) => void;
};

/**
 * Single H5 segment bar under the chart (one layer of nav).
 * 交易 stays on QuoteBar — not a competing tab that owns the same pane.
 */
export function SymbolMobileQuickActions({
  segment,
  showMarket,
  onSelectSegment,
}: Props) {
  const tRail = useTranslations("symbolRail");

  const items: { id: MobileSegment; label: string; tour?: string }[] = [
    { id: "plan", label: tRail("plan"), tour: "rail-plan" },
    { id: "review", label: tRail("review"), tour: "rail-review" },
  ];
  if (showMarket) {
    items.push({ id: "market", label: tRail("market") });
  }
  items.push({ id: "more", label: tRail("more") });

  return (
    <div
      className="aw-mobile-segment shrink-0 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] lg:hidden"
      role="tablist"
      aria-label={tRail("plan")}
    >
      <div className="flex h-9 w-full items-stretch">
        {items.map((item) => {
          const active = segment === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active ? "true" : undefined}
              data-tour={item.tour}
              onClick={() => onSelectSegment(item.id)}
              className="aw-tab aw-tab-mobile flex-1 justify-center"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
