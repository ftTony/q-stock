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

function DepositVisual() {
  return (
    <Frame id="dep">
      <path d="M44 96 H284" stroke="currentColor" strokeOpacity="0.16" />
      {/* 本金基线：利息太薄，本金线几乎与终值线重合，正是这个工具要说的事 */}
      <path
        d="M48 72 H280"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeDasharray="5 4"
      />
      <path
        d="M48 70 C 120 68, 190 64, 280 58"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M48 70 C 120 68, 190 64, 280 58 L 280 72 H48 Z"
        fill="url(#dep-fill)"
      />
      <rect
        x="48"
        y="28"
        width="76"
        height="24"
        rx="8"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.28"
      />
      <rect x="58" y="37" width="44" height="6" rx="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="248" cy="102" r="11" fill="var(--panel)" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M242 102 H254" stroke="currentColor" strokeOpacity="0.4" />
    </Frame>
  );
}

function PensionVisual() {
  return (
    <Frame id="pen">
      {/* 两根堆叠条：基础养老金 + 个人账户，比例约 1:1 是常见结构 */}
      <rect x="44" y="40" width="150" height="18" rx="6" fill="var(--brand)" fillOpacity="0.7" />
      <rect x="194" y="40" width="88" height="18" rx="6" fill="currentColor" fillOpacity="0.22" />
      <rect x="44" y="66" width="104" height="10" rx="5" fill="currentColor" fillOpacity="0.12" />
      <rect x="156" y="66" width="60" height="10" rx="5" fill="currentColor" fillOpacity="0.12" />
      {/* 退休年龄柱：越晚退休，柱子越高但根数越少 */}
      <path d="M44 106 H284" stroke="currentColor" strokeOpacity="0.16" />
      {[
        { x: 44, h: 14 },
        { x: 88, h: 20 },
        { x: 132, h: 26 },
        { x: 176, h: 33 },
        { x: 220, h: 41 },
        { x: 264, h: 50 },
      ].map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={106 - b.h}
          width="20"
          height={b.h}
          rx="4"
          fill="currentColor"
          fillOpacity={0.16 + i * 0.09}
          stroke="currentColor"
          strokeOpacity="0.24"
        />
      ))}
    </Frame>
  );
}

function DividendTaxVisual() {
  const rows = [
    { y: 34, ratio: 1 },
    { y: 56, ratio: 0.8 },
    { y: 78, ratio: 0.72 },
    { y: 100, ratio: 0.7 },
  ];
  return (
    <Frame id="dtx">
      {rows.map((r, i) => (
        <g key={r.y}>
          <rect
            x="44"
            y={r.y}
            width="240"
            height="14"
            rx="7"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <rect
            x="44"
            y={r.y}
            width={240 * r.ratio}
            height="14"
            rx="7"
            fill={i === 0 ? "var(--brand)" : "currentColor"}
            fillOpacity={i === 0 ? 0.72 : 0.26 + i * 0.03}
          />
        </g>
      ))}
      {/* 第一根上标出税开始扣的位置：两条短竖线，示意被扣掉的那一截 */}
      <path d="M216 30 V52" stroke="currentColor" strokeOpacity="0.45" strokeDasharray="3 3" />
      <path d="M236 30 V52" stroke="currentColor" strokeOpacity="0.45" strokeDasharray="3 3" />
    </Frame>
  );
}

function RetirementVisual() {
  return (
    <Frame id="ret">
      {/* 累积期上升、退休后转为支出：峰值即为「够不够」的那一点 */}
      <path d="M44 106 H284" stroke="currentColor" strokeOpacity="0.16" />
      <path
        d="M44 100 C 88 92, 120 78, 158 60 S 210 40, 232 36"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <path
        d="M44 100 C 88 92, 120 78, 158 60 S 210 40, 232 36 C 250 44, 264 62, 276 86"
        stroke="var(--brand)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M44 100 C 88 92, 120 78, 158 60 S 210 40, 232 36 C 250 44, 264 62, 276 86 L 276 106 L 44 106 Z"
        fill="url(#ret-fill)"
      />
      <path
        d="M232 24 V104"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeDasharray="3 3"
      />
      <circle cx="232" cy="36" r="4.5" fill="var(--brand)" />
      <rect
        x="196"
        y="86"
        width="52"
        height="16"
        rx="8"
        fill="var(--brand-soft)"
        stroke="currentColor"
        strokeOpacity="0.22"
      />
    </Frame>
  );
}

const VISUALS: Record<ToolSlug, () => React.ReactNode> = {
  position: PositionVisual,
  "risk-reward": RiskRewardVisual,
  dca: DcaVisual,
  compound: CompoundVisual,
  retirement: RetirementVisual,
  deposit: DepositVisual,
  "dividend-tax": DividendTaxVisual,
  pension: PensionVisual,
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
