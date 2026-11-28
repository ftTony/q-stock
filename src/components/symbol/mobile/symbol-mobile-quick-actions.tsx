"use client";

import { useTranslations } from "next-intl";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";

/**
 * H5 top-level nav: 图表 + content pages (衍生品/新闻/基本面/…).
 * 行情 content lives under the chart; 计划/复盘 live in the bottom-bar drawer.
 * Desktop never renders this bar (lg:hidden).
 */
export type MobileSegment = SymbolTab;

type Props = {
  segment: MobileSegment;
  tabs: { id: SymbolTab; label: string }[];
  onSelectSegment: (segment: MobileSegment) => void;
};

export function SymbolMobileQuickActions({
  segment,
  tabs,
  onSelectSegment,
}: Props) {
  const tSymbol = useTranslations("symbol");

  const items: { id: MobileSegment; label: string; tour?: string }[] = [
    { id: "chart", label: tSymbol("chartTab"), tour: "rail-chart" },
    ...tabs.map((tab) => ({ id: tab.id, label: tab.label })),
  ];

  return (
    <div
      className="aw-mobile-segment shrink-0 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] lg:hidden"
      role="tablist"
      aria-label={tSymbol("chartTab")}
    >
      <div className="aw-mobile-segment-scroll qt-scroll flex h-9 w-full items-stretch overflow-x-auto">
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
              className="aw-tab aw-tab-mobile min-w-[3.5rem] flex-1 shrink-0 justify-center whitespace-nowrap"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
