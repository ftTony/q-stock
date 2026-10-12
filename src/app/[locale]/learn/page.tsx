import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingComingSoon } from "@/components/marketing/marketing-coming-soon";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  return buildPageMetadata(locale, "/learn", {
    title: t("title"),
    description: t("comingSoonBody"),
  });
}

export default async function LearnIndexPage({ params }: Props) {
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("learn");

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <MarketingComingSoon
        variant="learn"
        title={t("title")}
        eyebrow={t("comingSoon")}
        body={t("comingSoonBody")}
      />
    </ScopedMessages>
  );
}
