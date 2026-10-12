/** Sketch: Level-1 last/change only. */
export function BasicQuoteVisual() {
  return (
    <svg
      viewBox="0 0 420 260"
      className="h-auto w-full text-[var(--muted)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="12"
        y="16"
        width="396"
        height="228"
        rx="18"
        fill="color-mix(in srgb, var(--panel) 92%, transparent)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <text
        x="36"
        y="52"
        fill="currentColor"
        fontSize="13"
        fontFamily="var(--font-geist-sans), sans-serif"
        opacity="0.7"
      >
        L1 · Quote
      </text>
      <text
        x="36"
        y="98"
        fill="var(--foreground)"
        fontSize="28"
        fontWeight="600"
        fontFamily="var(--font-geist-mono), monospace"
      >
        178.42
      </text>
      <text
        x="168"
        y="98"
        fill="var(--up)"
        fontSize="16"
        fontWeight="600"
        fontFamily="var(--font-geist-mono), monospace"
      >
        +1.26%
      </text>
      <rect
        x="36"
        y="122"
        width="120"
        height="10"
        rx="5"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect
        x="36"
        y="148"
        width="200"
        height="8"
        rx="4"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M36 210 C 90 198, 130 220, 180 190 S 280 160, 360 175"
        stroke="var(--brand-text)"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="360"
        cy="175"
        r="4"
        fill="var(--brand-text)"
        fillOpacity="0.45"
      />
      {/* Locked depth hint */}
      <rect
        x="250"
        y="40"
        width="140"
        height="88"
        rx="12"
        fill="color-mix(in srgb, var(--surface-2) 70%, transparent)"
        stroke="var(--border)"
        strokeDasharray="4 3"
      />
      <text
        x="320"
        y="82"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontFamily="var(--font-geist-sans), sans-serif"
        opacity="0.55"
      >
        Depth locked
      </text>
      <text
        x="320"
        y="100"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontFamily="var(--font-geist-sans), sans-serif"
        opacity="0.45"
      >
        No L2 book
      </text>
    </svg>
  );
}

/** Sketch: Level-2 depth book + ticks. */
export function AdvancedQuoteVisual() {
  const asks = [
    { y: 56, w: 70, px: "178.50", sz: "1.2k" },
    { y: 78, w: 110, px: "178.48", sz: "3.4k" },
    { y: 100, w: 150, px: "178.46", sz: "5.1k" },
    { y: 122, w: 90, px: "178.44", sz: "2.0k" },
  ];
  const bids = [
    { y: 160, w: 160, px: "178.42", sz: "6.8k" },
    { y: 182, w: 120, px: "178.40", sz: "4.2k" },
    { y: 204, w: 95, px: "178.38", sz: "2.7k" },
    { y: 226, w: 70, px: "178.36", sz: "1.5k" },
  ];

  return (
    <svg
      viewBox="0 0 420 260"
      className="h-auto w-full text-[var(--brand-text)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="12"
        y="16"
        width="396"
        height="228"
        rx="18"
        fill="color-mix(in srgb, var(--brand) 6%, var(--panel))"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <text
        x="36"
        y="44"
        fill="currentColor"
        fontSize="13"
        fontFamily="var(--font-geist-sans), sans-serif"
        opacity="0.85"
      >
        L2 · Depth + ticks
      </text>

      {/* Ask ladder */}
      {asks.map((row) => (
        <g key={`a-${row.y}`}>
          <rect
            x={250 - row.w}
            y={row.y}
            width={row.w}
            height="16"
            rx="3"
            fill="var(--down)"
            fillOpacity="0.18"
          />
          <text
            x="258"
            y={row.y + 12}
            fill="var(--down)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {row.px}
          </text>
          <text
            x="330"
            y={row.y + 12}
            fill="var(--muted)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {row.sz}
          </text>
        </g>
      ))}

      {/* Spread line */}
      <line
        x1="36"
        x2="384"
        y1="148"
        y2="148"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeDasharray="3 3"
      />

      {/* Bid ladder */}
      {bids.map((row) => (
        <g key={`b-${row.y}`}>
          <rect
            x="36"
            y={row.y}
            width={row.w}
            height="16"
            rx="3"
            fill="var(--up)"
            fillOpacity="0.2"
          />
          <text
            x="210"
            y={row.y + 12}
            fill="var(--up)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {row.px}
          </text>
          <text
            x="280"
            y={row.y + 12}
            fill="var(--muted)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {row.sz}
          </text>
        </g>
      ))}

      {/* Tick stream */}
      <rect
        x="36"
        y="56"
        width="88"
        height="78"
        rx="10"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx={52}
          cy={72 + i * 14}
          r="3"
          fill={i % 2 === 0 ? "var(--up)" : "var(--down)"}
          fillOpacity="0.75"
        />
      ))}
      <text
        x="64"
        y="76"
        fill="var(--foreground)"
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
        opacity="0.7"
      >
        ticks
      </text>
    </svg>
  );
}
