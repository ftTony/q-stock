import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LearnArticleList } from "@/components/learn/learn-article-list";
import {
  LearnSeriesCompact,
  LearnSeriesSpotlight,
} from "@/components/learn/learn-series-home";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { Link } from "@/i18n/routing";
import {
  LEARN_CATEGORIES,
  learnText,
  listLearnArticleCards,
} from "@/lib/learn/articles";
import { isLearnArticleAvailable } from "@/lib/learn/locale-gating";
import { LEARN_SERIES, learnSeriesText } from "@/lib/learn/series";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

/** Product loop first; mindset second. Rest collapse under「更多课程」. */
const FEATURED_SERIES_IDS = ["stocks", "mindset"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  return buildPageMetadata(locale, "/learn", {
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function LearnIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("learn");
  const categoryLabels = Object.fromEntries(
    LEARN_CATEGORIES.map((key) => [key, t(`categories.${key}`)]),
  ) as Record<(typeof LEARN_CATEGORIES)[number], string>;

  const articles = listLearnArticleCards()
    .filter((a) => isLearnArticleAvailable(a.slug, locale))
    .map((a) => ({
      slug: a.slug,
      category: a.category,
      categoryLabel: categoryLabels[a.category],
      title: learnText(locale, a.title),
      summary: learnText(locale, a.summary),
    }));

  const labels = {
    filterAll: t("filterAll"),
    emptyFilter: t("emptyFilter"),
    categories: categoryLabels,
  };

  const seriesBlocks = LEARN_SERIES.map((series) => {
    const items = series.slugs
      .filter((s) => isLearnArticleAvailable(s, locale))
      .map((s, i) => {
        const card = articles.find((a) => a.slug === s);
        const toc = series.tocTitle?.[s];
        return {
          slug: s,
          index: i + 1,
          label: toc ? learnSeriesText(locale, toc) : (card?.title ?? s),
        };
      });
    if (!items.length) return null;
    return {
      id: series.id,
      seriesTitle: learnSeriesText(locale, series.title),
      hint: learnSeriesText(locale, series.blurb),
      items,
      startHref: `/learn/${items[0]!.slug}`,
    };
  }).filter((b): b is NonNullable<typeof b> => Boolean(b));

  const featuredIds = new Set<string>(FEATURED_SERIES_IDS);
  const featured = FEATURED_SERIES_IDS.map((id) =>
    seriesBlocks.find((b) => b.id === id),
  ).filter((b): b is NonNullable<typeof b> => Boolean(b));
  const more = seriesBlocks.filter((b) => !featuredIds.has(b.id));

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 animate-[qtFade_0.45s_ease]">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{t("subtitle")}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t("disclaimer")}{" "}
              <Link
                href="/disclaimer"
                className="underline-offset-2 hover:underline"
              >
                {t("disclaimerLink")}
              </Link>
            </p>
          </div>

          {featured.length > 0 ? (
            <section className="space-y-3" aria-labelledby="learn-paths">
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id="learn-paths"
                  className="text-sm font-semibold tracking-tight text-[var(--foreground)]"
                >
                  {t("seriesPathsTitle")}
                </h2>
                <a
                  href="#learn-articles"
                  className="text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--brand-text)] hover:underline"
                >
                  {t("jumpToArticles")}
                </a>
              </div>
              <div className="space-y-4">
                {featured.map((block) => (
                  <LearnSeriesSpotlight
                    key={block.id}
                    catalogTitle={t("seriesCatalog")}
                    seriesTitle={block.seriesTitle}
                    hint={block.hint}
                    startLabel={t("seriesStart")}
                    startHref={block.startHref}
                    items={block.items}
                    lessonCountLabel={t("seriesLessonCount", {
                      count: block.items.length,
                    })}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {more.length > 0 ? (
            <section className="space-y-3" aria-labelledby="learn-more-paths">
              <h2
                id="learn-more-paths"
                className="text-sm font-semibold tracking-tight text-[var(--foreground)]"
              >
                {t("seriesMoreTitle")}
              </h2>
              <div className="space-y-2">
                {more.map((block) => (
                  <LearnSeriesCompact
                    key={block.id}
                    seriesTitle={block.seriesTitle}
                    hint={block.hint}
                    startLabel={t("seriesStart")}
                    startHref={block.startHref}
                    items={block.items}
                    lessonCountLabel={t("seriesLessonCount", {
                      count: block.items.length,
                    })}
                    expandLabel={t("seriesExpandLessons")}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section
            id="learn-articles"
            className="scroll-mt-20 space-y-3"
            aria-labelledby="learn-articles-heading"
          >
            <h2
              id="learn-articles-heading"
              className="text-sm font-semibold tracking-tight text-[var(--foreground)]"
            >
              {t("articlesTitle")}
            </h2>
            <LearnArticleList articles={articles} labels={labels} />
          </section>
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
