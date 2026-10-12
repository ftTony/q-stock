import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";

const CONTACT_EMAIL = "172993974@qq.com";

type Props = {
  title: string;
  subtitle: string;
  statusTitle: string;
  statusBody: string;
  whatTitle: string;
  whatItems: string[];
  whyTitle: string;
  whyItems: string[];
  compareTitle: string;
  basicLabel: string;
  basicItems: string[];
  advancedLabel: string;
  advancedItems: string[];
  buyTitle: string;
  buyBody: string;
  buyCta: string;
  footnote: string;
};

/** Basic quotes mock: single last price + thin sparkline. */
function BasicQuoteVisual() {
  return (
    <svg
      viewBox="0 0 360 200"
      className="h-auto w-full text-[var(--muted)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="344"
        height="184"
        rx="16"
        fill="color-mix(in srgb, var(--surface-2) 70%, var(--panel))"
        stroke="var(--border)"
      />
      <text
        x="28"
        y="40"
        fill="currentColor"
        fontSize="11"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        LV1
      </text>
      <text
        x="28"
        y="72"
        fill="var(--foreground)"
        fontSize="22"
        fontWeight="600"
        fontFamily="var(--font-geist-mono), monospace"
      >
        186.42
      </text>
      <text
        x="120"
        y="72"
        fill="var(--up)"
        fontSize="13"
        fontFamily="var(--font-geist-mono), monospace"
      >
        +1.24%
      </text>
      <text
        x="28"
        y="96"
        fill="currentColor"
        fontSize="11"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        Vol 12.4M
      </text>
      <path
        d="M28 150 C 70 146, 90 158, 120 140 S 180 120, 220 128 S 280 118, 332 112"
        stroke="var(--brand-text)"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="332" cy="112" r="3.5" fill="var(--brand-text)" fillOpacity="0.55" />
      {/* Empty depth hint */}
      <rect
        x="240"
        y="36"
        width="92"
        height="52"
        rx="8"
        stroke="var(--border)"
        strokeDasharray="4 3"
        fill="transparent"
      />
      <text
        x="286"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        —
      </text>
    </svg>
  );
}

/** Advanced quotes mock: multi-level book + ticks. */
function AdvancedQuoteVisual() {
  const bids = [
    { p: "186.40", s: "12.2" },
    { p: "186.38", s: "8.4" },
    { p: "186.35", s: "21.0" },
    { p: "186.30", s: "6.1" },
    { p: "186.28", s: "15.7" },
  ];
  const asks = [
    { p: "186.42", s: "9.8" },
    { p: "186.45", s: "14.3" },
    { p: "186.48", s: "7.2" },
    { p: "186.50", s: "18.6" },
    { p: "186.55", s: "11.1" },
  ];

  return (
    <svg
      viewBox="0 0 360 200"
      className="h-auto w-full text-[var(--brand-text)]"
      fill="none"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="344"
        height="184"
        rx="16"
        fill="color-mix(in srgb, var(--brand) 6%, var(--panel))"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <text
        x="28"
        y="36"
        fill="currentColor"
        fontSize="11"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        LV2
      </text>
      <text
        x="60"
        y="36"
        fill="var(--foreground)"
        fontSize="12"
        fontWeight="600"
        fontFamily="var(--font-geist-mono), monospace"
      >
        186.42
      </text>

      {/* Bid / ask columns */}
      <text
        x="28"
        y="58"
        fill="var(--up)"
        fontSize="10"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        Bid
      </text>
      <text
        x="190"
        y="58"
        fill="var(--down)"
        fontSize="10"
        fontFamily="var(--font-geist-sans), sans-serif"
      >
        Ask
      </text>

      {bids.map((row, i) => {
        const y = 74 + i * 18;
        const w = 36 + i * 14;
        return (
          <g key={`b-${i}`}>
            <rect
              x={28}
              y={y - 10}
              width={w}
              height="14"
              rx="3"
              fill="var(--up)"
              fillOpacity={0.12 + i * 0.04}
            />
            <text
              x="32"
              y={y}
              fill="var(--up)"
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {row.p}
            </text>
            <text
              x="110"
              y={y}
              fill="var(--muted)"
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {row.s}
            </text>
          </g>
        );
      })}

      {asks.map((row, i) => {
        const y = 74 + i * 18;
        const w = 40 + (4 - i) * 12;
        return (
          <g key={`a-${i}`}>
            <rect
              x={190}
              y={y - 10}
              width={w}
              height="14"
              rx="3"
              fill="var(--down)"
              fillOpacity={0.12 + i * 0.04}
            />
            <text
              x="194"
              y={y}
              fill="var(--down)"
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {row.p}
            </text>
            <text
              x="280"
              y={y}
              fill="var(--muted)"
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {row.s}
            </text>
          </g>
        );
      })}

      {/* Tick tape */}
      <rect
        x="28"
        y="168"
        width="304"
        height="14"
        rx="4"
        fill="color-mix(in srgb, var(--surface-2) 80%, transparent)"
      />
      <text
        x="36"
        y="178"
        fill="var(--muted)"
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        ticks 186.42×200 · 186.40×500 · 186.43×120
      </text>
    </svg>
  );
}

function BulletList({
  items,
  accent = false,
}: {
  items: string[];
  accent?: boolean;
}) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            aria-hidden
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
              accent ? "bg-[var(--brand-text)]" : "bg-[var(--muted)]"
            }`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Scrollable intro: LV1 vs LV2 visuals, status, purchase CTA. */
export function MarketingAdvancedQuotes({
  title,
  subtitle,
  statusTitle,
  statusBody,
  whatTitle,
  whatItems,
  whyTitle,
  whyItems,
  compareTitle,
  basicLabel,
  basicItems,
  advancedLabel,
  advancedItems,
  buyTitle,
  buyBody,
  buyCta,
  footnote,
}: Props) {
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "钱力股 · 高级行情咨询",
  )}`;

  return (
    <div className="flex min-h-dvh flex-col animate-[qtFade_0.45s_ease]">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {subtitle}
          </p>
        </header>

        <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
          <aside
            className="rounded-2xl border border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5"
            style={{
              background: "color-mix(in srgb, var(--brand) 8%, var(--panel))",
            }}
            role="status"
          >
            <p className="text-sm font-semibold text-[var(--brand-text)]">
              {statusTitle}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)]">
              {statusBody}
            </p>
          </aside>

          <section className="qt-panel p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{whatTitle}</h2>
            <BulletList items={whatItems} accent />
          </section>

          <section className="qt-panel p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{whyTitle}</h2>
            <BulletList items={whyItems} accent />
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">
              {compareTitle}
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-5">
              <article className="qt-panel overflow-hidden">
                <div className="border-b border-[var(--border)] px-4 pt-4 sm:px-5 sm:pt-5">
                  <BasicQuoteVisual />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {basicLabel}
                  </p>
                  <BulletList items={basicItems} />
                </div>
              </article>

              <article
                className="overflow-hidden rounded-2xl border border-[var(--brand-text)]"
                style={{
                  background:
                    "color-mix(in srgb, var(--brand) 6%, var(--panel))",
                }}
              >
                <div className="border-b border-[var(--border)] px-4 pt-4 sm:px-5 sm:pt-5">
                  <AdvancedQuoteVisual />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-sm font-semibold text-[var(--brand-text)]">
                    {advancedLabel}
                  </p>
                  <BulletList items={advancedItems} accent />
                </div>
              </article>
            </div>
          </section>

          <section className="qt-panel p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{buyTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              {buyBody}
            </p>
            <a
              href={mailHref}
              className="qt-btn qt-btn-primary mt-5 inline-flex h-11 items-center justify-center px-5 text-sm"
            >
              {buyCta}
            </a>
            <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
              {footnote}
            </p>
          </section>
        </div>
      </div>
      <MarketingCtaBand />
    </div>
  );
}
