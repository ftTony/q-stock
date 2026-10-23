/** Shared empty-state line art for symbol docks / rails (brand-tint stroke). */

export function EmptyNewsArt() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="h-14 w-auto text-[var(--brand)]"
      aria-hidden
    >
      <rect
        x="36"
        y="14"
        width="88"
        height="72"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M48 30h64M48 42h48M48 54h56M48 66h36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.55"
      />
    </svg>
  );
}

export function EmptyWatchlistArt() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="h-14 w-auto text-[var(--brand)]"
      aria-hidden
    >
      <rect
        x="32"
        y="18"
        width="96"
        height="64"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M48 36h40M48 50h56M48 64h32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M118 34l4 8 9 1-6.5 6 1.5 9-8-4.5L110 58l1.5-9L105 43l9-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        opacity="0.7"
      />
    </svg>
  );
}

export function EmptyStateBlock({
  label,
  art,
}: {
  label: string;
  art: "news" | "watchlist";
}) {
  return (
    <div className="flex min-h-[min(42vh,16rem)] flex-1 flex-col items-center justify-center gap-3 px-3 py-8 text-center">
      {art === "news" ? <EmptyNewsArt /> : <EmptyWatchlistArt />}
      <p className="text-[13px] tracking-[-0.08px] text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}
