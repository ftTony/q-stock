import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LearnArticleList } from "@/components/learn/learn-article-list";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { Link } from "@/i18n/routing";
import {
  LEARN_CATEGORIES,
  learnText,
  listLearnArticles,
} from "@/lib/learn/articles";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

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

  const articles = listLearnArticles().map((a) => ({
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

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6 animate-[qtFade_0.45s_ease]">
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

          <LearnArticleList articles={articles} labels={labels} />
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
