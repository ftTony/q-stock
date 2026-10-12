import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LearnArticleView } from "@/components/learn/learn-article-view";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  getLearnArticle,
  learnText,
  listLearnArticles,
} from "@/lib/learn/articles";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return listLearnArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) {
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
  });
}

export default async function LearnArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = getLearnArticle(slug);
  if (!article) notFound();

  const t = await getTranslations("learn");
  const title = learnText(locale, article.title);
  const summary = learnText(locale, article.summary);
  const paragraphs = learnText(locale, article.paragraphs);

  const related = listLearnArticles()
    .filter((a) => a.slug !== slug)
    .filter((a) => a.category === article.category)
    .slice(0, 4)
    .map((a) => ({
      slug: a.slug,
      title: learnText(locale, a.title),
      categoryLabel: t(`categories.${a.category}`),
    }));

  const relatedFallback =
    related.length > 0
      ? related
      : listLearnArticles()
          .filter((a) => a.slug !== slug)
          .slice(0, 4)
          .map((a) => ({
            slug: a.slug,
            title: learnText(locale, a.title),
            categoryLabel: t(`categories.${a.category}`),
          }));

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <LearnArticleView
            title={title}
            summary={summary}
            categoryLabel={t(`categories.${article.category}`)}
            paragraphs={paragraphs}
            ctaHref={article.ctaHref}
            related={relatedFallback}
          />
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
