import type { ToolSlug } from "@/lib/tools/catalog";

function Frame({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 320 140"
      className="h-full w-full text-[var(--brand-text)]"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="10"
        width="304"
        height="120"
        rx="18"
        fill="color-mix(in srgb, var(--brand) 8%, var(--surface-2))"
        stroke="var(--border)"
      />
      {children}
    </svg>
  );
}

function PositionVisual() {
  return (
    <Frame id="pos">
      <rect x="28" y="32" width="112" height="76" rx="12" fill="var(--panel)" stroke="currentColor" strokeOpacity="0.28" />
      <rect x="40" y="46" width="88" height="8" rx="4" fill="currentColor" fillOpacity="0.18" />
      <rect x="40" y="62" width="56" height="8" rx="4" fill="currentColor" fillOpacity="0.28" />
      <rect x="40" y="78" width="72" height="8" rx="4" fill="var(--brand)" fillOpacity="0.55" />
      <path d="M168 96 V44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M176 88 H276" stroke="currentColor" strokeOpacity="0.18" />
      <path d="M176 68 H248" stroke="currentColor" strokeOpacity="0.18" />
      <path d="M176 48 H228" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="228" cy="48" r="4" fill="currentColor" />
      <rect x="248" y="78" width="44" height="22" rx="8" fill="var(--brand-soft)" stroke="currentColor" strokeOpacity="0.25" />
    </Frame>
  );
}

function DcaVisual() {
  return (
    <Frame id="dca">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={36 + i * 42}
          y={88 - i * 14}
          width="28"
          height={18 + i * 14}
          rx="6"
          fill="currentColor"
          fillOpacity={0.12 + i * 0.08}
          stroke="currentColor"
          strokeOpacity="0.28"
        />
      ))}
      <path
        d="M198 96 C 214 88, 226 70, 244 62 S 276 58, 292 40"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M198 96 C 214 88, 226 70, 244 62 S 276 58, 292 40 L 292 96 Z"
        fill="url(#dca-fill)"
      />
      <circle cx="52" cy="40" r="10" fill="var(--panel)" stroke="currentColor" strokeOpacity="0.4" />
      <circle cx="66" cy="40" r="10" fill="var(--panel)" stroke="currentColor" strokeOpacity="0.4" />
      <circle cx="80" cy="40" r="10" fill="var(--brand-soft)" stroke="currentColor" strokeOpacity="0.45" />
    </Frame>
  );
}

function CompoundVisual() {
  return (
    <Frame id="cmp">
      <path
        d="M36 96 H284"
        stroke="currentColor"
        strokeOpacity="0.16"
      />
      <path
        d="M44 92 C 88 90, 120 86, 148 72 S 210 36, 284 24"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M44 92 C 88 90, 120 86, 148 72 S 210 36, 284 24 L 284 96 H44 Z"
        fill="url(#cmp-fill)"
      />
      <circle cx="148" cy="72" r="4" fill="currentColor" />
      <circle cx="220" cy="38" r="4.5" fill="currentColor" />
      <rect x="44" y="28" width="64" height="22" rx="8" fill="var(--panel)" stroke="currentColor" strokeOpacity="0.25" />
      <rect x="52" y="36" width="36" height="6" rx="3" fill="currentColor" fillOpacity="0.28" />
    </Frame>
  );
}

function OptionsVisual() {
  return (
    <Frame id="opt">
      <path d="M40 78 H280" stroke="currentColor" strokeOpacity="0.16" />
      <path d="M40 28 V112" stroke="currentColor" strokeOpacity="0.16" />
      <path
        d="M56 92 H148 L268 32"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M148 92 L268 32 L268 92 Z"
        fill="url(#opt-fill)"
      />
      <circle cx="148" cy="92" r="4.5" fill="currentColor" />
      <line
        x1="148"
        y1="28"
        x2="148"
        y2="112"
        stroke="var(--brand-text)"
        strokeDasharray="3 3"
        strokeOpacity="0.55"
      />
    </Frame>
  );
}

function MortgageVisual() {
  return (
    <Frame id="mtg">
      <path d="M40 100 H280" stroke="currentColor" strokeOpacity="0.16" />
      <path
        d="M48 36 L96 24 L144 36 V88 H48 Z"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeLinejoin="round"
      />
      <rect
        x="72"
        y="58"
        width="24"
        height="30"
        rx="4"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
      <path
        d="M168 92 C 196 88, 220 70, 248 52 S 276 36, 292 28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M168 92 C 196 88, 220 70, 248 52 S 276 36, 292 28 L 292 100 H168 Z"
        fill="url(#mtg-fill)"
      />
      <circle cx="220" cy="62" r="4" fill="currentColor" />
    </Frame>
  );
}

function RiskRewardVisual() {
  return (
    <Frame id="rr">
      <path d="M40 88 H280" stroke="currentColor" strokeOpacity="0.16" />
      <path d="M88 28 V112" stroke="currentColor" strokeOpacity="0.16" />
      <path
        d="M88 88 L148 88"
        stroke="var(--down)"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M148 88 L268 40"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="148" cy="88" r="5" fill="currentColor" />
      <circle cx="88" cy="88" r="4" fill="var(--down)" fillOpacity="0.7" />
      <circle cx="268" cy="40" r="4.5" fill="currentColor" />
      <rect
        x="200"
        y="92"
        width="72"
        height="22"
        rx="8"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
    </Frame>
  );
}

const VISUALS: Record<ToolSlug, () => React.ReactNode> = {
  position: PositionVisual,
  "risk-reward": RiskRewardVisual,
  dca: DcaVisual,
  compound: CompoundVisual,
  options: OptionsVisual,
  mortgage: MortgageVisual,
};

export function ToolCardVisual({ slug }: { slug: ToolSlug }) {
  const Visual = VISUALS[slug];
  return (
    <div className="mb-3 overflow-hidden rounded-xl" aria-hidden>
      <Visual />
    </div>
  );
}
