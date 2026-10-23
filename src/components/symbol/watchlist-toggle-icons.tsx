/** Shared glyphs for watchlist collapse / expand (Futu-style). */

const SW = 1.65;

/** Expanded → collapse: square + arrow left. */
export function IconWatchlistCollapse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M14 8.5l-3.5 3.5L14 15.5M10.5 12H16"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Manage watchlist — gear / settings. */
export function IconWatchlistManage({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Collapsed → expand: list + heart. */
export function IconWatchlistExpand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 11.5h10M5 16h7"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M15.6 14.2c.7-.7 1.9-.7 2.6 0 .7.7.7 1.9 0 2.6L16.9 18l-1.3-1.2c-.7-.7-.7-1.9 0-2.6z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}
