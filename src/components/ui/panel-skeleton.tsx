import type { CSSProperties } from "react";
import "./panel-skeleton.css";

type PanelSkeletonProps = {
  className?: string;
  /** Number of field-like rows under the title bar. */
  rows?: number;
  /** Accessible label (e.g. common.loading). */
  label?: string;
};

/** Single shimmer block — building unit for area skeletons. */
export function Skel({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`aw-skel rounded-sm ${className}`} style={style} aria-hidden />;
}

/** Flat loading placeholder — no card chrome (matches settings / dock panels). */
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
      className={`space-y-3 py-1 ${className}`}
    >
      <div className="space-y-2">
        <Skel className="h-3.5 w-28" />
        <Skel className="h-3 w-full max-w-md" />
      </div>
      <div className="space-y-2 pt-0.5">
        {Array.from({ length: rows }, (_, i) => (
          <Skel
            key={i}
            className="h-8 w-full"
            style={{ maxWidth: i === rows - 1 ? "42%" : "100%" }}
          />
        ))}
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

/** News / press / comment list loading — stacked headline rows. */
export function ListPanelSkeleton({
  rows = 6,
  label,
  className = "",
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`space-y-0 ${className}`}
    >
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] py-3 last:border-0"
        >
          <Skel className="h-3.5 w-[88%]" />
          <Skel
            className="h-3 w-full"
            style={{ maxWidth: i % 2 === 0 ? "72%" : "58%" }}
          />
          <Skel className="h-2.5 w-24" />
        </div>
      ))}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

/**
 * Chart / workbench fill — toolbar chips + candle shimmer (no wash / center spinner).
 * Must stretch with the desktop chart column (`h-full` / `flex-1`).
 */
export function ChartAreaSkeleton({
  label,
  className = "",
  /** When embedded under a real toolbar, hide the fake chip row. */
  hideToolbar = false,
}: {
  label?: string;
  className?: string;
  hideToolbar?: boolean;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`flex h-full min-h-0 w-full flex-1 flex-col bg-[var(--aw-canvas,var(--surface))] ${className}`}
    >
      {hideToolbar ? null : (
        <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--surface)] px-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skel
              key={i}
              className="h-6 rounded-md"
              style={{ width: i < 4 ? 28 : 36 }}
            />
          ))}
          <span className="mx-1 hidden h-3 w-px bg-[var(--border)] lg:block" aria-hidden />
          {Array.from({ length: 3 }, (_, i) => (
            <Skel
              key={`ind-${i}`}
              className="hidden h-6 w-9 rounded-md lg:block"
            />
          ))}
        </div>
      )}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[var(--panel,var(--surface))]">
        {/* Grid suggestion — keeps pane from reading as empty white. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--aw-hairline,var(--border)) 1px, transparent 1px), linear-gradient(to top, var(--aw-hairline,var(--border)) 1px, transparent 1px)",
            backgroundSize: "12.5% 20%",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-6 top-5 flex items-end justify-between gap-0.5 sm:inset-x-6 sm:gap-1">
          {Array.from({ length: 24 }, (_, i) => {
            const h = 22 + ((i * 37) % 62);
            const wick = Math.min(12, 8 + (i % 5));
            return (
              <div
                key={i}
                className="flex w-[2.8%] min-w-[3px] max-w-[10px] flex-col items-center justify-end"
                style={{ height: `${h + wick}%` }}
              >
                <Skel
                  className="w-px flex-1 rounded-none opacity-70"
                  style={{ animationDelay: `${(i % 8) * 60}ms` }}
                />
                <Skel
                  className="w-full rounded-[1px]"
                  style={{
                    height: `${(h / (h + wick)) * 100}%`,
                    animationDelay: `${(i % 8) * 60}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {label ? (
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-[var(--muted)]">
            {label}
          </p>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
}

/** Compact fill for rail / side panels (depth, plan, funds). */
export function RailPanelSkeleton({
  rows = 5,
  label,
  className = "",
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`flex min-h-[12rem] flex-col gap-2 p-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <Skel className="h-3 w-16" />
        <Skel className="h-3 w-10" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skel className="h-3 w-8" />
          <Skel className="h-3 flex-1" />
          <Skel className="h-3 w-12" />
        </div>
      ))}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

/** Quiet corner mark while chart stays mounted (period / symbol refresh). */
export function ChartLoadingOverlay({ label }: { label?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="absolute right-3 top-3 rounded-md border border-[var(--aw-hairline,var(--border))] bg-[var(--panel,var(--surface))]/92 px-2 py-1 shadow-sm backdrop-blur-[2px]">
        <InlineLoading label={label} />
      </div>
    </div>
  );
}

/** Compact spinner (+ optional label) for inline / list loading. */
export function InlineLoading({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`inline-flex items-center gap-2 text-[12px] text-[var(--muted)] ${className}`}
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
      {label ? <span>{label}</span> : null}
    </div>
  );
}
