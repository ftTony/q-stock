import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { SectionDots } from "@/components/marketing/marketing-section-dots";
import { LabEquityChart } from "@/components/marketing/lab-equity-chart";
import {
  LAB_SAMPLE,
  LAB_SAMPLE_ALT,
} from "@/lib/marketing/lab-sample";

const SECTION = "mx-auto w-full max-w-5xl px-4 sm:px-6";
const CARD =
  "rounded-2xl border border-[var(--border)] bg-[var(--panel)]";

/**
 * 与首页同源的整屏版式：每段至少占一屏（减去 3.5rem 顶栏），内容垂直居中，
 * 父级 <main> 是 `snap-y snap-mandatory` 滚动容器，滚一次换一屏。
 *
 * 不用 `snap-always`：移动端首屏等内容可能高于一屏，强制吸附会把超出部分
 * 卡住看不到；`snap-start` 已能保证正常段落停在屏首。
 */
const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start flex-col justify-center pb-16 pt-12";

/** 末屏：出口 + 页脚带贴底，页脚不再单独占一个吸附点（同首页故事屏）。 */
const SCREEN_LAST =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start flex-col pt-12";

function pct(v: number, digits = 2) {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

/** 涨跌语义色：跟站内 `--up` / `--down` 一致（中/日/韩红涨，其余绿涨）。 */
function changeColor(v: number) {
  return v >= 0 ? "text-[var(--up)]" : "text-[var(--down)]";
}

function MetricCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[var(--border)]/70 px-2.5 py-2">
      <span className="block text-[10.5px] text-[var(--muted)]">{label}</span>
      <b
        className={`mt-0.5 block text-[13px] font-semibold tabular-nums ${tone ?? ""}`}
      >
        {value}
      </b>
    </div>
  );
}

/** 真实回放结果卡。所有数字来自 LAB_SAMPLE（runReplay 实跑）。 */
async function SampleReplayCard() {
  const t = await getTranslations("lab");
  const m = LAB_SAMPLE.metrics;

  return (
    <div className={`overflow-hidden ${CARD}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]/70 px-4 py-3">
        <strong className="text-[13px] font-semibold">{t("card.title")}</strong>
        <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--brand-text)]">
          {t("card.tag")}
        </span>
      </div>

      <div className="px-4 pt-3.5">
        <dl className="grid gap-2.5 sm:grid-cols-2">
          <div className="min-w-0 rounded-[10px] border border-[var(--border)]/70 px-2.5 py-2">
            <dt className="text-[10.5px] text-[var(--muted)]">
              {t("card.ruleLabel")}
            </dt>
            <dd className="mt-0.5 text-xs font-semibold">
              {t("card.ruleValue")}
            </dd>
          </div>
          <div className="min-w-0 rounded-[10px] border border-[var(--border)]/70 px-2.5 py-2">
            <dt className="text-[10.5px] text-[var(--muted)]">
              {t("card.symbolLabel")}
            </dt>
            <dd className="mt-0.5 text-xs font-semibold tabular-nums">
              {LAB_SAMPLE.rangeFrom} → {LAB_SAMPLE.rangeTo}
              <span className="ml-1.5 font-normal text-[var(--muted)]">
                {t("card.barsValue", { bars: LAB_SAMPLE.bars })}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-2.5">
        <MetricCell
          label={t("card.return")}
          value={pct(m.totalReturnPct)}
          tone={changeColor(m.totalReturnPct)}
        />
        <MetricCell
          label={t("card.buyHold")}
          value={pct(m.buyHoldReturnPct)}
          tone={changeColor(m.buyHoldReturnPct)}
        />
        <MetricCell label={t("card.maxDd")} value={`−${m.maxDrawdownPct.toFixed(2)}%`} />
        <MetricCell
          label={t("card.winRate")}
          value={`${m.winRate.toFixed(1)}%`}
        />
        <MetricCell
          label={t("card.trades")}
          value={String(m.tradeCount)}
        />
        <MetricCell label={t("card.sharpe")} value={m.sharpeRatio.toFixed(2)} />
      </div>

      <div className="mt-3 px-2">
        <LabEquityChart
          ruleLabel={t("card.legendRule")}
          buyHoldLabel={t("card.legendBuyHold")}
          ariaLabel={t("card.chartAria")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-2 text-[10.5px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-0.5 w-4 rounded-full bg-[var(--brand-text)]" />
          {t("card.legendRule")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-0.5 w-4 rounded-full border-t border-dashed border-[var(--muted)]" />
          {t("card.legendBuyHold")}
        </span>
      </div>

      <p className="border-t border-[var(--border)]/70 px-4 py-2.5 text-[10.5px] leading-relaxed text-[var(--muted)]">
        {t("card.footNote", { slip: LAB_SAMPLE.slipBps })}
      </p>
    </div>
  );
}

const READ_POINTS = ["benchmark", "drawdown", "winrate"] as const;
const LIMITS = ["sample", "survivor", "cost", "regime"] as const;

/** `/lab` 落地页：四段（边界屏内含 CTA 出口），服务端渲染。 */
export async function LabLanding() {
  const t = await getTranslations("lab");
  const m = LAB_SAMPLE.metrics;

  const dots = [
    { id: "hero", label: t("dots.hero") },
    { id: "read", label: t("dots.read") },
    { id: "window", label: t("dots.window") },
    { id: "limits", label: t("dots.limits") },
  ];

  return (
    <>
      <SectionDots navLabel={t("dots.nav")} items={dots} />

      {/* 01 · 首屏：主张 + 真实回放结果卡 */}
      <section id="hero" className={SCREEN}>
        <div className={SECTION}>
          <div className="grid items-start gap-9 lg:grid-cols-[1fr_0.95fr] lg:gap-12">
            <div className="min-w-0">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {t("hero.eyebrow")}
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  {t("hero.title")}
                </h1>
              </Reveal>
              <Reveal delay={130}>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
                  {t("hero.lede")}
                </p>
              </Reveal>
              <Reveal delay={190}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/strategies" className="qt-btn qt-btn-primary h-11 px-5 text-sm">
                    {t("hero.ctaPrimary")}
                  </Link>
                  <a
                    href="#limits"
                    className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                  >
                    {t("hero.ctaSecondary")}
                  </a>
                </div>
              </Reveal>
              <Reveal delay={250}>
                <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted)]">
                  {t("hero.note")}
                </p>
              </Reveal>
            </div>

            <Reveal delay={120} className="min-w-0">
              <SampleReplayCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 02 · 怎么读一份回放 */}
      <section
        id="read"
        className={`${SCREEN} border-y border-[var(--border)]`}
        style={{ background: "color-mix(in srgb, var(--panel) 40%, transparent)" }}
      >
        <div className={SECTION}>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {t("read.eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("read.title", { winRate: m.winRate.toFixed(0) })}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              {t("read.body", {
                trades: m.tradeCount,
                winRate: m.winRate.toFixed(0),
                ratio: m.avgWinLossRatio.toFixed(1),
                edge: (m.totalReturnPct - m.buyHoldReturnPct).toFixed(1),
                dd: m.maxDrawdownPct.toFixed(1),
              })}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {READ_POINTS.map((key, i) => (
              <Reveal key={key} delay={160 + i * 60}>
                <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-text)]">
                    {t(`read.points.${key}.kicker`)}
                  </p>
                  <strong className="mt-1.5 block text-sm font-semibold tracking-tight">
                    {t(`read.points.${key}.title`)}
                  </strong>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                    {t(`read.points.${key}.body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03 · 换一个区间，结论就变 */}
      <section id="window" className={SCREEN}>
        <div className={SECTION}>
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="min-w-0">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {t("window.eyebrow")}
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("window.title")}
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {t("window.body", {
                    from: LAB_SAMPLE_ALT.rangeFrom,
                    to: LAB_SAMPLE_ALT.rangeTo,
                    ret: pct(LAB_SAMPLE_ALT.totalReturnPct),
                    bh: pct(LAB_SAMPLE_ALT.buyHoldReturnPct),
                    bars: LAB_SAMPLE_ALT.bars,
                  })}
                </p>
              </Reveal>
            </div>

            <Reveal delay={140} className="min-w-0">
              <div className={`overflow-hidden ${CARD}`}>
                <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 border-b border-[var(--border)]/70 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  <span />
                  <span className="text-right tabular-nums">
                    {t("window.colA")}
                  </span>
                  <span className="text-right tabular-nums">
                    {t("window.colB")}
                  </span>
                </div>
                {(
                  [
                    ["return", pct(m.totalReturnPct), pct(LAB_SAMPLE_ALT.totalReturnPct)],
                    ["buyHold", pct(m.buyHoldReturnPct), pct(LAB_SAMPLE_ALT.buyHoldReturnPct)],
                    ["maxDd", `−${m.maxDrawdownPct.toFixed(2)}%`, `−${LAB_SAMPLE_ALT.maxDrawdownPct.toFixed(2)}%`],
                    ["winRate", `${m.winRate.toFixed(1)}%`, `${LAB_SAMPLE_ALT.winRate.toFixed(1)}%`],
                    ["trades", String(m.tradeCount), String(LAB_SAMPLE_ALT.tradeCount)],
                  ] as const
                ).map(([key, a, b], i) => (
                  <div
                    key={key}
                    className={`grid grid-cols-[1.1fr_1fr_1fr] gap-2 px-4 py-2.5 text-[12.5px] tabular-nums ${
                      i > 0 ? "border-t border-[var(--border)]/50" : ""
                    }`}
                  >
                    <span className="text-[var(--muted)]">
                      {t(`window.rows.${key}`)}
                    </span>
                    <b
                      className={`text-right font-semibold ${
                        key === "return" || key === "buyHold" ? changeColor(parseFloat(a)) : ""
                      }`}
                    >
                      {a}
                    </b>
                    <b
                      className={`text-right font-semibold ${
                        key === "return" || key === "buyHold" ? changeColor(parseFloat(b)) : ""
                      }`}
                    >
                      {b}
                    </b>
                  </div>
                ))}
                <p className="border-t border-[var(--border)]/70 px-4 py-2.5 text-[10.5px] leading-relaxed text-[var(--muted)]">
                  {t("window.footNote")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 · 边界 + 出口：CTA 卡跟在边界卡后面，末屏不再单独占一个吸附点 */}
      <section
        id="limits"
        className={`${SCREEN_LAST} border-t border-[var(--border)]`}
        style={{ background: "color-mix(in srgb, var(--panel) 40%, transparent)" }}
      >
        <div className="flex flex-1 flex-col justify-center">
          <div className={SECTION}>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {t("limit.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("limit.title")}
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {LIMITS.map((key, i) => (
                <Reveal key={key} delay={120 + i * 60}>
                  <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
                    <strong className="block text-sm font-semibold tracking-tight">
                      {t(`limit.items.${key}.title`)}
                    </strong>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                      {t(`limit.items.${key}.body`)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={380}>
              <div className="mt-9 rounded-3xl border border-[var(--border)] bg-[var(--panel)] px-5 py-8 text-center sm:px-10">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t("cta.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                  {t("cta.body")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/strategies" className="qt-btn qt-btn-primary h-11 px-5 text-sm">
                    {t("cta.primary")}
                  </Link>
                  <Link href="/learn" className="qt-btn qt-btn-ghost h-11 px-5 text-sm">
                    {t("cta.secondary")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="w-full shrink-0">
          <MarketingCtaBand compact />
        </div>
      </section>
    </>
  );
}
