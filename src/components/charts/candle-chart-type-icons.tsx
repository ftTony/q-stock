import type { ChartCandleType } from "@/components/charts/candle-chart-settings";

type IconProps = { className?: string };

/** TradingView-style candlestick glyph. */
export function ChartTypeCandleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="3.25" y="5" width="2.5" height="6" rx="0.4" />
      <rect x="4.25" y="2.5" width="0.5" height="11" />
      <rect x="10.25" y="4" width="2.5" height="7" rx="0.4" />
      <rect x="11.25" y="2" width="0.5" height="12" />
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
    case "area":
      return <ChartTypeAreaIcon className={className} />;
    case "candle":
    default:
      return <ChartTypeCandleIcon className={className} />;
  }
}
