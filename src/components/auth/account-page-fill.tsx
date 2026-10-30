import type { ReactNode } from "react";

/**
 * Account empty / loading surface.
 * - H5: white full-bleed under the top bar, paints through main `pb-24` so no parchment strip above the tab bar.
 * - Desktop: prior bordered panel card.
 */
export function AccountPageFill({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-1 flex-col bg-[var(--panel)] max-lg:-mb-24 max-lg:min-h-[calc(100dvh-2.5rem)] max-lg:pb-24 lg:min-h-[calc(100dvh-7rem)] lg:flex-none lg:border lg:border-[var(--border)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Session-resolving placeholder — same fill geometry as login gates. */
export function AccountPageLoading({ label = "…" }: { label?: string }) {
  return (
    <AccountPageFill className="items-center justify-center px-6 py-10">
      <p className="text-sm text-[var(--muted)]" role="status" aria-busy="true">
        {label}
      </p>
    </AccountPageFill>
  );
}
