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
 * Chart / workbench fill — toolbar chips + pane shimmer.
 * Used for dynamic-import fallback and empty-bar first paint.
 */
export function ChartAreaSkeleton({
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
      className={`flex h-full min-h-[240px] flex-col bg-[var(--aw-canvas,var(--surface))] ${className}`}
    >
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--surface)] px-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skel
            key={i}
            className="h-6 rounded-md"
            style={{ width: i < 4 ? 28 : 36 }}
          />
        ))}
        <span className="mx-1 h-3 w-px bg-[var(--border)]" aria-hidden />
        {Array.from({ length: 3 }, (_, i) => (
          <Skel key={`ind-${i}`} className="h-6 w-9 rounded-md" />
        ))}
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Skel className="absolute inset-0 rounded-none" />
        <div className="pointer-events-none absolute inset-x-6 bottom-8 top-6 flex items-end justify-between gap-1 opacity-40">
          {Array.from({ length: 18 }, (_, i) => (
            <Skel
              key={i}
              className="w-[3%] min-w-[4px] rounded-sm"
              style={{
                height: `${28 + ((i * 17) % 55)}%`,
                animationDelay: `${(i % 6) * 80}ms`,
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <InlineLoading
            label={label}
            className="rounded-full bg-[color-mix(in_srgb,var(--aw-canvas,var(--surface))_82%,transparent)] px-3 py-1.5"
          />
        </div>
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

/** Soft wash overlay while chart stays mounted (period switch). */
export function ChartLoadingOverlay({ label }: { label?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[color-mix(in_srgb,var(--aw-canvas,var(--surface))_55%,transparent)]"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="aw-skel absolute inset-0 opacity-50" aria-hidden />
      <InlineLoading
        label={label}
        className="relative rounded-full bg-[color-mix(in_srgb,var(--aw-canvas,var(--surface))_88%,transparent)] px-3 py-1.5"
      />
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
