import type { ChartCandleType } from "@/components/charts/candle-chart-settings";

type IconProps = { className?: string };

/** 实心阳线 — solid yin + solid yang. */
export function ChartTypeCandleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="3.25" y="5" width="2.5" height="6" rx="0.35" />
      <rect x="4.25" y="2.5" width="0.5" height="11" />
      <rect x="10.25" y="4" width="2.5" height="7" rx="0.35" />
      <rect x="11.25" y="2" width="0.5" height="12" />
    </svg>
  );
}

/** 空心阳线 — solid yin + hollow yang. */
export function ChartTypeCandleStrokeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="3.25" y="5" width="2.5" height="6" rx="0.35" />
      <rect x="4.25" y="2.5" width="0.5" height="11" />
      <rect
        x="10.25"
        y="4"
        width="2.5"
        height="7"
        rx="0.35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <rect x="11.25" y="2" width="0.5" height="12" />
    </svg>
  );
}

/** OHLC / American bar glyph. */
export function ChartTypeOhlcIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4.5 3.5v9" />
      <path d="M4.5 6H2.75" />
      <path d="M4.5 10h1.75" />
      <path d="M11.5 2.5v11" />
      <path d="M11.5 5H9.75" />
      <path d="M11.5 9.5h1.75" />
    </svg>
  );
}

/** Close-price line glyph. */
export function ChartTypeLineIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 11.5 5.2 7.8 7.8 9.6 11.2 4.5 14 7.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Heikin-Ashi (averaged candle) glyph — paired bodies. */
export function ChartTypeHeikinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="2.5" y="5.5" width="2.2" height="5" rx="0.35" />
      <rect x="3.35" y="3.5" width="0.5" height="9" />
      <rect x="7" y="4" width="2.2" height="6.5" rx="0.35" opacity="0.85" />
      <rect x="7.85" y="2.5" width="0.5" height="11" opacity="0.85" />
      <rect x="11.5" y="6" width="2.2" height="4.5" rx="0.35" opacity="0.7" />
      <rect x="12.35" y="4" width="0.5" height="8.5" opacity="0.7" />
    </svg>
  );
}

/** Baseline — close path with mid reference line. */
export function ChartTypeBaselineIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 8h12"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.7"
      />
      <path
        d="M2 11.5 5 7.5 8 9.5 11 4.5 14 7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 11.5 5 7.5 8 8 8 8H2z"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M8 8 11 4.5 14 7V8H8z"
        fill="currentColor"
        opacity="0.12"
      />
    </svg>
  );
}

/** Area / mountain trend glyph. */
export function ChartTypeAreaIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 11.5 5.2 7.8 7.8 9.6 11.2 4.5 14 7.2V13H2z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M2 11.5 5.2 7.8 7.8 9.6 11.2 4.5 14 7.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartTypeIcon({
  type,
  className = "h-4 w-4",
}: {
  type: ChartCandleType;
  className?: string;
}) {
  switch (type) {
    case "candle_stroke":
      return <ChartTypeCandleStrokeIcon className={className} />;
    case "ohlc":
      return <ChartTypeOhlcIcon className={className} />;
    case "line":
      return <ChartTypeLineIcon className={className} />;
    case "heikin":
      return <ChartTypeHeikinIcon className={className} />;
    case "baseline":
      return <ChartTypeBaselineIcon className={className} />;
    case "area":
      return <ChartTypeAreaIcon className={className} />;
    case "candle":
    default:
      return <ChartTypeCandleIcon className={className} />;
  }
}
