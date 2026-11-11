import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LearnArticleView } from "@/components/learn/learn-article-view";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  getLearnArticle,
  learnText,
  listLearnArticleCards,
  listLearnSlugs,
} from "@/lib/learn/articles";
import { isLearnArticleAvailable } from "@/lib/learn/locale-gating";
import { pickRelatedLearnArticles } from "@/lib/learn/related-articles";
import {
  getLearnSeriesForSlug,
  learnSeriesText,
} from "@/lib/learn/series";
import { learnArticleJsonLd } from "@/lib/seo/article-json-ld";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return listLearnSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getLearnArticle(slug);
  if (!article || !isLearnArticleAvailable(slug, locale)) {
    return buildPageMetadata(locale, `/learn/${slug}`, {
      title: "Learn",
      robots: { index: false, follow: false },
    });
  }
  const title = learnText(locale, article.title);
  const description = learnText(locale, article.summary);
  return buildPageMetadata(locale, `/learn/${slug}`, {
    title,
    description,
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      section: article.category,
    },
  });
}

export default async function LearnArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = getLearnArticle(slug);
  if (!article || !isLearnArticleAvailable(slug, locale)) notFound();

  const t = await getTranslations("learn");
  const title = learnText(locale, article.title);
  const summary = learnText(locale, article.summary);
  const paragraphs = learnText(locale, article.paragraphs);
  const sections = article.sections
    ? learnText(locale, article.sections)
    : undefined;
  const faq = article.faq ? learnText(locale, article.faq) : undefined;
  const links = article.links ? learnText(locale, article.links) : undefined;
  const sourceNote = article.sourceNote
    ? learnText(locale, article.sourceNote)
    : undefined;
  const jsonLd = learnArticleJsonLd({
    locale,
    slug,
    title,
    description: summary,
    categoryLabel: t(`categories.${article.category}`),
    author: article.author,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    faq,
  });

  const cards = listLearnArticleCards().filter((a) =>
    isLearnArticleAvailable(a.slug, locale),
  );
  const seriesDef = getLearnSeriesForSlug(slug);
  const seriesNav = seriesDef
    ? {
        seriesTitle: learnSeriesText(locale, seriesDef.title),
        currentSlug: slug,
        items: seriesDef.slugs
          .filter((s) => isLearnArticleAvailable(s, locale))
          .map((s, i) => {
            const card = cards.find((c) => c.slug === s);
            const toc = seriesDef.tocTitle?.[s];
            return {
              slug: s,
              index: i + 1,
              label: toc
                ? learnSeriesText(locale, toc)
                : card
                  ? learnText(locale, card.title)
                  : s,
            };
          }),
      }
    : null;

  const related = pickRelatedLearnArticles({
    slug,
    locale,
    cards,
    categoryLabel: (category) => t(`categories.${category}`),
    limit: 4,
  });

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <script
        type="application/ld+json"
        // Server-rendered JSON-LD; content is authored in-repo, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${seriesNav ? "max-w-7xl" : "max-w-5xl"}`}
        >
          <LearnArticleView
            title={title}
            summary={summary}
            categoryLabel={t(`categories.${article.category}`)}
            paragraphs={paragraphs}
            sections={sections}
            faq={faq}
            links={links}
            sourceNote={sourceNote}
            author={article.author}
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            illustrationSlug={slug}
            locale={locale}
            ctaHref={article.ctaHref}
            related={related}
            series={seriesNav}
          />
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
