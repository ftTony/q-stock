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

/** Classic gear — settings rail + watchlist manage. */
export function IconSettingsGear({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

/** @deprecated Use IconSettingsGear */
export const IconWatchlistManage = IconSettingsGear;

/** Collapse right quote/plan rail: square + arrow right. */
export function IconRailCollapse({ className }: { className?: string }) {
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
        d="M10 8.5l3.5 3.5L10 15.5M13.5 12H8"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Expand right rail from the side dock. */
export function IconRailExpand({ className }: { className?: string }) {
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
