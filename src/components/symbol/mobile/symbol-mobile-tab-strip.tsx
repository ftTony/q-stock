"use client";

import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";

type TabItem = { id: SymbolTab; label: string };

type Props = {
  tabs: TabItem[];
  tab: SymbolTab;
  onTabChange: (id: SymbolTab) => void;
};

/**
 * Child of segment「更多」— soft chips, not a second equal-weight underline tab row.
 * Tap active again → leave 更多 (parent maps chart → 计划).
 */
export function SymbolMobileTabStrip({ tabs, tab, onTabChange }: Props) {
  const secondary = tabs.filter((x) => x.id !== "chart");
  if (!secondary.length) return null;

  return (
    <div className="aw-mobile-more-chips shrink-0 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-pearl,#fafafc)] px-2 py-1.5 lg:hidden">
      <div
        role="tablist"
        className="flex flex-wrap items-center gap-1.5"
      >
        {secondary.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active ? "true" : undefined}
              onClick={() => {
                if (active) onTabChange("chart");
                else onTabChange(item.id);
              }}
              className="aw-mobile-more-chip inline-flex h-7 items-center rounded-none px-2.5 text-[12px] leading-none tracking-[-0.1px] text-[var(--aw-ink-muted-48,var(--muted))] transition-colors data-[active=true]:bg-[var(--brand-soft)] data-[active=true]:font-medium data-[active=true]:text-[var(--brand-text)]"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
