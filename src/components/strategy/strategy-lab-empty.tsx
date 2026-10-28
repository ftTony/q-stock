import type { ReactNode } from "react";

type ArtKind = "strategy" | "history" | "search" | "auth";

function Frame({
  children,
  compact,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`block text-[var(--brand)] ${compact ? "h-14 w-14" : "h-20 w-20"}`}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function StrategyArt({ compact }: { compact?: boolean }) {
  return (
    <Frame compact={compact}>
      <rect
        x="10"
        y="8"
        width="28"
        height="32"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M15 16h12M15 24h16M15 32h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        opacity="0.5"
      />
      <path
        d="M34 14v12M30 20h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        opacity="0.7"
      />
    </Frame>
  );
}

function HistoryArt({ compact }: { compact?: boolean }) {
  return (
    <Frame compact={compact}>
      <rect
        x="8"
        y="10"
        width="32"
        height="28"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M13 30h4M19 24h4M25 27h4M31 20h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M15 30V22M21 24V16M27 27V20M33 20V14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        opacity="0.7"
      />
    </Frame>
  );
}

function SearchArt({ compact }: { compact?: boolean }) {
  return (
    <Frame compact={compact}>
      <circle
        cx="21"
        cy="21"
        r="10"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M28 28l8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.65"
      />
    </Frame>
  );
}

function AuthArt({ compact }: { compact?: boolean }) {
  return (
    <Frame compact={compact}>
      <rect
        x="12"
        y="18"
        width="24"
        height="20"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M17 18v-3a7 7 0 0 1 14 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />
      <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.55" />
    </Frame>
  );
}

function Art({ kind, compact }: { kind: ArtKind; compact?: boolean }) {
  switch (kind) {
    case "strategy":
      return <StrategyArt compact={compact} />;
    case "history":
      return <HistoryArt compact={compact} />;
    case "search":
      return <SearchArt compact={compact} />;
    case "auth":
      return <AuthArt compact={compact} />;
  }
}

type Props = {
  art: ArtKind;
  label: string;
  /** One primary next step (link or button). */
  action?: ReactNode;
  compact?: boolean;
};

/**
 * Lab empty state — one line + one action; no bordered card chrome
 * (ui-design-principles / trading rails).
 */
export function StrategyLabEmpty({ art, label, action, compact }: Props) {
  return (
    <div
      className={`flex w-full flex-1 flex-col items-center justify-center px-4 ${
        compact ? "min-h-[8rem] py-6" : "min-h-0 py-10"
      }`}
    >
      {/* w-max: one shrink-wrap column so icon / copy / CTA share the same center axis */}
      <div className="mx-auto flex w-max max-w-full flex-col items-center gap-3 text-center">
        <Art kind={art} compact={compact} />
        <p className="text-[13px] leading-relaxed tracking-[-0.08px] text-[var(--muted)]">
          {label}
        </p>
        {action ? <div className="pt-0.5">{action}</div> : null}
      </div>
    </div>
  );
}
