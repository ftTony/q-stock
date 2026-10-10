type PanelSkeletonProps = {
  className?: string;
  /** Number of field-like rows under the title bar. */
  rows?: number;
  /** Accessible label (e.g. common.loading). */
  label?: string;
};

/** Shared loading placeholder for settings / form panels. */
export function PanelSkeleton({
  className = "",
  rows = 3,
  label,
}: PanelSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`qt-panel space-y-3 p-4 ${className}`}
    >
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-full max-w-lg animate-pulse rounded bg-[var(--surface-2)]" />
      </div>
      <div className="space-y-2.5 pt-1">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse rounded-lg bg-[var(--surface-2)]"
            style={{ maxWidth: i === rows - 1 ? "40%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

/** Compact spinner + label for inline / list loading. */
export function InlineLoading({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`inline-flex items-center gap-2 text-sm text-[var(--muted)] ${className}`}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
