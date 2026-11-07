import { getTranslations } from "next-intl/server";
import { LearnArticleBody } from "@/components/learn/learn-article-body";
import { LearnShare } from "@/components/learn/learn-share";
import { Link } from "@/i18n/routing";
import type { LearnBlock, LearnFaqItem, LearnLink } from "@/lib/learn/types";

export type LearnRelatedArticle = {
  slug: string;
  title: string;
  categoryLabel: string;
};

type Props = {
  title: string;
  summary: string;
  categoryLabel: string;
  paragraphs: string[];
  sections?: LearnBlock[];
  faq?: LearnFaqItem[];
  links?: LearnLink[];
  sourceNote?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  illustrationSlug?: string;
  locale: string;
  ctaHref?: string;
  related: LearnRelatedArticle[];
};

export async function LearnArticleView({
  title,
  summary,
  categoryLabel,
  paragraphs,
  sections,
  faq,
  links,
  sourceNote,
  author,
  publishedAt,
  updatedAt,
  illustrationSlug,
  locale,
  ctaHref,
  related,
}: Props) {
  const t = await getTranslations("learn");
  const ui = locale.startsWith("zh")
    ? {
        by: "作者",
        updated: "最后更新",
        faq: "常见问题",
        links: "相关工具与页面",
        note: "数据口径与来源",
      }
    : {
        by: "By",
        updated: "Last updated",
        faq: "FAQ",
        links: "Related tools & pages",
        note: "Data & method",
      };
  const dateline = [author ? `${ui.by} ${author}` : null, updatedAt ?? publishedAt]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full animate-[qtFade_0.45s_ease]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8 xl:gap-10">
        {/* Main editorial column */}
        <article
          className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)]"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--brand) 5%, var(--panel)), var(--panel) 28%)",
          }}
        >
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-8 sm:py-5">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
              <Link
                href="/learn"
                className="font-medium text-[var(--brand-text)] hover:underline"
              >
                {t("title")}
              </Link>
              <span aria-hidden>/</span>
              <span>{categoryLabel}</span>
              <span aria-hidden className="hidden sm:inline">
                /
              </span>
              <span className="hidden max-w-[14rem] truncate sm:inline">
                {title}
              </span>
            </nav>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  background: "var(--brand-soft)",
                  color: "var(--brand-text)",
                }}
              >
                {categoryLabel}
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                {t("readingNote")}
              </span>
            </div>

            <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl sm:leading-tight">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-[15px] sm:leading-7">
              {summary}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {dateline ? (
                <p className="text-[11px] text-[var(--muted)]">{dateline}</p>
              ) : (
                <span aria-hidden />
              )}
              <LearnShare title={title} locale={locale} />
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <LearnArticleBody
              paragraphs={paragraphs}
              sections={sections}
              illustrationSlug={illustrationSlug}
              locale={locale}
            />

            {faq && faq.length > 0 ? (
              <section className="mt-10 max-w-2xl border-t border-[var(--border)] pt-6">
                <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                  {ui.faq}
                </h2>
                <dl className="mt-4 space-y-4">
                  {faq.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <dt className="text-[15px] font-medium leading-7 text-[var(--foreground)]">
                        {item.q}
                      </dt>
                      <dd className="text-[15px] leading-7 text-[var(--foreground)]/85">
                        {item.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {links && links.length > 0 ? (
              <section className="mt-8 max-w-2xl">
                <h2 className="text-sm font-semibold tracking-tight">
                  {ui.links}
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-medium transition-colors hover:border-[var(--brand)]/40 hover:text-[var(--brand-text)]"
                      >
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span aria-hidden className="text-[var(--muted)]">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sourceNote ? (
              <p className="mt-8 max-w-2xl rounded-xl border-l-[3px] px-4 py-3 text-[12px] leading-6 text-[var(--muted)]"
                style={{
                  borderColor: "var(--border)",
                  background:
                    "color-mix(in srgb, var(--surface-2) 60%, transparent)",
                }}
              >
                <span className="font-medium">{ui.note}：</span>
                {sourceNote}
              </p>
            ) : null}

            <LearnShare title={title} locale={locale} variant="bar" />
          </div>

          <div
            className="border-t border-[var(--border)] px-5 py-4 sm:px-8 sm:py-5 lg:hidden"
            style={{
              background: "color-mix(in srgb, var(--surface-2) 55%, transparent)",
            }}
          >
            <PracticeBlock
              heading={t("practiceTitle")}
              tryInApp={t("tryInApp")}
              ctaOpen={t("ctaOpen")}
              ctaMarkets={t("ctaMarkets")}
              ctaReadingList={t("ctaReadingList")}
              disclaimer={t("disclaimer")}
              disclaimerLink={t("disclaimerLink")}
              ctaHref={ctaHref}
            />
          </div>
        </article>

        {/* Side rail */}
        <aside className="hidden space-y-4 lg:sticky lg:top-[4.5rem] lg:block">
          <div
            className="overflow-hidden rounded-2xl border border-[var(--border)]"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--brand) 10%, var(--panel)), var(--panel))",
            }}
          >
            <div className="border-b border-[var(--border)] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text)]">
                {t("practiceTitle")}
              </p>
            </div>
            <div className="space-y-4 p-5">
              <PracticeBlock
                tryInApp={t("tryInApp")}
                ctaOpen={t("ctaOpen")}
                ctaMarkets={t("ctaMarkets")}
                ctaReadingList={t("ctaReadingList")}
                disclaimer={t("disclaimer")}
                disclaimerLink={t("disclaimerLink")}
                ctaHref={ctaHref}
              />
            </div>
          </div>

          {related.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t("relatedTitle")}
              </p>
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/learn/${item.slug}`}
                      className="group flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-[11px] text-[var(--muted)]">
                        {item.categoryLabel}
                      </span>
                      <span className="text-sm font-medium leading-snug group-hover:text-[var(--brand-text)]">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-8 lg:hidden">
          <h2 className="text-sm font-semibold tracking-tight">
            {t("relatedTitle")}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/learn/${item.slug}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--brand)]/40"
                >
                  <p className="text-[11px] text-[var(--muted)]">
                    {item.categoryLabel}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PracticeBlock({
  heading,
  tryInApp,
  ctaOpen,
  ctaMarkets,
  ctaReadingList,
  disclaimer,
  disclaimerLink,
  ctaHref,
}: {
  heading?: string;
  tryInApp: string;
  ctaOpen: string;
  ctaMarkets: string;
  ctaReadingList: string;
  disclaimer: string;
  disclaimerLink: string;
  ctaHref?: string;
}) {
  return (
    <div className="space-y-3">
      {heading ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text)]">
          {heading}
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        {tryInApp}
      </p>
      <div className="flex flex-col gap-2">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className="qt-btn qt-btn-primary h-10 w-full justify-center px-4 text-sm"
          >
            {ctaOpen}
          </Link>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/markets"
            className="qt-btn h-10 justify-center px-3 text-sm"
          >
            {ctaMarkets}
          </Link>
          <Link
            href="/learn/reading-list"
            className="qt-btn h-10 justify-center px-3 text-sm"
          >
            {ctaReadingList}
          </Link>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        {disclaimer}{" "}
        <Link href="/disclaimer" className="underline-offset-2 hover:underline">
          {disclaimerLink}
        </Link>
      </p>
    </div>
  );
}
