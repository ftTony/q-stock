/** Full-bleed market-desk atmosphere behind the landing hero copy. */
export function HeroAtmosphere({ inView }: { inView: boolean }) {
  return (
    <div
      key={inView ? "hero-atmos-in" : "hero-atmos-out"}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        inView ? "mkt-hero-atmos is-in" : "mkt-hero-atmos"
      }`}
      aria-hidden
    >
      {/* Brand glows — weight to the right so the empty side fills */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(900px 420px at 12% -8%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 70%)",
            "radial-gradient(720px 480px at 92% 18%, color-mix(in srgb, var(--brand) 18%, transparent), transparent 65%)",
            "radial-gradient(520px 360px at 78% 88%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Chart plane — stronger on md+ / right half */}
      <div className="absolute inset-y-0 right-0 w-full opacity-[0.22] sm:opacity-[0.32] md:w-[72%] md:opacity-[0.4] lg:w-[68%]">
        <svg
          className="mkt-hero-chart h-full w-full text-[var(--brand-text)]"
          viewBox="0 0 800 560"
          preserveAspectRatio="xMaxYMid slice"
          fill="none"
        >
          {/* Grid */}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="40"
              x2="780"
              y1={60 + i * 60}
              y2={60 + i * 60}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`v-${i}`}
              y1="40"
              y2="520"
              x1={80 + i * 72}
              x2={80 + i * 72}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          ))}

          {/* Soft area under the line */}
          <path
            d="M60 380 C 140 360, 180 420, 240 340 S 340 220, 400 260 S 500 320, 560 240 S 660 160, 740 190 L 740 520 L 60 520 Z"
            fill="currentColor"
            fillOpacity="0.06"
          />

          {/* Index-style path — draws once, then stays still */}
          <path
            className="mkt-hero-stroke"
            d="M60 380 C 140 360, 180 420, 240 340 S 340 220, 400 260 S 500 320, 560 240 S 660 160, 740 190"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            className="mkt-hero-tip"
            cx="740"
            cy="190"
            r="4.5"
            fill="currentColor"
          />

          {/* Candle stubs */}
          {[
            [120, 300, 40],
            [190, 280, 55],
            [260, 310, 35],
            [330, 250, 70],
            [400, 270, 45],
            [470, 230, 60],
            [540, 255, 50],
            [610, 200, 75],
            [680, 215, 42],
          ].map(([x, y, h], i) => (
            <g key={`c-${i}`} opacity={0.28 + (i % 3) * 0.06}>
              <line
                x1={x}
                x2={x}
                y1={y - 10}
                y2={y + h + 10}
                stroke="currentColor"
                strokeWidth="1.25"
              />
              <rect
                x={x - 7}
                y={y}
                width="14"
                height={h}
                rx="1.5"
                fill="currentColor"
                fillOpacity={i % 2 === 0 ? 0.35 : 0.22}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Left readability veil */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(90deg, var(--background) 0%, color-mix(in srgb, var(--background) 92%, transparent) 28%, color-mix(in srgb, var(--background) 45%, transparent) 52%, transparent 72%)",
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 55%, transparent) 0%, transparent 28%, transparent 72%, color-mix(in srgb, var(--background) 40%, transparent) 100%)",
          ].join(", "),
        }}
      />
    </div>
  );
}
