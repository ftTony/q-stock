/** One surface, hairline dividers — no nested qt-card grid. */
export function MarketsKpiStrip({
  items,
}: {
  items: {
    key: string;
    label: string;
    value: string;
    valueClass?: string;
    hint?: string;
    hintDot?: boolean;
  }[];
}) {
  return (
    <section className="qt-panel grid grid-cols-2 divide-y divide-[var(--border)] overflow-hidden sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.key} className="min-w-0 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
            <span className="truncate">{item.label}</span>
            {item.hintDot ? (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-text)]"
                aria-hidden
              />
            ) : null}
          </div>
          <div
            className={`mt-1 truncate text-base font-semibold tracking-tight tabular-nums sm:text-lg ${
              item.valueClass || "text-[var(--foreground)]"
            }`}
          >
            {item.value}
          </div>
          {item.hint ? (
            <div className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
              {item.hint}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
