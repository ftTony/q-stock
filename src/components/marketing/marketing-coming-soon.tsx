import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";

/** Notebook + chart sketch for the learn coming-soon rail. */
function LearnVisual() {
  return (
    <svg
      viewBox="0 0 520 360"
      className="h-full w-full text-[var(--brand-text)]"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="learn-fill" x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0%"
            stopColor="currentColor"
            stopOpacity="0.16"
          />
          <stop
            offset="100%"
            stopColor="currentColor"
            stopOpacity="0.02"
          />
        </linearGradient>
      </defs>

      {/* Soft desk plane */}
      <rect
        x="36"
        y="48"
        width="448"
        height="264"
        rx="28"
        fill="color-mix(in srgb, var(--panel) 88%, transparent)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* Notebook */}
      <rect
        x="72"
        y="78"
        width="200"
        height="220"
        rx="14"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M96 78 V298"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="112"
          x2="248"
          y1={112 + i * 28}
          y2={112 + i * 28}
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {/* Bookmark */}
      <path
        d="M236 78 V128 L248 118 L260 128 V78"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />

      {/* Mini chart card */}
      <rect
        x="296"
        y="96"
        width="160"
        height="120"
        rx="16"
        fill="url(#learn-fill)"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M316 180 C 340 168, 352 150, 372 142 S 408 148, 436 118"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      <circle cx="436" cy="118" r="4.5" fill="currentColor" fillOpacity="0.8" />

      {/* Category chips */}
      <rect
        x="296"
        y="236"
        width="72"
        height="28"
        rx="10"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <rect
        x="380"
        y="236"
        width="76"
        height="28"
        rx="10"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <rect
        x="296"
        y="276"
        width="88"
        height="28"
        rx="10"
        fill="color-mix(in srgb, var(--surface-2) 80%, transparent)"
        stroke="var(--border)"
      />
    </svg>
  );
}

/** Growth / calculator sketch for the tools coming-soon rail. */
function ToolsVisual() {
  return (
    <svg
      viewBox="0 0 520 360"
      className="h-full w-full text-[var(--brand-text)]"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="tools-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect
        x="36"
        y="48"
        width="448"
        height="264"
        rx="28"
        fill="color-mix(in srgb, var(--panel) 88%, transparent)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* Compound curve panel */}
      <rect
        x="64"
        y="76"
        width="260"
        height="208"
        rx="16"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="84"
          x2="304"
          y1={120 + i * 36}
          y2={120 + i * 36}
          stroke="currentColor"
          strokeOpacity="0.08"
        />
      ))}
      <path
        d="M84 248 C 130 240, 150 220, 180 200 S 230 160, 260 130 S 290 100, 304 88 L 304 248 Z"
        fill="url(#tools-area)"
      />
      <path
        d="M84 248 C 130 240, 150 220, 180 200 S 230 160, 260 130 S 290 100, 304 88"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Bars */}
      {[0, 1, 2, 3, 4].map((i) => {
        const h = 36 + i * 22;
        return (
          <rect
            key={i}
            x={98 + i * 38}
            y={248 - h}
            width="18"
            height={h}
            rx="5"
            fill="currentColor"
            fillOpacity={0.12 + i * 0.06}
          />
        );
      })}

      {/* Calculator pad */}
      <rect
        x="348"
        y="96"
        width="108"
        height="168"
        rx="14"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <rect
        x="362"
        y="112"
        width="80"
        height="28"
        rx="8"
        fill="var(--brand-soft)"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <rect
            key={i}
            x={362 + col * 28}
            y={156 + row * 28}
            width="22"
            height="22"
            rx="6"
            fill="color-mix(in srgb, var(--surface-2) 85%, transparent)"
            stroke="var(--border)"
          />
        );
      })}
    </svg>
  );
}

type Props = {
  variant: "learn" | "tools";
  title: string;
  eyebrow: string;
  body: string;
};

/** One-screen coming-soon layout: copy + product sketch + CTA band. */
export function MarketingComingSoon({
  variant,
  title,
  eyebrow,
  body,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-[qtFade_0.45s_ease]">
      <div className="mx-auto grid w-full max-w-5xl min-h-0 flex-1 grid-cols-1 items-center gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
        <header className="max-w-xl space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-lg font-medium tracking-tight text-[var(--brand-text)] sm:text-xl">
            {eyebrow}
          </p>
          <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {body}
          </p>
        </header>

        <div
          className="relative mx-auto w-full max-w-md min-h-[200px] sm:min-h-[240px] lg:mx-0 lg:max-w-none lg:min-h-[280px]"
          aria-hidden
        >
          {variant === "learn" ? <LearnVisual /> : <ToolsVisual />}
        </div>
      </div>
      <MarketingCtaBand compact />
    </div>
  );
}
