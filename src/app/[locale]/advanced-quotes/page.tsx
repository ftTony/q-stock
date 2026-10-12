import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingAdvancedQuotes } from "@/components/marketing/marketing-advanced-quotes";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "advancedQuotes" });
  return buildPageMetadata(locale, "/advanced-quotes", {
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function AdvancedQuotesPage({ params }: Props) {
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("advancedQuotes");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <MarketingAdvancedQuotes
        title={t("title")}
        subtitle={t("subtitle")}
        statusTitle={t("statusTitle")}
        statusBody={t("statusBody")}
        whatTitle={t("whatTitle")}
        whatItems={[t("what1"), t("what2"), t("what3"), t("what4")]}
        whyTitle={t("whyTitle")}
        whyItems={[t("why1"), t("why2"), t("why3"), t("why4")]}
        compareTitle={t("compareTitle")}
        basicLabel={t("basicLabel")}
        basicItems={[t("basic1"), t("basic2"), t("basic3")]}
        advancedLabel={t("advancedLabel")}
        advancedItems={[t("advanced1"), t("advanced2"), t("advanced3")]}
        buyTitle={t("buyTitle")}
        buyBody={t("buyBody")}
        buyCta={t("buyCta")}
        footnote={t("footnote")}
      />
    </ScopedMessages>
  );
}
