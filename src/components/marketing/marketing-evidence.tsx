import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/marketing/reveal";

const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col justify-center pb-20 pt-12";

const ITEMS = ["replay", "invalidate", "share"] as const;

function ScrollHint({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="mkt-chevron absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </a>
  );
}

/** 静态示意图：这里刻意画一条固定曲线，不冒充真实回放结果。 */
function ReplayChart() {
  return (
    <svg
      className="h-[118px] w-full text-[var(--brand-text)]"
      viewBox="0 0 460 118"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect x="0" y="0" width="460" height="118" fill="transparent" />
      {[28, 62, 96].map((y) => (
        <line
          key={y}
          x1="0"
          x2="460"
          y1={y}
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      ))}
      <polyline
        points="0,88 26,84 52,90 78,78 104,82 130,70 156,74 182,60 208,66 234,54 260,58 286,44 312,50 338,38 364,44 390,32 416,36 442,26 460,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <polyline
        points="0,88 26,84 52,90 78,78 104,82 130,70 156,74 182,60 208,66 234,54 260,58 286,44 312,50 338,38 364,44 390,32 416,36 442,26 460,30 460,118 0,118"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="none"
      />
      <circle cx="130" cy="70" r="3" fill="var(--up)" />
      <circle cx="286" cy="44" r="3" fill="var(--down)" />
    </svg>
  );
}

/** 「证据」屏：服务端组件，只把入场动画交给客户端 `Reveal`。 */
export async function MarketingEvidenceScreen() {
  const t = await getTranslations("marketing");

  return (
    <section
      id="evidence"
      className={SCREEN}
      style={{ background: "color-mix(in srgb, var(--panel) 40%, transparent)" }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <div className="min-w-0">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
                {t("evidenceEyebrow")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t("evidenceTitle")}
              </h2>
            </Reveal>
            <ul className="mt-7 grid gap-3.5">
              {ITEMS.map((key, i) => (
                <Reveal key={key} delay={150 + i * 70}>
                  <li className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-sm font-semibold text-[var(--brand-text)]">
                      ·
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-semibold tracking-tight sm:text-[15px]">
                        {t(`evidenceItems.${key}.title`)}
                      </strong>
                      <span className="mt-1 block text-[13px] leading-relaxed text-[var(--muted)]">
                        {t(`evidenceItems.${key}.body`)}
                      </span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={180} className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
              <div className="flex items-center justify-between border-b border-[var(--border)]/70 px-4 py-3">
                <strong className="text-[13px] font-semibold">
                  {t("evidenceCard.title")}
                </strong>
                <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--brand-text)]">
                  {t("evidenceCard.tag")}
                </span>
              </div>

              <div className="px-4 pt-3.5">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    ["assetLabel", "assetValue"],
                    ["rangeLabel", "rangeValue"],
                    ["tfLabel", "tfValue"],
                  ].map(([labelKey, valueKey]) => (
                    <div
                      key={labelKey}
                      className="min-w-0 rounded-[10px] border border-[var(--border)]/70 px-2.5 py-2"
                    >
                      <span className="block text-[10.5px] text-[var(--muted)]">
                        {t(`evidenceCard.${labelKey}`)}
                      </span>
                      <b className="mt-0.5 block text-xs font-semibold tabular-nums sm:whitespace-nowrap">
                        {t(`evidenceCard.${valueKey}`)}
                      </b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 px-1">
                <ReplayChart />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--border)]/70 px-4 py-3">
                <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                  {t("evidenceCard.note")}
                </p>
                <Link
                  href="/strategies"
                  className="shrink-0 text-[11.5px] font-medium text-[var(--brand-text)]"
                >
                  {t("evidenceCard.cta")} →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <ScrollHint href="#deploy" label={t("scrollNext")} />
    </section>
  );
}
