import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

const CONTACT_EMAIL = "172993974@qq.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  // 用导语做描述：比「作者寄语」这类标题更有信息量，也更适合搜索结果摘要。
  const lead = t("lead");
  return buildPageMetadata(locale, "/about", {
    title: t("title"),
    description: lead.length > 180 ? `${lead.slice(0, 178)}…` : lead,
  });
}

/** 章节骨架：桌面端左侧固定小节标题，右侧正文，滚动时标题吸附。 */
function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border)] pt-6 sm:pt-8">
      <div className="lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[var(--brand-text)]">
            {index}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h2>
        </div>
        <div className="mt-4 min-w-0 lg:mt-0">{children}</div>
      </div>
    </section>
  );
}

export default async function AboutPage({ params }: Props) {
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  const principles = [1, 2, 3, 4].map((i) => ({
    title: t(`principle${i}Title` as "principle1Title"),
    body: t(`principle${i}Body` as "principle1Body"),
  }));

  const boundaries = [1, 2, 3, 4].map((i) => t(`boundary${i}` as "boundary1"));

  const roadmap = [1, 2, 3].map((i) => ({
    title: t(`roadmap${i}Title` as "roadmap1Title"),
    body: t(`roadmap${i}Body` as "roadmap1Body"),
  }));

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-[qtFade_0.45s_ease]">
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
          {/* 标题固定，只有下面的内容区滚动 */}
          <header className="shrink-0 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
              {t("subtitle")}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </header>

          <div className="relative mt-4 flex min-h-0 flex-1 flex-col sm:mt-5">
            <div
              className="qt-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%)",
              }}
            >
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-[var(--foreground)] sm:mb-6 sm:text-[15px] sm:leading-7">
                {t("lead")}
              </p>
              <div className="space-y-6 pb-2 sm:space-y-8">
                {/* 01 缘起 */}
                <Section index="01" title={t("originTitle")}>
                  <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-[var(--foreground)] sm:text-[15px] sm:leading-7">
                    <p>{t("p1")}</p>
                    <blockquote className="border-l-2 border-[var(--brand-text)] pl-4 text-base font-medium leading-relaxed tracking-tight text-[var(--foreground)] sm:text-lg sm:leading-8">
                      {t("quote")}
                    </blockquote>
                    <p>{t("originP2")}</p>
                    <p>{t("originP4")}</p>
                    <p>{t("originP5")}</p>
                    <p>{t("originP6")}</p>
                    <p>{t("originP3")}</p>
                  </div>
                </Section>

                {/* 02 原则 */}
                <Section index="02" title={t("principlesTitle")}>
                  <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                    {t("principlesLead")}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {principles.map((item, i) => (
                      <article key={item.title} className="qt-panel p-4 sm:p-5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--brand-text)]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-semibold tracking-tight">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                          {item.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </Section>

                {/* 03 边界 */}
                <Section index="03" title={t("boundaryTitle")}>
                  <div className="qt-panel overflow-hidden">
                    <ol className="divide-y divide-[var(--border)]">
                      {boundaries.map((text, i) => (
                        <li
                          key={text}
                          className="flex gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
                        >
                          <span
                            aria-hidden
                            className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-[var(--muted)]"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm leading-relaxed text-[var(--foreground)] sm:leading-6">
                            {text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <p
                    className="mt-3 rounded-lg px-3 py-2.5 text-xs leading-relaxed sm:text-sm"
                    style={{
                      background: "color-mix(in srgb, #f59e0b 12%, transparent)",
                      color: "color-mix(in srgb, #b45309 90%, var(--foreground))",
                    }}
                    role="note"
                  >
                    {t("mainlandNotice")}
                  </p>
                </Section>

                {/* 04 路线 */}
                <Section index="04" title={t("roadmapTitle")}>
                  <div className="qt-panel overflow-hidden">
                    <ol className="divide-y divide-[var(--border)]">
                      {roadmap.map((item, i) => (
                        <li
                          key={item.title}
                          className="flex gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
                        >
                          <span
                            aria-hidden
                            className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-[var(--brand-text)]"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold tracking-tight">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                              {item.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Section>

                {/* 05 支持与联系 */}
                <Section index="05" title={t("supportTitle")}>
                  <div className="space-y-5">
                    <div className="space-y-2 text-sm leading-relaxed text-[var(--foreground)]">
                      <p>{t("p2")}</p>
                      <p>{t("p3")}</p>
                      <p className="text-xs text-[var(--muted)] sm:text-sm">
                        {t("p4")}
                      </p>
                    </div>

                    <div className="qt-panel space-y-5 p-5 sm:p-6">
                      <div>
                        <h3 className="text-base font-semibold">
                          {t("contactTitle")}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {t("contactEmailLabel")}{" "}
                          <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="font-medium text-[var(--brand-text)] underline-offset-2 hover:underline"
                          >
                            {CONTACT_EMAIL}
                          </a>
                        </p>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <figure className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                          <Image
                            src="/about/wechat-qr.jpg"
                            alt={t("wechatQrAlt")}
                            width={200}
                            height={200}
                            className="h-[200px] w-[200px] rounded-lg bg-white object-contain"
                            unoptimized
                          />
                          <figcaption className="text-sm font-medium">
                            {t("wechat")}
                          </figcaption>
                        </figure>
                        <figure className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                          <Image
                            src="/about/alipay-qr.jpg"
                            alt={t("alipayQrAlt")}
                            width={200}
                            height={200}
                            className="h-[200px] w-[200px] rounded-lg bg-white object-contain"
                            unoptimized
                          />
                          <figcaption className="text-sm font-medium">
                            {t("alipay")}
                          </figcaption>
                        </figure>
                      </div>
                      <p className="text-xs text-[var(--muted)]">{t("qrHint")}</p>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>
        <MarketingCtaBand compact />
      </div>
    </ScopedMessages>
  );
}
