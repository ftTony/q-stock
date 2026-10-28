"use client";

export type FundamentalsSection =
  | "metrics"
  | "income"
  | "balance"
  | "cashflow"
  | "calendar"
  | "profile"
  | "officers";

type NavItem = {
  id: FundamentalsSection;
  label: string;
  available: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

type Props = {
  groups: NavGroup[];
  active: FundamentalsSection;
  onSelect: (id: FundamentalsSection) => void;
};

/** Left rail for 基本面 — category + indented items; active in brand/orange accent. */
export function SymbolFundamentalsNav({ groups, active, onSelect }: Props) {
  return (
    <nav
      aria-label="fundamentals"
      className="flex w-full gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto sm:flex-col sm:gap-4 sm:overflow-visible sm:pb-0 sm:pr-4 [&::-webkit-scrollbar]:hidden"
    >
      {groups.map((g) => (
        <div key={g.id} className="flex shrink-0 flex-col gap-0.5 sm:gap-1">
          <div className="flex items-center gap-1.5 px-2 py-1 sm:px-0">
            <span
              className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)] sm:inline-block"
              aria-hidden
            />
            <span className="text-[12px] font-semibold tracking-[-0.08px] text-[var(--foreground)]">
              {g.label}
            </span>
          </div>
          <ul className="flex gap-0.5 sm:flex-col sm:gap-0.5 sm:pl-3">
            {g.items.map((item) => {
              if (!item.available) return null;
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-[12px] leading-tight tracking-[-0.08px] transition-colors sm:w-full sm:rounded-none sm:px-1.5 sm:py-1 ${
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] font-medium text-[var(--brand-text)] sm:bg-transparent"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
