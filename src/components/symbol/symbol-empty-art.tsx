import type { ReactNode } from "react";

/** Shared empty-state line art for symbol docks / rails (brand-tint stroke). */

const svgClass = "h-14 w-auto text-[var(--brand)]";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 100" className={svgClass} aria-hidden>
      {children}
    </svg>
  );
}

export function EmptyNewsArt() {
  return (
    <Frame>
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
    </Frame>
  );
}

export function EmptyWatchlistArt() {
  return (
    <Frame>
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
    </Frame>
  );
}

export function EmptyReviewArt() {
  return (
    <Frame>
      <rect
        x="28"
        y="16"
        width="104"
        height="68"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M44 52h16M68 40h16M92 58h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M44 52V36M68 40V28M92 58V44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.7"
      />
    </Frame>
  );
}

export function EmptyChartArt() {
  return (
    <Frame>
      <rect
        x="24"
        y="16"
        width="112"
        height="68"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M36 64l18-14 16 8 22-22 18 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.65"
      />
    </Frame>
  );
}

export function EmptyDepthArt() {
  return (
    <Frame>
      <rect
        x="28"
        y="18"
        width="48"
        height="64"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <rect
        x="84"
        y="18"
        width="48"
        height="64"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M36 30h32M36 42h24M36 54h28M36 66h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M92 30h32M92 42h24M92 54h28M92 66h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.7"
      />
    </Frame>
  );
}

export function EmptyHistoryArt() {
  return (
    <Frame>
      <rect
        x="34"
        y="14"
        width="92"
        height="72"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M48 32h64M48 46h48M48 60h56"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.5"
      />
      <circle cx="52" cy="32" r="2.5" fill="currentColor" opacity="0.55" />
      <circle cx="52" cy="46" r="2.5" fill="currentColor" opacity="0.55" />
      <circle cx="52" cy="60" r="2.5" fill="currentColor" opacity="0.55" />
    </Frame>
  );
}

export type EmptyArtKind =
  | "news"
  | "watchlist"
  | "review"
  | "chart"
  | "depth"
  | "history";

function Art({ kind }: { kind: EmptyArtKind }) {
  switch (kind) {
    case "news":
      return <EmptyNewsArt />;
    case "watchlist":
      return <EmptyWatchlistArt />;
    case "review":
      return <EmptyReviewArt />;
    case "chart":
      return <EmptyChartArt />;
    case "depth":
      return <EmptyDepthArt />;
    case "history":
      return <EmptyHistoryArt />;
  }
}

export function EmptyStateBlock({
  label,
  art,
  children,
  compact,
}: {
  label: string;
  art: EmptyArtKind;
  children?: ReactNode;
  /** Shorter min-height for nested rail sections. */
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-3 px-3 text-center ${
        compact
          ? "min-h-[8rem] py-6"
          : "min-h-[min(42vh,16rem)] py-8"
      }`}
    >
      <Art kind={art} />
      <p className="max-w-sm text-[13px] tracking-[-0.08px] text-[var(--muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}
